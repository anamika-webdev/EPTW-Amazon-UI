const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} = require('../controllers/vendorController');

// Validation rules
const vendorValidation = [
  body('company_name').notEmpty().withMessage('Company name is required')
];

// Routes
router.get('/', authenticate, getVendors);
router.get('/:id', authenticate, getVendorById);
router.post('/', authenticate, authorize('Admin'), vendorValidation, validate, createVendor);
router.put('/:id', authenticate, authorize('Admin'), vendorValidation, validate, updateVendor);
router.delete('/:id', authenticate, authorize('Admin'), deleteVendor);

module.exports = router;