const Trip = require('../models/Trip');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const { name, description, destination, startDate, endDate, budget } = req.body;

  const trip = await Trip.create({
    name,
    description,
    destination,
    startDate,
    endDate,
    budget,
    createdBy: req.user._id
  });

  // Add creator as admin member
  trip.addMember(req.user._id, 'admin');
  await trip.save();

  // Populate the trip data
  await trip.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: { trip }
  });
});

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  // Build query
  const query = {
    $or: [
      { createdBy: req.user._id },
      { 'members.user': req.user._id }
    ]
  };

  if (status) {
    query.status = status;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const trips = await Trip.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Trip.countDocuments(query);

  res.json({
    success: true,
    data: {
      trips,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is member of trip
  if (!trip.isMember(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this trip'
    });
  }

  res.json({
    success: true,
    data: { trip }
  });
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is admin or creator
  if (!trip.isAdmin(req.user._id) && trip.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this trip'
    });
  }

  const { name, description, destination, startDate, endDate, budget, status, settings } = req.body;

  // Update fields
  if (name !== undefined) trip.name = name;
  if (description !== undefined) trip.description = description;
  if (destination !== undefined) trip.destination = destination;
  if (startDate !== undefined) trip.startDate = startDate;
  if (endDate !== undefined) trip.endDate = endDate;
  if (budget !== undefined) trip.budget = budget;
  if (status !== undefined) trip.status = status;
  if (settings !== undefined) trip.settings = { ...trip.settings, ...settings };

  const updatedTrip = await trip.save();

  await updatedTrip.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Trip updated successfully',
    data: { trip: updatedTrip }
  });
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is creator
  if (trip.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this trip'
    });
  }

  await Trip.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

// @desc    Invite member to trip
// @route   POST /api/trips/:id/invite
// @access  Private
const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is admin or creator
  if (!trip.isAdmin(req.user._id) && trip.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to invite members'
    });
  }

  // Find user by email
  const userToInvite = await User.findOne({ email });
  if (!userToInvite) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  // Check if user is already a member
  if (trip.isMember(userToInvite._id)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a member of this trip'
    });
  }

  // Add member
  trip.addMember(userToInvite._id);
  await trip.save();

  await trip.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Member invited successfully',
    data: { trip }
  });
});

// @desc    Remove member from trip
// @route   DELETE /api/trips/:id/members/:memberId
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is admin or creator
  if (!trip.isAdmin(req.user._id) && trip.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to remove members'
    });
  }

  // Cannot remove creator
  if (trip.createdBy.toString() === req.params.memberId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove trip creator'
    });
  }

  // Remove member
  trip.removeMember(req.params.memberId);
  await trip.save();

  await trip.populate([
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'members.user', select: 'name email avatar' }
  ]);

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: { trip }
  });
});

// @desc    Leave trip
// @route   POST /api/trips/:id/leave
// @access  Private
const leaveTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is creator
  if (trip.createdBy.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Trip creator cannot leave the trip. Transfer ownership or delete the trip.'
    });
  }

  // Remove user from trip
  trip.removeMember(req.user._id);
  await trip.save();

  res.json({
    success: true,
    message: 'Left trip successfully'
  });
});

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  inviteMember,
  removeMember,
  leaveTrip
};
