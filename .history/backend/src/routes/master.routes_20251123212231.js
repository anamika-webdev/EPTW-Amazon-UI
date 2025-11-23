const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Hazards
router.get('/hazards', masterController.getAllHazards);
router.get('/hazards/:id', masterController.getHazardById);

// PPE
router.get('/ppe', masterController.getAllPPE);
router.get('/ppe/:id', masterController.getPPEById);

// Checklist Questions
router.get('/checklist', masterController.getAllChecklistQuestions);
router.get('/checklist/:permitType', masterController.getChecklistByPermitType);

module.exports = router;