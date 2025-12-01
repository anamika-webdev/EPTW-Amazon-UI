// backend/src/routes/users.routes.js - FIXED FOR YOUR DATABASE SCHEMA
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// GET /api/users/workers
router.get('/workers', async (req, res) => {
  try {
    console.log('📥 Fetching workers from admin database...');
    
    // REMOVED department and contact columns that don't exist
    const [workers] = await pool.query(`
      SELECT 
        id,
        login_id,
        full_name,
        email,
        role,
        is_active,
        created_at
      FROM users
      WHERE (role = 'Requester' OR role = 'Worker') 
        AND is_active = TRUE
      ORDER BY full_name ASC
    `);
    
    console.log(`✅ Fetched ${workers.length} workers`);
    
    res.json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error('❌ Error fetching workers:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching workers',
      error: error.message
    });
  }
});

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const { role, department_id, is_active } = req.query;
    
    console.log('📥 Fetching users with filters:', { role, department_id, is_active });
    
    // SIMPLIFIED - only select columns that exist
    let query = `
      SELECT 
        u.id,
        u.login_id,
        u.full_name,
        u.email,
        u.role,
        u.department_id,
        u.is_active,
        u.created_at
      FROM users u
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filter by role
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }
    
    // Filter by department
    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }
    
    // Filter by active status
    if (is_active !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(is_active === 'true' || is_active === true ? 1 : 0);
    } else {
      // Default: only active users
      query += ' AND u.is_active = TRUE';
    }
    
    query += ' ORDER BY u.full_name ASC';
    
    const [users] = await pool.query(query, params);
    
    console.log(`✅ Fetched ${users.length} users`);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query(`
      SELECT 
        id,
        login_id,
        full_name,
        email,
        role,
        department_id,
        is_active,
        created_at
      FROM users
      WHERE id = ?
    `, [id]);
    
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
    console.error('❌ Error fetching user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

module.exports = router;