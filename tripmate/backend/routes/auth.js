const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot be more than 200 characters')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfileValidation, updateProfile);
router.put('/password', authMiddleware, updatePasswordValidation, updatePassword);
router.delete('/account', authMiddleware, updatePasswordValidation, deleteAccount);

module.exports = router;
