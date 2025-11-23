const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllPPE,
  createPPE,
  updatePPE,
  deletePPE,
  getAllHazards,
  createHazard,
  updateHazard,
  deleteHazard,
  getChecklistQuestions,
  createChecklistQuestion,
  updateChecklistQuestion,
  deleteChecklistQuestion
} = require('../controllers/masterDataController');

// PPE Validation
const ppeValidation = [
  body('name').notEmpty().withMessage('PPE name is required')
];

// Hazard Validation
const hazardValidation = [
  body('name').notEmpty().withMessage('Hazard name is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Checklist Question Validation
const checklistValidation = [
  body('permit_type')
    .isIn(['General', 'Height', 'Hot_Work', 'Electrical', 'Confined_Space'])
    .withMessage('Invalid permit type'),
  body('question_text').notEmpty().withMessage('Question text is required'),
  body('is_mandatory').isBoolean().withMessage('is_mandatory must be a boolean')
];

// ==================== PPE Routes ====================
router.get('/ppe', authenticate, getAllPPE);
router.post('/ppe', authenticate, authorize('Admin'), ppeValidation, validate, createPPE);
router.put('/ppe/:id', authenticate, authorize('Admin'), ppeValidation, validate, updatePPE);
router.delete('/ppe/:id', authenticate, authorize('Admin'), deletePPE);

// ==================== Hazards Routes ====================
router.get('/hazards', authenticate, getAllHazards);
router.post('/hazards', authenticate, authorize('Admin'), hazardValidation, validate, createHazard);
router.put('/hazards/:id', authenticate, authorize('Admin'), hazardValidation, validate, updateHazard);
router.delete('/hazards/:id', authenticate, authorize('Admin'), deleteHazard);

// ==================== Checklist Questions Routes ====================
router.get('/checklist-questions', authenticate, getChecklistQuestions);
router.post('/checklist-questions', authenticate, authorize('Admin'), checklistValidation, validate, createChecklistQuestion);
router.put('/checklist-questions/:id', authenticate, authorize('Admin'), checklistValidation, validate, updateChecklistQuestion);
router.delete('/checklist-questions/:id', authenticate, authorize('Admin'), deleteChecklistQuestion);

module.exports = router;