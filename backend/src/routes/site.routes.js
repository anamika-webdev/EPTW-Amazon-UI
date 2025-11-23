const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all sites
router.get('/', siteController.getAllSites);

// Get site by ID
router.get('/:id', siteController.getSiteById);

// Create site (Admin only)
router.post('/', authorize('Admin'), siteController.createSite);

// Update site (Admin only)
router.put('/:id', authorize('Admin'), siteController.updateSite);

// Delete site (Admin only)
router.delete('/:id', authorize('Admin'), siteController.deleteSite);

module.exports = router;