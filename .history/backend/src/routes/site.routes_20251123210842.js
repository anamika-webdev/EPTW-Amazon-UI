const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
} = require('../controllers/siteController');

// Validation rules
const siteValidation = [
  body('site_code').notEmpty().withMessage('Site code is required'),
  body('name').notEmpty().withMessage('Site name is required')
];

// Routes
router.get('/', authenticate, getSites);
router.get('/:id', authenticate, getSiteById);
router.post('/', authenticate, authorize('Admin'), siteValidation, validate, createSite);
router.put('/:id', authenticate, authorize('Admin'), siteValidation, validate, updateSite);
router.delete('/:id', authenticate, authorize('Admin'), deleteSite);

module.exports = router;