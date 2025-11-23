const db = require('../config/database');
const logger = require('../utils/logger');
const moment = require('moment');

// Generate permit serial number
const generatePermitSerial = async (siteCode, permitType) => {
  const year = new Date().getFullYear();
  const typeCode = permitType.substring(0, 2).toUpperCase();
  
  // Get count of permits for this type and year
  const [count] = await db.query(`
    SELECT COUNT(*) as count FROM permits 
    WHERE permit_type = ? AND YEAR(created_at) = ?
  `, [permitType, year]);
  
  const sequence = String(count[0].count + 1).padStart(4, '0');
  return `${siteCode}-${typeCode}-${year}-${sequence}`;
};

// Get all permits
exports.getAllPermits = async (req, res) => {
  try {
    const [permits] = await db.query(`
      SELECT p.*, s.name as site_name, u.full_name as created_by_name,
             v.company_name as vendor_name
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get all permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits'
    });
  }
};

// Get permit by ID with full details
exports.getPermitById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get permit details
    const [permits] = await db.query(`
      SELECT p.*, s.name as site_name, s.site_code,
             u.full_name as created_by_name, u.email as created_by_email,
             v.company_name as vendor_name, v.contact_person as vendor_contact
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = ?
    `, [id]);

    if (permits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    const permit = permits[0];

    // Get team members
    const [teamMembers] = await db.query(`
      SELECT * FROM permit_team_members WHERE permit_id = ?
    `, [id]);

    // Get hazards
    const [hazards] = await db.query(`
      SELECT ph.*, mh.name, mh.category, mh.icon_url
      FROM permit_hazards ph
      JOIN master_hazards mh ON ph.hazard_id = mh.id
      WHERE ph.permit_id = ?
    `, [id]);

    // Get PPE
    const [ppe] = await db.query(`
      SELECT pp.*, mp.name, mp.icon_url
      FROM permit_ppe pp
      JOIN master_ppe mp ON pp.ppe_id = mp.id
      WHERE pp.permit_id = ?
    `, [id]);

    // Get checklist responses
    const [checklist] = await db.query(`
      SELECT pcr.*, mcq.question_text, mcq.is_mandatory
      FROM permit_checklist_responses pcr
      JOIN master_checklist_questions mcq ON pcr.question_id = mcq.id
      WHERE pcr.permit_id = ?
    `, [id]);

    // Get approvals
    const [approvals] = await db.query(`
      SELECT pa.*, u.full_name as approver_name, u.email as approver_email
      FROM permit_approvals pa
      JOIN users u ON pa.approver_user_id = u.id
      WHERE pa.permit_id = ?
    `, [id]);

    // Get extensions
    const [extensions] = await db.query(`
      SELECT pe.*, u.full_name as requested_by_name,
             au.full_name as approved_by_name
      FROM permit_extensions pe
      LEFT JOIN users u ON pe.requested_by_user_id = u.id
      LEFT JOIN users au ON pe.approved_by_user_id = au.id
      WHERE pe.permit_id = ?
      ORDER BY pe.requested_at DESC
    `, [id]);

    // Get closure details
    const [closure] = await db.query(`
      SELECT pc.*, u.full_name as closed_by_name
      FROM permit_closure pc
      JOIN users u ON pc.closed_by_user_id = u.id
      WHERE pc.permit_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...permit,
        team_members: teamMembers,
        hazards: hazards,
        ppe: ppe,
        checklist: checklist,
        approvals: approvals,
        extensions: extensions,
        closure: closure.length > 0 ? closure[0] : null
      }
    });
  } catch (error) {
    logger.error('Get permit by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permit'
    });
  }
};

// Create new permit
exports.createPermit = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      site_id,
      vendor_id,
      permit_type,
      work_location,
      work_description,
      start_time,
      end_time,
      receiver_name,
      team_members = [],
      hazards = [],
      ppe = [],
      checklist = []
    } = req.body;

    // Validate required fields
    if (!site_id || !permit_type || !work_location || !work_description || !start_time || !end_time) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get site code
    const [sites] = await connection.query('SELECT site_code FROM sites WHERE id = ?', [site_id]);
    if (sites.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    // Generate permit serial
    const permit_serial = await generatePermitSerial(sites[0].site_code, permit_type);

    // Insert permit
    const [permitResult] = await connection.query(`
      INSERT INTO permits (
        permit_serial, site_id, created_by_user_id, vendor_id, permit_type,
        work_location, work_description, start_time, end_time, receiver_name,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', NOW(), NOW())
    `, [
      permit_serial, site_id, req.user.id, vendor_id, permit_type,
      work_location, work_description, start_time, end_time, receiver_name
    ]);

    const permitId = permitResult.insertId;

    // Insert team members
    if (team_members && team_members.length > 0) {
      for (const member of team_members) {
        await connection.query(`
          INSERT INTO permit_team_members (permit_id, worker_name, worker_role, badge_id, is_qualified)
          VALUES (?, ?, ?, ?, ?)
        `, [permitId, member.worker_name, member.worker_role, member.badge_id, member.is_qualified]);
      }
    }

    // Insert hazards
    if (hazards && hazards.length > 0) {
      for (const hazard of hazards) {
        await connection.query(`
          INSERT INTO permit_hazards (permit_id, hazard_id, mitigation)
          VALUES (?, ?, ?)
        `, [permitId, hazard.hazard_id, hazard.mitigation]);
      }
    }

    // Insert PPE
    if (ppe && ppe.length > 0) {
      for (const item of ppe) {
        await connection.query(`
          INSERT INTO permit_ppe (permit_id, ppe_id) VALUES (?, ?)
        `, [permitId, item.ppe_id || item]);
      }
    }

    // Insert checklist responses
    if (checklist && checklist.length > 0) {
      for (const item of checklist) {
        await connection.query(`
          INSERT INTO permit_checklist_responses (permit_id, question_id, response, remarks)
          VALUES (?, ?, ?, ?)
        `, [permitId, item.question_id, item.response, item.remarks]);
      }
    }

    await connection.commit();

    logger.info(`Permit created: ${permit_serial} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Permit created successfully',
      data: {
        id: permitId,
        permit_serial
      }
    });
  } catch (error) {
    await connection.rollback();
    logger.error('Create permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permit'
    });
  } finally {
    connection.release();
  }
};

// Update permit
exports.updatePermit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if permit exists and is editable
    const [permits] = await db.query(
      'SELECT status, created_by_user_id FROM permits WHERE id = ?',
      [id]
    );

    if (permits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    const permit = permits[0];

    // Only Draft permits can be edited by creator
    if (permit.status !== 'Draft' && permit.created_by_user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit permit in current status'
      });
    }

    const {
      work_location,
      work_description,
      start_time,
      end_time,
      receiver_name
    } = req.body;

    await db.query(`
      UPDATE permits 
      SET work_location = ?, work_description = ?, start_time = ?, 
          end_time = ?, receiver_name = ?, updated_at = NOW()
      WHERE id = ?
    `, [work_location, work_description, start_time, end_time, receiver_name, id]);

    logger.info(`Permit updated: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit updated successfully'
    });
  } catch (error) {
    logger.error('Update permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permit'
    });
  }
};

// Delete permit
exports.deletePermit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if permit exists and can be deleted
    const [permits] = await db.query(
      'SELECT status, created_by_user_id FROM permits WHERE id = ?',
      [id]
    );

    if (permits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    const permit = permits[0];

    // Only Draft permits can be deleted by creator or admin
    if (permit.status !== 'Draft') {
      return res.status(403).json({
        success: false,
        message: 'Only Draft permits can be deleted'
      });
    }

    if (permit.created_by_user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this permit'
      });
    }

    // Delete permit (cascade will handle related records if configured)
    await db.query('DELETE FROM permits WHERE id = ?', [id]);

    logger.info(`Permit deleted: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit deleted successfully'
    });
  } catch (error) {
    logger.error('Delete permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permit'
    });
  }
};

// Submit permit for approval
exports.submitPermit = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check permit status
    const [permits] = await connection.query(
      'SELECT status, created_by_user_id FROM permits WHERE id = ?',
      [id]
    );

    if (permits.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    if (permits[0].status !== 'Draft') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only Draft permits can be submitted'
      });
    }

    // Update permit status
    await connection.query(
      'UPDATE permits SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Pending_Approval', id]
    );

    // Create approval records for Area Manager and Safety Officer
    const approvers = ['Approver_AreaManager', 'Approver_Safety'];
    
    for (const role of approvers) {
      const [users] = await connection.query(
        'SELECT id FROM users WHERE role = ? LIMIT 1',
        [role]
      );
      
      if (users.length > 0) {
        await connection.query(`
          INSERT INTO permit_approvals (permit_id, approver_user_id, role, status)
          VALUES (?, ?, ?, 'Pending')
        `, [id, users[0].id, role === 'Approver_AreaManager' ? 'Area_Manager' : 'Safety_Officer']);
      }
    }

    await connection.commit();

    logger.info(`Permit submitted for approval: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit submitted for approval successfully'
    });
  } catch (error) {
    await connection.rollback();
    logger.error('Submit permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit permit'
    });
  } finally {
    connection.release();
  }
};

// Approve permit
exports.approvePermit = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comments, signature_path } = req.body;

    // Get approval record
    const [approvals] = await connection.query(`
      SELECT * FROM permit_approvals 
      WHERE permit_id = ? AND approver_user_id = ? AND status = 'Pending'
    `, [id, req.user.id]);

    if (approvals.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'No pending approval found for this user'
      });
    }

    // Update approval
    await connection.query(`
      UPDATE permit_approvals 
      SET status = 'Approved', comments = ?, signature_path = ?, approved_at = NOW()
      WHERE id = ?
    `, [comments, signature_path, approvals[0].id]);

    // Check if all approvals are complete
    const [pendingApprovals] = await connection.query(`
      SELECT COUNT(*) as count FROM permit_approvals 
      WHERE permit_id = ? AND status = 'Pending'
    `, [id]);

    // If all approved, set permit to Active
    if (pendingApprovals[0].count === 0) {
      await connection.query(
        'UPDATE permits SET status = ?, updated_at = NOW() WHERE id = ?',
        ['Active', id]
      );
    }

    await connection.commit();

    logger.info(`Permit approved: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit approved successfully'
    });
  } catch (error) {
    await connection.rollback();
    logger.error('Approve permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve permit'
    });
  } finally {
    connection.release();
  }
};

// Reject permit
exports.rejectPermit = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { comments, rejection_reason } = req.body;

    if (!rejection_reason) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Update approval
    await connection.query(`
      UPDATE permit_approvals 
      SET status = 'Rejected', comments = ?
      WHERE permit_id = ? AND approver_user_id = ?
    `, [comments, id, req.user.id]);

    // Update permit
    await connection.query(`
      UPDATE permits 
      SET status = 'Rejected', rejection_reason = ?, updated_at = NOW()
      WHERE id = ?
    `, [rejection_reason, id]);

    await connection.commit();

    logger.info(`Permit rejected: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit rejected'
    });
  } catch (error) {
    await connection.rollback();
    logger.error('Reject permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject permit'
    });
  } finally {
    connection.release();
  }
};

// Request extension
exports.requestExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_end_time, reason } = req.body;

    if (!new_end_time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'New end time and reason are required'
      });
    }

    // Check if permit is Active
    const [permits] = await db.query(
      'SELECT status FROM permits WHERE id = ?',
      [id]
    );

    if (permits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    if (permits[0].status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Only Active permits can be extended'
      });
    }

    // Insert extension request
    await db.query(`
      INSERT INTO permit_extensions (permit_id, requested_by_user_id, new_end_time, reason, status, requested_at)
      VALUES (?, ?, ?, ?, 'Pending', NOW())
    `, [id, req.user.id, new_end_time, reason]);

    // Update permit status
    await db.query(
      'UPDATE permits SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Extension_Requested', id]
    );

    logger.info(`Extension requested: Permit ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Extension request submitted successfully'
    });
  } catch (error) {
    logger.error('Request extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request extension'
    });
  }
};

// Approve extension
exports.approveExtension = async (req, res) => {
  try {
    const { id, extensionId } = req.params;
    const { comments } = req.body;

    // Update extension
    await db.query(`
      UPDATE permit_extensions 
      SET status = 'Approved', approved_by_user_id = ?, approval_comments = ?, approved_at = NOW()
      WHERE id = ? AND permit_id = ?
    `, [req.user.id, comments, extensionId, id]);

    // Get new end time
    const [extensions] = await db.query(
      'SELECT new_end_time FROM permit_extensions WHERE id = ?',
      [extensionId]
    );

    if (extensions.length > 0) {
      // Update permit with new end time
      await db.query(`
        UPDATE permits 
        SET end_time = ?, status = 'Active', updated_at = NOW()
        WHERE id = ?
      `, [extensions[0].new_end_time, id]);
    }

    logger.info(`Extension approved: Permit ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Extension approved successfully'
    });
  } catch (error) {
    logger.error('Approve extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve extension'
    });
  }
};

// Close permit
exports.closePermit = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { housekeeping_done, tools_removed, locks_removed, area_restored, remarks } = req.body;

    // Check if permit is Active
    const [permits] = await connection.query(
      'SELECT status FROM permits WHERE id = ?',
      [id]
    );

    if (permits.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }

    if (permits[0].status !== 'Active') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only Active permits can be closed'
      });
    }

    // Insert closure record
    await connection.query(`
      INSERT INTO permit_closure (
        permit_id, closed_at, closed_by_user_id, housekeeping_done,
        tools_removed, locks_removed, area_restored, remarks
      ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
    `, [id, req.user.id, housekeeping_done, tools_removed, locks_removed, area_restored, remarks]);

    // Update permit status
    await connection.query(
      'UPDATE permits SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Closed', id]
    );

    await connection.commit();

    logger.info(`Permit closed: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Permit closed successfully'
    });
  } catch (error) {
    await connection.rollback();
    logger.error('Close permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close permit'
    });
  } finally {
    connection.release();
  }
};

// Get permits by status
exports.getPermitsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const [permits] = await db.query(`
      SELECT p.*, s.name as site_name, u.full_name as created_by_name
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      WHERE p.status = ?
      ORDER BY p.created_at DESC
    `, [status]);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get permits by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits'
    });
  }
};

// Get user's permits
exports.getUserPermits = async (req, res) => {
  try {
    const [permits] = await db.query(`
      SELECT p.*, s.name as site_name
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      WHERE p.created_by_user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get user permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits'
    });
  }
};

// Get permits pending approval
exports.getPendingApprovals = async (req, res) => {
  try {
    const [permits] = await db.query(`
      SELECT DISTINCT p.*, s.name as site_name, u.full_name as created_by_name,
             pa.status as approval_status, pa.role as approver_role
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      JOIN permit_approvals pa ON p.id = pa.permit_id
      WHERE pa.approver_user_id = ? AND pa.status = 'Pending'
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals'
    });
  }
};