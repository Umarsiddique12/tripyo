import Constants from 'expo-constants';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, use localhost
// For physical device, use your computer's IP address
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      return 'http://10.0.2.2:5000';
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:5000';
    }
  }
  // Fallback to config or default
  return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000';
};

const API_URL = getApiUrl();

// Log the API URL being used for debugging
console.log('🌐 API Configuration:', {
  platform: Platform.OS,
  apiUrl: API_URL,
  isDev: __DEV__
});

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/profile',
    UPDATE_PASSWORD: '/api/auth/password',
    DELETE_ACCOUNT: '/api/auth/account',
  },
  TRIPS: {
    CREATE: '/api/trips',
    GET_ALL: '/api/trips',
    GET_ONE: '/api/trips',
    UPDATE: '/api/trips',
    DELETE: '/api/trips',
    INVITE_MEMBER: '/api/trips',
    REMOVE_MEMBER: '/api/trips',
    LEAVE_TRIP: '/api/trips',
  },
  EXPENSES: {
    CREATE: '/api/expenses',
    GET_TRIP_EXPENSES: '/api/expenses/trip',
    GET_ONE: '/api/expenses',
    UPDATE: '/api/expenses',
    DELETE: '/api/expenses',
    GET_SUMMARY: '/api/expenses/trip',
    SETTLE: '/api/expenses',
  },
  CHAT: {
    GET_MESSAGES: '/api/chat/trip',
    SEND_MESSAGE: '/api/chat/trip',
    EDIT_MESSAGE: '/api/chat',
    DELETE_MESSAGE: '/api/chat',
    ADD_REACTION: '/api/chat',
    REMOVE_REACTION: '/api/chat',
    MARK_AS_READ: '/api/chat/trip',
  },
};

export { API_URL };
