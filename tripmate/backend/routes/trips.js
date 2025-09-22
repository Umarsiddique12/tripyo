const express = require('express');
const { body } = require('express-validator');
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  inviteMember,
  removeMember,
  leaveTrip
} = require('../controllers/tripController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createTripValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('destination')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Destination cannot be more than 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('budget.total')
    .optional()
    .isNumeric()
    .withMessage('Budget total must be a number'),
  body('budget.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters')
];

const updateTripValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Trip name must be less than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('destination')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Destination cannot be more than 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('budget.total')
    .optional()
    .isNumeric()
    .withMessage('Budget total must be a number'),
  body('budget.currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status')
];

const inviteMemberValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', createTripValidation, createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTripValidation, updateTrip);
router.delete('/:id', deleteTrip);

// Member management routes
router.post('/:id/invite', inviteMemberValidation, inviteMember);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveTrip);

module.exports = router;
