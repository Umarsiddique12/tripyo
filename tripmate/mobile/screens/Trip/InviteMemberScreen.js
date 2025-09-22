import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { tripsAPI } from '../../api/trips';
import Toast from 'react-native-toast-message';

const InviteMemberScreen = ({ route, navigation }) => {
  const { tripId } = route.params;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();

  const handleInvite = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter an email address',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await tripsAPI.inviteMember(tripId, email.trim(), token);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Member invited successfully!',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Invite member error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to invite member',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-add" size={80} color="#007AFF" />
        </View>

        <Text style={styles.title}>Invite a Friend</Text>
        <Text style={styles.subtitle}>
          Enter the email address of the person you want to invite to this trip
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.inviteButton, isLoading && styles.inviteButtonDisabled]}
          onPress={handleInvite}
          disabled={isLoading}
        >
          <Text style={styles.inviteButtonText}>
            {isLoading ? 'Sending Invite...' : 'Send Invite'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            The person will need to have a TripMate account to join the trip.
            If they don't have an account, they'll need to sign up first.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 30,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  inviteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default InviteMemberScreen;
