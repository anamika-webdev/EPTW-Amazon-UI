const db = require('../config/database');
const logger = require('../utils/logger');

// Get all hazards
exports.getAllHazards = async (req, res) => {
  try {
    const [hazards] = await db.query('SELECT * FROM master_hazards ORDER BY category, name');

    res.json({
      success: true,
      data: hazards
    });
  } catch (error) {
    logger.error('Get all hazards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hazards'
    });
  }
};

// Get hazard by ID
exports.getHazardById = async (req, res) => {
  try {
    const [hazards] = await db.query('SELECT * FROM master_hazards WHERE id = ?', [req.params.id]);

    if (hazards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }

    res.json({
      success: true,
      data: hazards[0]
    });
  } catch (error) {
    logger.error('Get hazard by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hazard'
    });
  }
};

// Get all PPE
exports.getAllPPE = async (req, res) => {
  try {
    const [ppe] = await db.query('SELECT * FROM master_ppe ORDER BY name');

    res.json({
      success: true,
      data: ppe
    });
  } catch (error) {
    logger.error('Get all PPE error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PPE'
    });
  }
};

// Get PPE by ID
exports.getPPEById = async (req, res) => {
  try {
    const [ppe] = await db.query('SELECT * FROM master_ppe WHERE id = ?', [req.params.id]);

    if (ppe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'PPE not found'
      });
    }

    res.json({
      success: true,
      data: ppe[0]
    });
  } catch (error) {
    logger.error('Get PPE by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PPE'
    });
  }
};

// Get all checklist questions
exports.getAllChecklistQuestions = async (req, res) => {
  try {
    const [questions] = await db.query('SELECT * FROM master_checklist_questions ORDER BY permit_type, id');

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    logger.error('Get all checklist questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checklist questions'
    });
  }
};

// Get checklist by permit type
exports.getChecklistByPermitType = async (req, res) => {
  try {
    const { permitType } = req.params;

    const [questions] = await db.query(`
      SELECT * FROM master_checklist_questions 
      WHERE permit_type = ? OR permit_type = 'General'
      ORDER BY is_mandatory DESC, id
    `, [permitType]);

    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    logger.error('Get checklist by permit type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch checklist questions'
    });
  }
};