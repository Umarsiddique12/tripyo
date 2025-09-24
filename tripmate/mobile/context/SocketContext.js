import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../api/config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      // Initialize socket connection
      const newSocket = io(API_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        console.log('🌐 Socket URL:', API_URL);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('🌐 Failed to connect to:', API_URL);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  const joinTrip = (tripId) => {
    if (socket && isConnected) {
      socket.emit('joinTrip', tripId);
      setCurrentTripId(tripId);
    }
  };

  const leaveTrip = (tripId) => {
    if (socket && isConnected) {
      socket.emit('leaveTrip', tripId);
      if (currentTripId === tripId) {
        setCurrentTripId(null);
      }
    }
  };

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', messageData);
    }
  };

  const startTyping = (tripId) => {
    if (socket && isConnected) {
      socket.emit('typing', { tripId, isTyping: true });
    }
  };

  const stopTyping = (tripId) => {
    if (socket && isConnected) {
      socket.emit('stopTyping', { tripId, isTyping: false });
    }
  };

  const addReaction = (messageId, emoji) => {
    if (socket && isConnected) {
      socket.emit('addReaction', { messageId, emoji });
    }
  };

  // Location tracking methods
  const startLocationTracking = (tripId) => {
    if (socket && isConnected) {
      socket.emit('startLocationTracking', { tripId });
    }
  };

  const stopLocationTracking = (tripId) => {
    if (socket && isConnected) {
      socket.emit('stopLocationTracking', { tripId });
    }
  };

  const updateLocation = (tripId, locationData) => {
    if (socket && isConnected) {
      socket.emit('updateLocation', {
        tripId,
        ...locationData
      });
    }
  };

  const requestCurrentLocations = (tripId) => {
    if (socket && isConnected) {
      socket.emit('requestCurrentLocations', { tripId });
    }
  };

  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('newMessage', callback);
      return () => socket.off('newMessage', callback);
    }
  };

  const onUserJoined = (callback) => {
    if (socket) {
      socket.on('userJoined', callback);
      return () => socket.off('userJoined', callback);
    }
  };

  const onUserLeft = (callback) => {
    if (socket) {
      socket.on('userLeft', callback);
      return () => socket.off('userLeft', callback);
    }
  };

  const onUserTyping = (callback) => {
    if (socket) {
      socket.on('userTyping', callback);
      return () => socket.off('userTyping', callback);
    }
  };

  const onUserStoppedTyping = (callback) => {
    if (socket) {
      socket.on('userStoppedTyping', callback);
      return () => socket.off('userStoppedTyping', callback);
    }
  };

  const onMessageReaction = (callback) => {
    if (socket) {
      socket.on('messageReaction', callback);
      return () => socket.off('messageReaction', callback);
    }
  };

  const onError = (callback) => {
    if (socket) {
      socket.on('error', callback);
      return () => socket.off('error', callback);
    }
  };

  // Location tracking event listeners
  const onLocationUpdate = (callback) => {
    if (socket) {
      socket.on('locationUpdate', callback);
      return () => socket.off('locationUpdate', callback);
    }
  };

  const onUserStartedTracking = (callback) => {
    if (socket) {
      socket.on('userStartedTracking', callback);
      return () => socket.off('userStartedTracking', callback);
    }
  };

  const onUserStoppedTracking = (callback) => {
    if (socket) {
      socket.on('userStoppedTracking', callback);
      return () => socket.off('userStoppedTracking', callback);
    }
  };

  const onMemberLocationUpdate = (callback) => {
    if (socket) {
      socket.on('memberLocationUpdate', callback);
      return () => socket.off('memberLocationUpdate', callback);
    }
  };

  const onRequestLocation = (callback) => {
    if (socket) {
      socket.on('requestLocation', callback);
      return () => socket.off('requestLocation', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    currentTripId,
    joinTrip,
    leaveTrip,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    startLocationTracking,
    stopLocationTracking,
    updateLocation,
    requestCurrentLocations,
    onNewMessage,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onUserStoppedTyping,
    onMessageReaction,
    onLocationUpdate,
    onUserStartedTracking,
    onUserStoppedTracking,
    onMemberLocationUpdate,
    onRequestLocation,
    onError,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
