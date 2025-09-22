# TripMate - Travel Collaboration App

A full-stack mobile-first trip management application built with React Native (Expo) and Node.js. TripMate helps users plan, manage, and track trips with friends and family.

## 🚀 Features

### Core Features
- **User Authentication** - Secure JWT-based authentication with registration/login
- **Trip Management** - Create, join, and manage trips with detailed information
- **Real-time Chat** - Socket.IO powered group chat for each trip
- **Expense Tracking** - Split expenses among trip members with detailed summaries
- **Member Management** - Invite friends and manage trip members
- **Profile Management** - User profiles with preferences and settings

### Technical Features
- **Real-time Communication** - Socket.IO for instant messaging
- **Secure Storage** - Expo SecureStore for sensitive data
- **Responsive Design** - Mobile-first UI with modern design patterns
- **Error Handling** - Comprehensive error handling and user feedback
- **Data Validation** - Input validation on both client and server
- **Pagination** - Efficient data loading with pagination

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - File uploads (ready for future features)

### Mobile App
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation library
- **React Context API** - State management
- **Socket.IO Client** - Real-time communication
- **Expo SecureStore** - Secure data storage
- **React Native Toast Message** - User notifications

## 📁 Project Structure

```
tripmate/
├── backend/
│   ├── config/         # Database & configuration
│   │   └── db.js
│   ├── controllers/    # Business logic
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── expenseController.js
│   │   └── tripController.js
│   ├── middleware/     # JWT, error handling
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/         # Database models
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Expense.js
│   │   └── Chat.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── expenses.js
│   │   └── trips.js
│   ├── utils/          # Helper functions
│   │   └── generateToken.js
│   ├── server.js       # Entry point
│   ├── seed.js         # Database seeding
│   └── package.json
├── mobile/
│   ├── api/            # API services
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── config.js
│   │   ├── expenses.js
│   │   └── trips.js
│   ├── components/     # Reusable components
│   ├── context/        # Global state management
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── navigation/    # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/        # App screens
│   │   ├── Auth/       # Authentication screens
│   │   ├── Home/       # Home screen
│   │   ├── Trip/       # Trip management
│   │   ├── Chat/       # Real-time chat
│   │   ├── Expenses/   # Expense management
│   │   └── Profile/    # Profile & settings
│   ├── App.js          # App entry point
│   ├── app.json        # Expo configuration
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tripmate
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database
   npm run seed
   
   # Start the server
   npm run dev
   ```

3. **Mobile App Setup**
   ```bash
   cd mobile
   npm install
   
   # Start the Expo development server
   expo start
   ```

4. **Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/tripmate
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:19006
   ```

## 📱 Usage

### Demo Accounts
The seed script creates several demo accounts:
- **john@example.com** / password123
- **jane@example.com** / password123
- **mike@example.com** / password123
- **sarah@example.com** / password123
- **david@example.com** / password123

### App Flow
1. **Splash Screen** - App initialization with logo animation
2. **Get Started** - Welcome screen with app features
3. **Authentication** - Login/Register with validation
4. **Home Screen** - Create new trips and view existing ones
5. **Trip Dashboard** - Access trip details, chat, expenses, and tracking
6. **Real-time Chat** - Group messaging with typing indicators
7. **Expense Management** - Add expenses, split costs, view summaries
8. **Profile & Settings** - Manage user profile and app preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Trips
- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get user's trips
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/invite` - Invite member
- `DELETE /api/trips/:id/members/:memberId` - Remove member

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/trip/:tripId` - Get trip expenses
- `GET /api/expenses/trip/:tripId/summary` - Get expense summary
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Chat
- `GET /api/chat/trip/:tripId` - Get trip messages
- `POST /api/chat/trip/:tripId` - Send message
- `PUT /api/chat/:messageId` - Edit message
- `DELETE /api/chat/:messageId` - Delete message

## 🔌 Socket.IO Events

### Client to Server
- `joinTrip` - Join trip room
- `leaveTrip` - Leave trip room
- `sendMessage` - Send chat message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator
- `addReaction` - Add message reaction

### Server to Client
- `newMessage` - New message received
- `userJoined` - User joined trip
- `userLeft` - User left trip
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing
- `messageReaction` - Message reaction added

## 🎨 UI/UX Features

- **Modern Design** - Clean, intuitive interface
- **Responsive Layout** - Optimized for mobile devices
- **Loading States** - Smooth loading animations
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Success/error feedback
- **Pull-to-Refresh** - Easy data refreshing
- **Infinite Scroll** - Efficient message loading

## 🔮 Future Features

### Planned Enhancements
- **Location Tracking** - Real-time GPS tracking during trips
- **Media Sharing** - Photo and video sharing in chat
- **Push Notifications** - Real-time notifications
- **Offline Support** - Offline data synchronization
- **Payment Integration** - Stripe/PayPal for expense settlements
- **Export Features** - PDF/CSV export for expenses
- **Social Features** - Trip sharing and discovery
- **Advanced Analytics** - Trip insights and statistics

### Technical Improvements
- **Image Upload** - Cloudinary integration for media
- **Caching** - Redis for improved performance
- **Testing** - Comprehensive test suite
- **CI/CD** - Automated deployment pipeline
- **Monitoring** - Application performance monitoring

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify database permissions

2. **Socket.IO Connection Issues**
   - Check CORS settings
   - Verify client URL configuration
   - Ensure proper authentication token

3. **Expo Development Issues**
   - Clear Expo cache: `expo start -c`
   - Restart Metro bundler
   - Check device/simulator connection

4. **Authentication Problems**
   - Verify JWT secret in .env
   - Check token expiration settings
   - Ensure proper token storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development** - Node.js, Express, MongoDB, Socket.IO
- **Mobile Development** - React Native, Expo, Navigation
- **UI/UX Design** - Modern mobile-first design
- **DevOps** - Deployment and infrastructure

## 📞 Support

For support, email support@tripmate.com or create an issue in the repository.

---

**TripMate** - Your travel companion for planning and managing trips with friends and family! ✈️🌍
