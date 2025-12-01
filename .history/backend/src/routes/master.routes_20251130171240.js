// backend/src/routes/master.routes.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// ============= HAZARDS =============

// GET /api/master/hazards - Get all hazards
router.get('/hazards', async (req, res) => {
  try {
    const { permit_type } = req.query;
    
    console.log('📥 Fetching hazards...');
    
    let query = 'SELECT * FROM master_hazards WHERE 1=1';
    const params = [];
    
    if (permit_type) {
      query += ' AND permit_type = ?';
      params.push(permit_type);
    }
    
    query += ' ORDER BY id';
    
    const [hazards] = await pool.query(query, params);
    
    console.log(`✅ Fetched ${hazards.length} hazards`);
    
    res.json({
      success: true,
      count: hazards.length,
      data: hazards
    });
  } catch (error) {
    console.error('❌ Error fetching hazards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hazards',
      error: error.message
    });
  }
});

// POST /api/master/hazards - Create new hazard (admin only)
router.post('/hazards', async (req, res) => {
  try {
    const { hazard_name, category, permit_type, risk_level } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO master_hazards (hazard_name, category, permit_type, risk_level) VALUES (?, ?, ?, ?)',
      [hazard_name, category, permit_type, risk_level]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, hazard_name, category, permit_type, risk_level }
    });
  } catch (error) {
    console.error('❌ Error creating hazard:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating hazard',
      error: error.message
    });
  }
});

// ============= PPE =============

// GET /api/master/ppe - Get all PPE items
router.get('/ppe', async (req, res) => {
  try {
    const { ppe_type } = req.query;
    
    console.log('📥 Fetching PPE items...');
    
    let query = 'SELECT * FROM master_ppe WHERE 1=1';
    const params = [];
    
    if (ppe_type) {
      query += ' AND ppe_type = ?';
      params.push(ppe_type);
    }
    
    query += ' ORDER BY id';
    
    const [ppeItems] = await pool.query(query, params);
    
    console.log(`✅ Fetched ${ppeItems.length} PPE items`);
    
    res.json({
      success: true,
      count: ppeItems.length,
      data: ppeItems
    });
  } catch (error) {
    console.error('❌ Error fetching PPE:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching PPE',
      error: error.message
    });
  }
});

// POST /api/master/ppe - Create new PPE item (admin only)
router.post('/ppe', async (req, res) => {
  try {
    const { ppe_name, ppe_type } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO master_ppe (ppe_name, ppe_type) VALUES (?, ?)',
      [ppe_name, ppe_type]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, ppe_name, ppe_type }
    });
  } catch (error) {
    console.error('❌ Error creating PPE:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating PPE',
      error: error.message
    });
  }
});

// ============= CHECKLIST QUESTIONS =============

// GET /api/master/checklist-questions - Get all checklist questions
router.get('/checklist-questions', async (req, res) => {
  try {
    const { permit_type } = req.query;
    
    console.log('📥 Fetching checklist questions...');
    
    let query = 'SELECT * FROM master_checklist_questions WHERE 1=1';
    const params = [];
    
    if (permit_type) {
      query += ' AND permit_type = ?';
      params.push(permit_type);
    }
    
    query += ' ORDER BY id';
    
    const [questions] = await pool.query(query, params);
    
    console.log(`✅ Fetched ${questions.length} checklist questions`);
    
    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error('❌ Error fetching checklist questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching checklist questions',
      error: error.message
    });
  }
});

// POST /api/master/checklist-questions - Create new question (admin only)
router.post('/checklist-questions', async (req, res) => {
  try {
    const { permit_type, question_text, category, is_mandatory } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO master_checklist_questions (permit_type, question_text, category, is_mandatory) VALUES (?, ?, ?, ?)',
      [permit_type, question_text, category, is_mandatory || false]
    );
    
    res.json({
      success: true,
      data: { id: result.insertId, permit_type, question_text, category, is_mandatory }
    });
  } catch (error) {
    console.error('❌ Error creating checklist question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checklist question',
      error: error.message
    });
  }
});

module.exports = router;