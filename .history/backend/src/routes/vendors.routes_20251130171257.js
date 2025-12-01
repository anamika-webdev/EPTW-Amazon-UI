// backend/src/routes/vendors.routes.js - NEW FILE
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// GET /api/vendors - Get all vendors
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching vendors...');
    
    const [vendors] = await pool.query(`
      SELECT 
        id,
        company_name,
        contact_person,
        phone,
        email,
        license_number,
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
    console.error('❌ Error fetching vendors:', error);
    
    // If vendors table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('⚠️ Vendors table does not exist, returning empty array');
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

// GET /api/vendors/:id - Get vendor by ID
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
    console.error('❌ Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
});

// POST /api/vendors - Create new vendor (admin only)
router.post('/', async (req, res) => {
  try {
    const { company_name, contact_person, phone, email, license_number } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO vendors (company_name, contact_person, phone, email, license_number, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [company_name, contact_person, phone, email, license_number]
    );
    
    res.json({
      success: true,
      data: {
        id: result.insertId,
        company_name,
        contact_person,
        phone,
        email,
        license_number,
        is_active: true
      }
    });
  } catch (error) {
    console.error('❌ Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor',
      error: error.message
    });
  }
});

// PUT /api/vendors/:id - Update vendor (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { company_name, contact_person, phone, email, license_number } = req.body;
    
    await pool.query(
      'UPDATE vendors SET company_name = ?, contact_person = ?, phone = ?, email = ?, license_number = ? WHERE id = ?',
      [company_name, contact_person, phone, email, license_number, req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message
    });
  }
});

// DELETE /api/vendors/:id - Delete vendor (admin only)
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE vendors SET is_active = FALSE WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message
    });
  }
});

module.exports = router;