const db = require('../config/database');
const logger = require('../utils/logger');
const moment = require('moment');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total permits
    const [totalPermits] = await db.query('SELECT COUNT(*) as count FROM permits');

    // Active permits
    const [activePermits] = await db.query("SELECT COUNT(*) as count FROM permits WHERE status = 'Active'");

    // Pending approvals
    const [pendingApprovals] = await db.query("SELECT COUNT(*) as count FROM permits WHERE status = 'Pending_Approval'");

    // Closed today
    const [closedToday] = await db.query(`
      SELECT COUNT(*) as count FROM permits 
      WHERE status = 'Closed' AND DATE(updated_at) = CURDATE()
    `);

    // Expiring soon (within 24 hours)
    const [expiringSoon] = await db.query(`
      SELECT COUNT(*) as count FROM permits 
      WHERE status = 'Active' AND end_time <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
    `);

    // Monthly trend (last 6 months)
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM permits
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month
    `);

    res.json({
      success: true,
      data: {
        totalPermits: totalPermits[0].count,
        activePermits: activePermits[0].count,
        pendingApprovals: pendingApprovals[0].count,
        closedToday: closedToday[0].count,
        expiringSoon: expiringSoon[0].count,
        monthlyTrend: monthlyTrend
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Get permits by status count
exports.getPermitsByStatusCount = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM permits
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Get permits by status count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits by status'
    });
  }
};

// Get permits by type count
exports.getPermitsByTypeCount = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT permit_type, COUNT(*) as count
      FROM permits
      GROUP BY permit_type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Get permits by type count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits by type'
    });
  }
};

// Get permits by site
exports.getPermitsBySite = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT s.name as site_name, s.site_code, COUNT(p.id) as count
      FROM sites s
      LEFT JOIN permits p ON s.id = p.site_id
      GROUP BY s.id, s.name, s.site_code
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Get permits by site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permits by site'
    });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const [permits] = await db.query(`
      SELECT p.id, p.permit_serial, p.permit_type, p.status, p.work_location,
             p.created_at, p.updated_at,
             s.name as site_name,
             u.full_name as created_by_name
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      ORDER BY p.updated_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

// Get expiring permits
exports.getExpiringPermits = async (req, res) => {
  try {
    const hours = req.query.hours || 24;

    const [permits] = await db.query(`
      SELECT p.*, s.name as site_name, u.full_name as created_by_name,
             TIMESTAMPDIFF(HOUR, NOW(), p.end_time) as hours_remaining
      FROM permits p
      LEFT JOIN sites s ON p.site_id = s.id
      LEFT JOIN users u ON p.created_by_user_id = u.id
      WHERE p.status = 'Active' 
      AND p.end_time <= DATE_ADD(NOW(), INTERVAL ? HOUR)
      AND p.end_time > NOW()
      ORDER BY p.end_time ASC
    `, [parseInt(hours)]);

    res.json({
      success: true,
      data: permits
    });
  } catch (error) {
    logger.error('Get expiring permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring permits'
    });
  }
};