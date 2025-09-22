const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const { tripId, description, amount, currency, category, splitType, participants } = req.body;

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
      message: 'Not authorized to add expenses to this trip'
    });
  }

  const expense = await Expense.create({
    tripId,
    addedBy: req.user._id,
    description,
    amount,
    currency,
    category,
    splitType,
    participants
  });

  await expense.populate([
    { path: 'addedBy', select: 'name email avatar' },
    { path: 'participants.user', select: 'name email avatar' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense }
  });
});

// @desc    Get expenses for trip
// @route   GET /api/expenses/trip/:tripId
// @access  Private
const getTripExpenses = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { page = 1, limit = 20, category } = req.query;

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
      message: 'Not authorized to view expenses for this trip'
    });
  }

  // Build query
  const query = { tripId };
  if (category) {
    query.category = category;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const expenses = await Expense.find(query)
    .populate('addedBy', 'name email avatar')
    .populate('participants.user', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Expense.countDocuments(query);

  res.json({
    success: true,
    data: {
      expenses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('tripId', 'name')
    .populate('addedBy', 'name email avatar')
    .populate('participants.user', 'name email avatar');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  // Check if user is member of the trip
  const trip = await Trip.findById(expense.tripId._id);
  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this expense'
    });
  }

  res.json({
    success: true,
    data: { expense }
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  // Check if user is the one who added the expense or trip admin
  const trip = await Trip.findById(expense.tripId);
  if (expense.addedBy.toString() !== req.user._id.toString() && 
      !trip.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this expense'
    });
  }

  const { description, amount, currency, category, participants, status } = req.body;

  // Update fields
  if (description !== undefined) expense.description = description;
  if (amount !== undefined) expense.amount = amount;
  if (currency !== undefined) expense.currency = currency;
  if (category !== undefined) expense.category = category;
  if (participants !== undefined) expense.participants = participants;
  if (status !== undefined) expense.status = status;

  const updatedExpense = await expense.save();

  await updatedExpense.populate([
    { path: 'addedBy', select: 'name email avatar' },
    { path: 'participants.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense: updatedExpense }
  });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  // Check if user is the one who added the expense or trip admin
  const trip = await Trip.findById(expense.tripId);
  if (expense.addedBy.toString() !== req.user._id.toString() && 
      !trip.isAdmin(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this expense'
    });
  }

  await Expense.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// @desc    Get expense summary for trip
// @route   GET /api/expenses/trip/:tripId/summary
// @access  Private
const getExpenseSummary = asyncHandler(async (req, res) => {
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
      message: 'Not authorized to view expense summary for this trip'
    });
  }

  const expenses = await Expense.find({ tripId })
    .populate('participants.user', 'name email avatar');

  // Calculate summary
  const summary = {
    totalAmount: 0,
    totalExpenses: expenses.length,
    currency: 'USD',
    memberBalances: {},
    categoryBreakdown: {},
    settlements: []
  };

  // Initialize member balances
  trip.members.forEach(member => {
    summary.memberBalances[member.user._id] = {
      userId: member.user._id,
      name: member.user.name,
      totalPaid: 0,
      totalOwed: 0,
      balance: 0
    };
  });

  // Process each expense
  expenses.forEach(expense => {
    summary.totalAmount += expense.amount;
    summary.currency = expense.currency;

    // Category breakdown
    if (!summary.categoryBreakdown[expense.category]) {
      summary.categoryBreakdown[expense.category] = 0;
    }
    summary.categoryBreakdown[expense.category] += expense.amount;

    // Member balances
    expense.participants.forEach(participant => {
      const userId = participant.user._id.toString();
      
      if (expense.addedBy.toString() === userId) {
        // This user paid
        summary.memberBalances[userId].totalPaid += expense.amount;
      }
      
      // This user owes
      summary.memberBalances[userId].totalOwed += participant.amount;
    });
  });

  // Calculate final balances
  Object.values(summary.memberBalances).forEach(balance => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  // Generate settlement suggestions
  const balances = Object.values(summary.memberBalances);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    
    if (amount > 0.01) { // Avoid tiny amounts
      summary.settlements.push({
        from: debtor.userId,
        fromName: debtor.name,
        to: creditor.userId,
        toName: creditor.name,
        amount: parseFloat(amount.toFixed(2))
      });
      
      creditor.balance -= amount;
      debtor.balance += amount;
    }
    
    if (creditor.balance <= 0.01) creditorIndex++;
    if (debtor.balance >= -0.01) debtorIndex++;
  }

  res.json({
    success: true,
    data: { summary }
  });
});

// @desc    Mark expense as settled
// @route   PUT /api/expenses/:id/settle
// @access  Private
const settleExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  // Check if user is member of the trip
  const trip = await Trip.findById(expense.tripId);
  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to settle this expense'
    });
  }

  expense.settleExpense();
  await expense.save();

  res.json({
    success: true,
    message: 'Expense settled successfully',
    data: { expense }
  });
});

module.exports = {
  createExpense,
  getTripExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  settleExpense
};
