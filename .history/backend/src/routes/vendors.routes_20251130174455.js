// backend/src/routes/vendors.routes.js - FIXED FOR YOUR DATABASE SCHEMA
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching vendors...');
    
    // REMOVED license_number column that doesn't exist
    const [vendors] = await pool.query(`
      SELECT 
        id,
        company_name,
        contact_person,
        phone,
        email,
        is_active,
        created_at
      FROM vendors
      WHERE is_active = TRUE
      ORDER BY company_name ASC
    `);
    
    console.log(`✅ Fetched ${vendors.length} vendors`);
    
    res.json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error.message);
    
    // If vendors table doesn't exist, return empty array
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('⚠️ Vendors table does not exist');
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
});

// GET /api/vendors/:id
router.get('/:id', async (req, res) => {
  try {
    const [vendors] = await pool.query(
      'SELECT * FROM vendors WHERE id = ?',
      [req.params.id]
    );
    
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      data: vendors[0]
    });
  } catch (error) {
    console.error('❌ Error fetching vendor:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
});

module.exports = router;