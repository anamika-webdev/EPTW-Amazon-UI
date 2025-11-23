const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getPermits,
  getPermitById,
  createPermit,
  updatePermit,
  submitPermit,
  deletePermit,
  getDashboardStats
} = require('../controllers/permitController');

// Validation rules
const createPermitValidation = [
  body('site_id').isInt().withMessage('Valid site ID is required'),
  body('permit_type')
    .isIn(['General', 'Height', 'Hot_Work', 'Electrical', 'Confined_Space'])
    .withMessage('Invalid permit type'),
  body('work_location').notEmpty().withMessage('Work location is required'),
  body('work_description').notEmpty().withMessage('Work description is required'),
  body('start_time').isISO8601().withMessage('Valid start time is required'),
  body('end_time').isISO8601().withMessage('Valid end time is required'),
  body('receiver_name').notEmpty().withMessage('Receiver name is required')
];

// Routes
router.get('/stats/dashboard', authenticate, getDashboardStats);
router.get('/', authenticate, getPermits);
router.get('/:id', authenticate, getPermitById);
router.post(
  '/',
  authenticate,
  authorize('Requester', 'Admin'),
  createPermitValidation,
  validate,
  createPermit
);
router.put('/:id', authenticate, updatePermit);
router.post('/:id/submit', authenticate, authorize('Requester', 'Admin'), submitPermit);
router.delete('/:id', authenticate, deletePermit);

module.exports = router;