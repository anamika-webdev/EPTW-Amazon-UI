const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  login,
  googleCallback,
  getMe,
  logout,
  refreshToken
} = require('../controllers/authController');

// Validation rules
const loginValidation = [
  body('login_id').notEmpty().withMessage('Login ID is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/login', loginValidation, validate, login);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  googleCallback
);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);

module.exports = router;