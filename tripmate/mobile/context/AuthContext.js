import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Verify token with backend
        const response = await authAPI.getMe(token);
        if (response.success) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token,
            },
          });
        } else {
          // Token is invalid, remove it
          await SecureStore.deleteItemAsync('authToken');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await SecureStore.deleteItemAsync('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email, password) => {
    console.log('🔐 AuthContext: Starting login process', { email });
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📡 AuthContext: Calling authAPI.login');
      const response = await authAPI.login(email, password);
      console.log('📦 AuthContext: Login response received', response);
      
      if (response.success) {
        const { token, user } = response.data;
        console.log('✅ AuthContext: Login successful, storing token');
        
        // Store token securely
        await SecureStore.setItemAsync('authToken', token);
        console.log('💾 AuthContext: Token stored successfully');
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        console.log('🎉 AuthContext: Login process completed successfully');
        return { success: true };
      } else {
        console.log('❌ AuthContext: Login failed', response.message);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('💥 AuthContext: Login error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (name, email, password) => {
    console.log('📝 AuthContext: Starting registration process', { name, email });
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('📡 AuthContext: Calling authAPI.register');
      const response = await authAPI.register(name, email, password);
      console.log('📦 AuthContext: Register response received', response);
      
      if (response.success) {
        const { token, user } = response.data;
        console.log('✅ AuthContext: Registration successful, storing token');
        
        // Store token securely
        await SecureStore.setItemAsync('authToken', token);
        console.log('💾 AuthContext: Token stored successfully');
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        console.log('🎉 AuthContext: Registration process completed successfully');
        return { success: true };
      } else {
        console.log('❌ AuthContext: Registration failed', response.message);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('💥 AuthContext: Register error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData, state.token);
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.updatePassword(
        { currentPassword, newPassword },
        state.token
      );
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Password update failed. Please try again.' };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
