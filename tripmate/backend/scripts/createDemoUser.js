require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'john@example.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create demo user
    const demoUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      isDemo: true
    });
    
    await demoUser.save();
    console.log('Demo user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();
