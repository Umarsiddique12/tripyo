const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authMiddleware } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const expenseRoutes = require('./routes/expenses');
const chatRoutes = require('./routes/chat');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:19006",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:19006",
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TripMate API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO authentication and event handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join trip room
  socket.on('joinTrip', (tripId) => {
    socket.join(`trip_${tripId}`);
    socket.tripId = tripId;
    console.log(`User ${socket.userId} joined trip ${tripId}`);
    
    // Notify others in the trip
    socket.to(`trip_${tripId}`).emit('userJoined', {
      userId: socket.userId,
      tripId: tripId,
      timestamp: new Date()
    });
  });

  // Leave trip room
  socket.on('leaveTrip', (tripId) => {
    socket.leave(`trip_${tripId}`);
    socket.tripId = null;
    console.log(`User ${socket.userId} left trip ${tripId}`);
    
    // Notify others in the trip
    socket.to(`trip_${tripId}`).emit('userLeft', {
      userId: socket.userId,
      tripId: tripId,
      timestamp: new Date()
    });
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const { tripId, message, type = 'text', replyTo } = data;
      
      // Verify user is member of the trip
      const Trip = require('./models/Trip');
      const trip = await Trip.findById(tripId);
      
      if (!trip || !trip.isMember(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to send messages to this trip' });
        return;
      }

      // Save message to database
      const Chat = require('./models/Chat');
      const chatMessage = await Chat.create({
        tripId,
        senderId: socket.userId,
        message,
        type,
        replyTo
      });

      await chatMessage.populate([
        { path: 'senderId', select: 'name email avatar' },
        { path: 'replyTo.senderId', select: 'name' }
      ]);

      // Broadcast message to all users in the trip room
      io.to(`trip_${tripId}`).emit('newMessage', {
        message: chatMessage,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { tripId, isTyping } = data;
    socket.to(`trip_${tripId}`).emit('userTyping', {
      userId: socket.userId,
      isTyping,
      timestamp: new Date()
    });
  });

  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    const { tripId } = data;
    socket.to(`trip_${tripId}`).emit('userStoppedTyping', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Message reactions
  socket.on('addReaction', async (data) => {
    try {
      const { messageId, emoji } = data;
      
      const Chat = require('./models/Chat');
      const chatMessage = await Chat.findById(messageId);
      
      if (!chatMessage) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Verify user is member of the trip
      const Trip = require('./models/Trip');
      const trip = await Trip.findById(chatMessage.tripId);
      
      if (!trip || !trip.isMember(socket.userId)) {
        socket.emit('error', { message: 'Not authorized to react to messages in this trip' });
        return;
      }

      chatMessage.addReaction(socket.userId, emoji);
      await chatMessage.save();

      await chatMessage.populate([
        { path: 'reactions.user', select: 'name email avatar' }
      ]);

      // Broadcast reaction to all users in the trip room
      io.to(`trip_${chatMessage.tripId}`).emit('messageReaction', {
        messageId,
        reactions: chatMessage.reactions,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Add reaction error:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    if (socket.tripId) {
      // Notify others in the trip that user left
      socket.to(`trip_${socket.tripId}`).emit('userLeft', {
        userId: socket.userId,
        tripId: socket.tripId,
        timestamp: new Date()
      });
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
