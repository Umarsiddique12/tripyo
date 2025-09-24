import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { tripsAPI } from '../../api/trips';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const TripDetailsScreen = ({ route, navigation }) => {
  console.log('🎯 TripDetailsScreen - Route params:', route.params);
  const { tripId } = route.params || {};
  console.log('🎯 TripDetailsScreen - Extracted tripId:', tripId);
  
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, token } = useAuth();

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const loadTripDetails = async () => {
    if (!tripId) {
      console.log('❌ No tripId provided, cannot load trip details');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No trip ID provided',
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading trip details for tripId:', tripId);
      console.log('🔑 Using token:', token ? 'Present' : 'Missing');
      
      const response = await tripsAPI.getTrip(tripId, token);
      console.log('📦 Trip details response:', response);
      
      if (response.success) {
        console.log('✅ Trip loaded successfully:', response.data.trip);
        setTrip(response.data.trip);
      } else {
        console.log('❌ Trip load failed:', response.message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to load trip details',
        });
      }
    } catch (error) {
      console.error('💥 Load trip details error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load trip details',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTripDetails();
  };

  const handleInviteMember = () => {
    navigation.navigate('InviteMember', { tripId });
  };

  const handleLeaveTrip = () => {
    Alert.alert(
      'Leave Trip',
      'Are you sure you want to leave this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await tripsAPI.leaveTrip(tripId, token);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Left trip successfully',
                });
                navigation.goBack();
              }
            } catch (error) {
              console.error('Leave trip error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to leave trip',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await tripsAPI.deleteTrip(tripId, token);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Trip deleted successfully',
                });
                navigation.goBack();
              }
            } catch (error) {
              console.error('Delete trip error:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete trip',
              });
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return '#FFA500';
      case 'active': return '#28A745';
      case 'completed': return '#6C757D';
      case 'cancelled': return '#DC3545';
      default: return '#007AFF';
    }
  };

  const isCreator = trip?.createdBy?._id === user?.id;
  const isAdmin = trip?.members?.some(member => 
    member.user._id === user?.id && member.role === 'admin'
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTripDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trip.status) }]}>
            <Ionicons name="circle" size={8} color="#ffffff" />
            <Text style={styles.statusText}>{trip.status}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            // TODO: Implement trip settings
            Alert.alert('Settings', 'Trip settings coming soon!');
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {trip.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{trip.description}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.detailLabel}>Destination</Text>
            <Text style={styles.detailValue}>{trip.destination || 'Not specified'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>
              {moment(trip.startDate).format('MMM DD, YYYY')}
            </Text>
          </View>

          {trip.endDate ? (
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>
                {moment(trip.endDate).format('MMM DD, YYYY')}
              </Text>
            </View>
          ) : null}

          <View style={styles.detailItem}>
            <Ionicons name="wallet" size={20} color="#666" />
            <Text style={styles.detailLabel}>Budget</Text>
            <Text style={styles.detailValue}>
              {trip.budget?.total ? `$${trip.budget.total} ${trip.budget.currency}` : 'Not set'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({trip.memberCount})</Text>
          {(isCreator || isAdmin) && (
            <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMember}>
              <Ionicons name="person-add" size={16} color="#007AFF" />
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.membersList}>
          {trip.members.map((member) => (
            <View key={member.user._id} style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>
                  {member.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {member.user.name}
                  {member.role === 'admin' && (
                    <Text style={styles.adminBadge}> (Admin)</Text>
                  )}
                  {trip.createdBy._id === member.user._id && (
                    <Text style={styles.creatorBadge}> (Creator)</Text>
                  )}
                </Text>
                <Text style={styles.memberJoined}>
                  Joined {moment(member.joinedAt).format('MMM DD')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to Chat within Trips stack
              navigation.navigate('ChatMain', { tripId });
            }}
          >
            <Ionicons name="chatbubbles" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to Expenses within Trips stack
              navigation.navigate('ExpensesMain', { tripId });
            }}
          >
            <Ionicons name="receipt" size={24} color="#28A745" />
            <Text style={styles.actionText}>Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              navigation.navigate('LocationTracking', { 
                tripId: trip._id, 
                tripName: trip.name 
              });
            }}
          >
            <Ionicons name="location" size={24} color="#FF6B35" />
            <Text style={styles.actionText}>Track</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // TODO: Implement media sharing
              Alert.alert('Media', 'Media sharing coming soon!');
            }}
          >
            <Ionicons name="images" size={24} color="#9C27B0" />
            <Text style={styles.actionText}>Media</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleLeaveTrip}>
          <Ionicons name="exit" size={20} color="#DC3545" />
          <Text style={styles.dangerButtonText}>Leave Trip</Text>
        </TouchableOpacity>

        {isCreator && (
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteTrip}>
            <Ionicons name="trash" size={20} color="#DC3545" />
            <Text style={styles.dangerButtonText}>Delete Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inviteButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  adminBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  creatorBadge: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '500',
  },
  memberJoined: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  dangerZone: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    padding: 20,
    marginBottom: 20,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dangerButtonText: {
    color: '#DC3545',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default TripDetailsScreen;
