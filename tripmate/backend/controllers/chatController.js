const Chat = require('../models/Chat');
const Trip = require('../models/Trip');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get chat messages for trip
// @route   GET /api/chat/trip/:tripId
// @access  Private
const getTripMessages = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify trip exists and user is member
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view messages for this trip'
    });
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await Chat.getTripMessages(tripId, parseInt(limit), skip);
  const total = await Chat.countDocuments({ tripId, deleted: false });

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Send message
// @route   POST /api/chat/trip/:tripId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { message, type = 'text', replyTo } = req.body;

  // Verify trip exists and user is member
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to send messages to this trip'
    });
  }

  const chatMessage = await Chat.create({
    tripId,
    senderId: req.user._id,
    message,
    type,
    replyTo
  });

  await chatMessage.populate([
    { path: 'senderId', select: 'name email avatar' },
    { path: 'replyTo.senderId', select: 'name' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message: chatMessage }
  });
});

// @desc    Edit message
// @route   PUT /api/chat/:messageId
// @access  Private
const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;

  const chatMessage = await Chat.findById(messageId);

  if (!chatMessage) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender
  if (chatMessage.senderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this message'
    });
  }

  chatMessage.editMessage(message);
  await chatMessage.save();

  await chatMessage.populate([
    { path: 'senderId', select: 'name email avatar' },
    { path: 'replyTo.senderId', select: 'name' }
  ]);

  res.json({
    success: true,
    message: 'Message edited successfully',
    data: { message: chatMessage }
  });
});

// @desc    Delete message
// @route   DELETE /api/chat/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const chatMessage = await Chat.findById(messageId);

  if (!chatMessage) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender or trip admin
  const trip = await Trip.findById(chatMessage.tripId);
  if (chatMessage.senderId.toString() !== req.user._id.toString() && 
      !trip.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this message'
    });
  }

  chatMessage.deleteMessage();
  await chatMessage.save();

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Add reaction to message
// @route   POST /api/chat/:messageId/reaction
// @access  Private
const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  const chatMessage = await Chat.findById(messageId);

  if (!chatMessage) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Verify user is member of the trip
  const trip = await Trip.findById(chatMessage.tripId);
  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to react to messages in this trip'
    });
  }

  chatMessage.addReaction(req.user._id, emoji);
  await chatMessage.save();

  await chatMessage.populate([
    { path: 'senderId', select: 'name email avatar' },
    { path: 'reactions.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Reaction added successfully',
    data: { message: chatMessage }
  });
});

// @desc    Remove reaction from message
// @route   DELETE /api/chat/:messageId/reaction
// @access  Private
const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const chatMessage = await Chat.findById(messageId);

  if (!chatMessage) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Verify user is member of the trip
  const trip = await Trip.findById(chatMessage.tripId);
  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to react to messages in this trip'
    });
  }

  chatMessage.removeReaction(req.user._id);
  await chatMessage.save();

  await chatMessage.populate([
    { path: 'senderId', select: 'name email avatar' },
    { path: 'reactions.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Reaction removed successfully',
    data: { message: chatMessage }
  });
});

// @desc    Mark messages as read
// @route   POST /api/chat/trip/:tripId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  // Verify trip exists and user is member
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to mark messages as read for this trip'
    });
  }

  // Get unread messages for this user in this trip
  const unreadMessages = await Chat.find({
    tripId,
    senderId: { $ne: req.user._id },
    'readBy.user': { $ne: req.user._id }
  });

  // Mark all as read
  for (const message of unreadMessages) {
    message.markAsRead(req.user._id);
    await message.save();
  }

  res.json({
    success: true,
    message: 'Messages marked as read',
    data: { markedCount: unreadMessages.length }
  });
});

module.exports = {
  getTripMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead
};
