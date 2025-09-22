const express = require('express');
const { body } = require('express-validator');
const {
  getTripMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead
} = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message is required and must be less than 1000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'expense', 'system', 'location'])
    .withMessage('Invalid message type'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID')
];

const editMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message is required and must be less than 1000 characters')
];

const addReactionValidation = [
  body('emoji')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Emoji is required and must be less than 10 characters')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/trip/:tripId', getTripMessages);
router.post('/trip/:tripId', sendMessageValidation, sendMessage);
router.post('/trip/:tripId/read', markAsRead);

router.put('/:messageId', editMessageValidation, editMessage);
router.delete('/:messageId', deleteMessage);

router.post('/:messageId/reaction', addReactionValidation, addReaction);
router.delete('/:messageId/reaction', removeReaction);

module.exports = router;
