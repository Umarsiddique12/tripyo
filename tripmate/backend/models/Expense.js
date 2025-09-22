const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide expense description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  category: {
    type: String,
    enum: ['food', 'transportation', 'accommodation', 'activities', 'shopping', 'other'],
    default: 'other'
  },
  splitType: {
    type: String,
    enum: ['equal', 'custom', 'individual'],
    default: 'equal'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paid: {
      type: Boolean,
      default: false
    }
  }],
  receipt: {
    url: String,
    publicId: String // Cloudinary public ID
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  location: {
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'settled', 'disputed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for better query performance
expenseSchema.index({ tripId: 1 });
expenseSchema.index({ addedBy: 1 });
expenseSchema.index({ 'participants.user': 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });

// Virtual for total participants
expenseSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for average amount per participant
expenseSchema.virtual('averageAmount').get(function() {
  if (this.participants.length === 0) return 0;
  return this.amount / this.participants.length;
});

// Method to check if user is participant
expenseSchema.methods.isParticipant = function(userId) {
  return this.participants.some(participant => 
    participant.user.toString() === userId.toString()
  );
};

// Method to get user's share
expenseSchema.methods.getUserShare = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  return participant ? participant.amount : 0;
};

// Method to calculate equal split
expenseSchema.methods.calculateEqualSplit = function(userIds) {
  const amountPerPerson = this.amount / userIds.length;
  this.participants = userIds.map(userId => ({
    user: userId,
    amount: amountPerPerson,
    paid: false
  }));
  this.splitType = 'equal';
};

// Method to settle expense
expenseSchema.methods.settleExpense = function() {
  this.status = 'settled';
  this.participants.forEach(participant => {
    participant.paid = true;
  });
};

// Pre-save middleware to validate participants
expenseSchema.pre('save', function(next) {
  if (this.participants.length === 0) {
    return next(new Error('At least one participant is required'));
  }
  
  const totalParticipantAmount = this.participants.reduce(
    (sum, participant) => sum + participant.amount, 0
  );
  
  // Allow small rounding differences
  if (Math.abs(totalParticipantAmount - this.amount) > 0.01) {
    return next(new Error('Participant amounts must equal total expense amount'));
  }
  
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
