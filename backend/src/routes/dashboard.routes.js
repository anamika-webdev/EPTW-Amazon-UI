const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Get permits by status count
router.get('/permits-by-status', dashboardController.getPermitsByStatusCount);

// Get permits by type count
router.get('/permits-by-type', dashboardController.getPermitsByTypeCount);

// Get permits by site
router.get('/permits-by-site', dashboardController.getPermitsBySite);

// Get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

// Get expiring permits
router.get('/expiring-permits', dashboardController.getExpiringPermits);

module.exports = router;