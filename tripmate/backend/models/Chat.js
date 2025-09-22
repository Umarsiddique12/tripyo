const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: function() {
      return this.type === 'text' || this.type === 'system';
    },
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'expense', 'system', 'location'],
    default: 'text'
  },
  media: {
    url: String,
    publicId: String, // Cloudinary public ID
    filename: String,
    size: Number,
    mimeType: String
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      maxlength: 10
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
chatSchema.index({ tripId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1 });
chatSchema.index({ type: 1 });

// Virtual for reaction count
chatSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

// Virtual for read count
chatSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Method to add reaction
chatSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    reaction => reaction.user.toString() === userId.toString()
  );
  
  if (existingReaction) {
    existingReaction.emoji = emoji;
  } else {
    this.reactions.push({
      user: userId,
      emoji: emoji
    });
  }
};

// Method to remove reaction
chatSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    reaction => reaction.user.toString() !== userId.toString()
  );
};

// Method to mark as read
chatSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(
    read => read.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
};

// Method to check if user has read
chatSchema.methods.hasUserRead = function(userId) {
  return this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
};

// Method to soft delete message
chatSchema.methods.deleteMessage = function() {
  this.deleted = true;
  this.deletedAt = new Date();
  this.message = '[Message deleted]';
  this.media = undefined;
};

// Method to edit message
chatSchema.methods.editMessage = function(newMessage) {
  if (this.deleted) {
    throw new Error('Cannot edit deleted message');
  }
  
  this.message = newMessage;
  this.edited = true;
  this.editedAt = new Date();
};

// Static method to get chat messages for trip
chatSchema.statics.getTripMessages = function(tripId, limit = 50, skip = 0) {
  return this.find({
    tripId: tripId,
    deleted: false
  })
  .populate('senderId', 'name avatar')
  .populate('replyTo.senderId', 'name')
  .populate('mentions', 'name')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

module.exports = mongoose.model('Chat', chatSchema);
