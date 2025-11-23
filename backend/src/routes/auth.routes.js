const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

// Traditional login (for testing/admin)
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  authController.googleCallback
);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;