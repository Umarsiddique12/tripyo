const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Chat = require('./models/Chat');

// Connect to database
connectDB();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Expense.deleteMany({});
    await Chat.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Travel enthusiast and adventure seeker',
        preferences: {
          darkMode: false,
          mediaAutoDownload: true,
          notifications: true,
        },
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Food lover and culture explorer',
        preferences: {
          darkMode: true,
          mediaAutoDownload: false,
          notifications: true,
        },
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        bio: 'Photography enthusiast and nature lover',
        preferences: {
          darkMode: false,
          mediaAutoDownload: true,
          notifications: false,
        },
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: 'password123',
        bio: 'Budget traveler and backpacker',
        preferences: {
          darkMode: true,
          mediaAutoDownload: true,
          notifications: true,
        },
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: 'password123',
        bio: 'Business traveler and city explorer',
        preferences: {
          darkMode: false,
          mediaAutoDownload: false,
          notifications: true,
        },
      },
    ]);

    console.log('👥 Created users:', users.length);

    // Create trips
    const trips = await Trip.create([
      {
        name: 'European Adventure',
        description: 'A 2-week journey through Europe visiting Paris, Rome, and Barcelona',
        destination: 'Europe',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        createdBy: users[0]._id,
        members: [
          { user: users[0]._id, role: 'admin', joinedAt: new Date() },
          { user: users[1]._id, role: 'member', joinedAt: new Date() },
          { user: users[2]._id, role: 'member', joinedAt: new Date() },
        ],
        status: 'planning',
        budget: {
          total: 5000,
          currency: 'USD',
        },
        settings: {
          allowMemberInvites: true,
          publicTrip: false,
        },
      },
      {
        name: 'Tokyo Food Tour',
        description: 'Exploring the best food spots in Tokyo with friends',
        destination: 'Tokyo, Japan',
        startDate: new Date('2024-07-10'),
        endDate: new Date('2024-07-17'),
        createdBy: users[1]._id,
        members: [
          { user: users[1]._id, role: 'admin', joinedAt: new Date() },
          { user: users[3]._id, role: 'member', joinedAt: new Date() },
          { user: users[4]._id, role: 'member', joinedAt: new Date() },
        ],
        status: 'active',
        budget: {
          total: 3000,
          currency: 'USD',
        },
        settings: {
          allowMemberInvites: true,
          publicTrip: false,
        },
      },
      {
        name: 'Weekend Getaway',
        description: 'Quick weekend trip to the mountains',
        destination: 'Rocky Mountains',
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-05-17'),
        createdBy: users[2]._id,
        members: [
          { user: users[2]._id, role: 'admin', joinedAt: new Date() },
          { user: users[0]._id, role: 'member', joinedAt: new Date() },
        ],
        status: 'completed',
        budget: {
          total: 800,
          currency: 'USD',
        },
        settings: {
          allowMemberInvites: false,
          publicTrip: false,
        },
      },
    ]);

    console.log('✈️ Created trips:', trips.length);

    // Create expenses
    const expenses = await Expense.create([
      {
        tripId: trips[0]._id,
        addedBy: users[0]._id,
        description: 'Flight tickets to Paris',
        amount: 1200,
        currency: 'USD',
        category: 'transportation',
        splitType: 'equal',
        participants: [
          { user: users[0]._id, amount: 400, paid: true },
          { user: users[1]._id, amount: 400, paid: false },
          { user: users[2]._id, amount: 400, paid: false },
        ],
        status: 'pending',
      },
      {
        tripId: trips[0]._id,
        addedBy: users[1]._id,
        description: 'Hotel booking in Paris',
        amount: 600,
        currency: 'USD',
        category: 'accommodation',
        splitType: 'equal',
        participants: [
          { user: users[0]._id, amount: 200, paid: false },
          { user: users[1]._id, amount: 200, paid: true },
          { user: users[2]._id, amount: 200, paid: false },
        ],
        status: 'pending',
      },
      {
        tripId: trips[0]._id,
        addedBy: users[2]._id,
        description: 'Dinner at fancy restaurant',
        amount: 180,
        currency: 'USD',
        category: 'food',
        splitType: 'equal',
        participants: [
          { user: users[0]._id, amount: 60, paid: false },
          { user: users[1]._id, amount: 60, paid: false },
          { user: users[2]._id, amount: 60, paid: true },
        ],
        status: 'settled',
      },
      {
        tripId: trips[1]._id,
        addedBy: users[1]._id,
        description: 'Sushi dinner in Tokyo',
        amount: 150,
        currency: 'USD',
        category: 'food',
        splitType: 'equal',
        participants: [
          { user: users[1]._id, amount: 50, paid: true },
          { user: users[3]._id, amount: 50, paid: false },
          { user: users[4]._id, amount: 50, paid: false },
        ],
        status: 'pending',
      },
      {
        tripId: trips[1]._id,
        addedBy: users[3]._id,
        description: 'JR Pass for train travel',
        amount: 300,
        currency: 'USD',
        category: 'transportation',
        splitType: 'equal',
        participants: [
          { user: users[1]._id, amount: 100, paid: false },
          { user: users[3]._id, amount: 100, paid: true },
          { user: users[4]._id, amount: 100, paid: false },
        ],
        status: 'pending',
      },
      {
        tripId: trips[2]._id,
        addedBy: users[2]._id,
        description: 'Gas for road trip',
        amount: 80,
        currency: 'USD',
        category: 'transportation',
        splitType: 'equal',
        participants: [
          { user: users[2]._id, amount: 40, paid: true },
          { user: users[0]._id, amount: 40, paid: true },
        ],
        status: 'settled',
      },
    ]);

    console.log('💰 Created expenses:', expenses.length);

    // Create chat messages
    const chatMessages = await Chat.create([
      {
        tripId: trips[0]._id,
        senderId: users[0]._id,
        message: 'Hey everyone! Excited for our European adventure! 🇪🇺',
        type: 'text',
      },
      {
        tripId: trips[0]._id,
        senderId: users[1]._id,
        message: 'Me too! I\'ve been researching the best restaurants in Paris 🍷',
        type: 'text',
      },
      {
        tripId: trips[0]._id,
        senderId: users[2]._id,
        message: 'Don\'t forget to pack your cameras! 📸',
        type: 'text',
      },
      {
        tripId: trips[0]._id,
        senderId: users[0]._id,
        message: 'Flight tickets are booked! Check your emails for confirmation.',
        type: 'text',
      },
      {
        tripId: trips[1]._id,
        senderId: users[1]._id,
        message: 'Welcome to our Tokyo food tour! 🍣',
        type: 'text',
      },
      {
        tripId: trips[1]._id,
        senderId: users[3]._id,
        message: 'I\'m so excited! I\'ve been practicing my chopstick skills 🥢',
        type: 'text',
      },
      {
        tripId: trips[1]._id,
        senderId: users[4]._id,
        message: 'Same here! Ready to try some authentic ramen 🍜',
        type: 'text',
      },
      {
        tripId: trips[2]._id,
        senderId: users[2]._id,
        message: 'Great weekend getaway! The mountains were amazing 🏔️',
        type: 'text',
      },
      {
        tripId: trips[2]._id,
        senderId: users[0]._id,
        message: 'Thanks for organizing! Had a blast 🎉',
        type: 'text',
      },
    ]);

    console.log('💬 Created chat messages:', chatMessages.length);

    // Populate references
    await Trip.populate(trips, [
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' },
    ]);

    await Expense.populate(expenses, [
      { path: 'addedBy', select: 'name email avatar' },
      { path: 'participants.user', select: 'name email avatar' },
    ]);

    await Chat.populate(chatMessages, [
      { path: 'senderId', select: 'name email avatar' },
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`✈️ Trips: ${trips.length}`);
    console.log(`💰 Expenses: ${expenses.length}`);
    console.log(`💬 Chat Messages: ${chatMessages.length}`);
    
    console.log('\n🔑 Demo Login Credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');
    console.log('Email: sarah@example.com | Password: password123');
    console.log('Email: david@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();