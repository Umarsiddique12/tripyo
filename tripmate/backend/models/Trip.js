const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a trip name'],
    trim: true,
    maxlength: [100, 'Trip name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  destination: {
    type: String,
    trim: true,
    maxlength: [100, 'Destination cannot be more than 100 characters']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: {
    total: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  settings: {
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    publicTrip: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
tripSchema.index({ createdBy: 1 });
tripSchema.index({ 'members.user': 1 });
tripSchema.index({ status: 1 });

// Virtual for member count
tripSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user is member
tripSchema.methods.isMember = function(userId) {
  return this.members.some(member => {
    // Handle both populated and non-populated user references
    const memberUserId = member.user._id ? member.user._id : member.user;
    return memberUserId.toString() === userId.toString();
  });
};

// Method to check if user is admin
tripSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => {
    // Handle both populated and non-populated user references
    const memberUserId = member.user._id ? member.user._id : member.user;
    return memberUserId.toString() === userId.toString() && 
           member.role === 'admin';
  });
};

// Method to add member
tripSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
};

// Method to remove member
tripSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
};

module.exports = mongoose.model('Trip', tripSchema);
