import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../api/chat';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const ChatScreen = ({ route }) => {
  const { tripId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { user, token } = useAuth();
  const {
    joinTrip,
    leaveTrip,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStoppedTyping,
    onError,
  } = useSocket();

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    loadMessages();
    joinTrip(tripId);

    // Set up socket listeners
    const unsubscribeNewMessage = onNewMessage((data) => {
      if (data.message.tripId === tripId) {
        setMessages(prev => [data.message, ...prev]);
        scrollToBottom();
      }
    });

    const unsubscribeUserTyping = onUserTyping((data) => {
      if (data.tripId === tripId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(id => id !== data.userId);
          return [...filtered, data.userId];
        });
      }
    });

    const unsubscribeUserStoppedTyping = onUserStoppedTyping((data) => {
      if (data.tripId === tripId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    });

    const unsubscribeError = onError((error) => {
      Toast.show({
        type: 'error',
        text1: 'Chat Error',
        text2: error.message,
      });
    });

    return () => {
      leaveTrip(tripId);
      unsubscribeNewMessage();
      unsubscribeUserTyping();
      unsubscribeUserStoppedTyping();
      unsubscribeError();
    };
  }, [tripId]);

  const loadMessages = async (page = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await chatAPI.getTripMessages(tripId, { page, limit: 50 }, token);
      if (response.success) {
        const newMessages = response.data.messages;
        
        if (page === 1) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...prev, ...newMessages]);
        }
        
        setHasMoreMessages(newMessages.length === 50);
        
        if (page === 1) {
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (error) {
      console.error('Load messages error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load messages',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Send via socket for real-time delivery
      sendMessage({
        tripId,
        message: messageText,
        type: 'text',
      });

      // Also send via API as backup
      await chatAPI.sendMessage(tripId, {
        message: messageText,
        type: 'text',
      }, token);

      stopTyping(tripId);
      setIsTyping(false);
    } catch (error) {
      console.error('Send message error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);

    if (text.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(tripId);
    } else if (!text.trim() && isTyping) {
      setIsTyping(false);
      stopTyping({ tripId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(tripId);
      }
    }, 2000);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreMessages) {
      const nextPage = Math.floor(messages.length / 50) + 1;
      loadMessages(nextPage);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId._id === user?.id;
    const showAvatar = index === messages.length - 1 || 
      messages[index + 1]?.senderId._id !== item.senderId._id;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && showAvatar && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.senderId.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {!isOwnMessage && showAvatar && (
            <Text style={styles.senderName}>{item.senderId.name}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {moment(item.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
        </Text>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    );
  };

  if (!tripId) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
        <Text style={styles.errorText}>No trip selected</Text>
        <Text style={styles.errorSubtext}>Select a trip to start chatting</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        ListHeaderComponent={renderTypingIndicator}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#666',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 1,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChatScreen;
