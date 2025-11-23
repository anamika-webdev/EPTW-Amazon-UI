const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user (Admin only)
router.post('/', authorize('Admin'), userController.createUser);

// Update user
router.put('/:id', authorize('Admin'), userController.updateUser);

// Delete user
router.delete('/:id', authorize('Admin'), userController.deleteUser);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

module.exports = router;