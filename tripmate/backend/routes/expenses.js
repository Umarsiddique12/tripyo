const express = require('express');
const { body } = require('express-validator');
const {
  createExpense,
  getTripExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  settleExpense
} = require('../controllers/expenseController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createExpenseValidation = [
  body('tripId')
    .isMongoId()
    .withMessage('Invalid trip ID'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description is required and must be less than 200 characters'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('category')
    .optional()
    .isIn(['food', 'transportation', 'accommodation', 'activities', 'shopping', 'other'])
    .withMessage('Invalid category'),
  body('splitType')
    .optional()
    .isIn(['equal', 'custom', 'individual'])
    .withMessage('Invalid split type'),
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*.user')
    .isMongoId()
    .withMessage('Invalid user ID in participants'),
  body('participants.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Participant amount must be non-negative')
];

const updateExpenseValidation = [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be less than 200 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('category')
    .optional()
    .isIn(['food', 'transportation', 'accommodation', 'activities', 'shopping', 'other'])
    .withMessage('Invalid category'),
  body('participants')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*.user')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID in participants'),
  body('participants.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Participant amount must be non-negative'),
  body('status')
    .optional()
    .isIn(['pending', 'settled', 'disputed'])
    .withMessage('Invalid status')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', createExpenseValidation, createExpense);
router.get('/trip/:tripId', getTripExpenses);
router.get('/trip/:tripId/summary', getExpenseSummary);
router.get('/:id', getExpense);
router.put('/:id', updateExpenseValidation, updateExpense);
router.put('/:id/settle', settleExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
