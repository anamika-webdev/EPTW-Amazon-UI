const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all vendors
router.get('/', vendorController.getAllVendors);

// Get vendor by ID
router.get('/:id', vendorController.getVendorById);

// Create vendor
router.post('/', vendorController.createVendor);

// Update vendor
router.put('/:id', vendorController.updateVendor);

// Delete vendor
router.delete('/:id', authorize('Admin'), vendorController.deleteVendor);

module.exports = router;