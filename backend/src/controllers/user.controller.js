const db = require('../config/database');
const logger = require('../utils/logger');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, login_id, full_name, email, role, department, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, login_id, full_name, email, role, department, signature_url, created_at 
      FROM users 
      WHERE id = ?
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { login_id, full_name, email, role, department } = req.body;

    // Validate required fields
    if (!login_id || !full_name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE login_id = ? OR email = ?',
      [login_id, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this login ID or email already exists'
      });
    }

    // Insert new user
    const [result] = await db.query(`
      INSERT INTO users (login_id, full_name, email, role, department, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [login_id, full_name, email, role, department]);

    logger.info(`User created: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        login_id,
        full_name,
        email,
        role,
        department
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, department } = req.body;

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    await db.query(`
      UPDATE users 
      SET full_name = ?, email = ?, role = ?, department = ?
      WHERE id = ?
    `, [full_name, email, role, department, id]);

    logger.info(`User updated: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    logger.info(`User deleted: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const [users] = await db.query(`
      SELECT id, login_id, full_name, email, role, department 
      FROM users 
      WHERE role = ?
      ORDER BY full_name
    `, [role]);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};