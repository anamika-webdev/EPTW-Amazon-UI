const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');

// Validation rules
const createUserValidation = [
  body('login_id').notEmpty().withMessage('Login ID is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role')
    .isIn(['Requester', 'Approver_AreaManager', 'Approver_Safety', 'Admin'])
    .withMessage('Invalid role')
];

const updateRoleValidation = [
  body('role')
    .isIn(['Requester', 'Approver_AreaManager', 'Approver_Safety', 'Admin'])
    .withMessage('Invalid role')
];

// Routes
router.get('/', authenticate, authorize('Admin'), getUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', authenticate, authorize('Admin'), createUserValidation, validate, createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorize('Admin'), deleteUser);
router.patch('/:id/role', authenticate, authorize('Admin'), updateRoleValidation, validate, updateUserRole);

module.exports = router;