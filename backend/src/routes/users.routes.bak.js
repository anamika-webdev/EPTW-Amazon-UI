
// backend/src/routes/users.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/users/workers - Get all workers
router.get('/workers', async (req, res) => {
  try {
    const [workers] = await pool.query(`
      SELECT 
        id,
        login_id,
        full_name,
        email,
        role,
        department,
        created_at
      FROM users
      WHERE role = 'Requester' OR role = 'Worker'
      ORDER BY full_name ASC
    `);
    
    res.json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workers',
      error: error.message
    });
  }
});

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = `
      SELECT 
        id,
        login_id,
        full_name,
        email,
        role,
        department,
        created_at
      FROM users
    `;
    
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY full_name ASC';
    
    const [users] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

module.exports = router;
