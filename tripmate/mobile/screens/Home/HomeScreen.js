import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { tripsAPI } from '../../api/trips';
import Toast from 'react-native-toast-message';
import moment from 'moment';

const HomeScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { user, token } = useAuth();
  const [useFallbackHero, setUseFallbackHero] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await tripsAPI.getTrips({}, token);
      if (response.success) {
        setTrips(response.data.trips);
      }
    } catch (error) {
      console.error('Load trips error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load trips',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a trip name',
      });
      return;
    }

    setIsCreating(true);
    try {
      const tripData = {
        name: tripName.trim(),
        description: tripDescription.trim(),
        startDate: new Date().toISOString(),
        budget: {
          total: 0,
          currency: 'USD',
        },
      };

      const response = await tripsAPI.createTrip(tripData, token);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Trip created successfully!',
        });
        setShowCreateModal(false);
        setTripName('');
        setTripDescription('');
        loadTrips();
      }
    } catch (error) {
      console.error('Create trip error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create trip',
      });
    } finally {
      setIsCreating(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planning': return 'calendar';
      case 'active': return 'play-circle';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'map';
    }
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => {
        console.log('🚀 Navigating to trip details with tripId:', item._id);
        console.log('📋 Trip data:', item);
        // Navigate to Trips tab then TripDetails inside it
        navigation.navigate('Trips', { screen: 'TripDetails', params: { tripId: item._id } });
      }}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripName}>{item.name}</Text>
          <Text style={styles.tripDestination}>{item.destination || 'No destination set'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="#ffffff" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.tripDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.tripFooter}>
        <View style={styles.memberInfo}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.memberCount}>{item.memberCount} members</Text>
        </View>
        <Text style={styles.tripDate}>
          {moment(item.startDate).format('MMM DD, YYYY')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHero = () => (
    <ImageBackground
      source={
        useFallbackHero
          ? { uri: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1960&auto=format&fit=crop' }
          : require('../../assets/home-hero.jpg')
      }
      defaultSource={require('../../assets/23.png')}
      style={styles.hero}
      resizeMode="cover"
      imageStyle={styles.heroImage}
      onLoad={() => console.log('Hero image loaded')}
      onError={(e) => {
        console.warn('Hero image failed, switching to fallback', e?.nativeEvent);
        setUseFallbackHero(true);
      }}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.45)"]}
        style={styles.heroOverlay}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle} numberOfLines={2}>
            Welcome to TripMate
          </Text>
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            Plan, explore, and share unforgettable adventures with friends.
          </Text>
          <View style={styles.ctaRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('AddTripModal')}
              style={styles.ctaButton}
            >
              <View style={styles.ctaIconWrap}>
                <Ionicons name="send" size={16} color="#0B1220" />
              </View>
              <Text style={styles.ctaText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="airplane-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No trips yet</Text>
      <Text style={styles.emptySubtitle}>
        Start your first adventure by creating a new trip!
      </Text>
    </View>
  );

  const categories = [
    { id: 'beaches', label: 'Beaches' },
    { id: 'mountains', label: 'Mountains' },
    { id: 'city', label: 'City' },
    { id: 'roadtrips', label: 'Road Trips' },
    { id: 'camping', label: 'Camping' },
  ];

  const renderChips = () => (
    <View style={styles.chipsRow}>
      {categories.map((c) => (
        <TouchableOpacity key={c.id} style={styles.chip} activeOpacity={0.9}>
          <Text style={styles.chipText}>{c.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickRow}>
      <TouchableOpacity
        style={styles.quickItem}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddTripModal')}
      >
        <View style={[styles.quickIcon, { backgroundColor: '#E5DEFF' }]}>
          <Ionicons name="add" size={18} color="#5B21B6" />
        </View>
        <Text style={styles.quickText}>Plan Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickItem}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Trips', { screen: 'ExpensesMain' })}
      >
        <View style={[styles.quickIcon, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="card" size={18} color="#065F46" />
        </View>
        <Text style={styles.quickText}>Expenses</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickItem}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Trips', { screen: 'InviteMember' })}
      >
        <View style={[styles.quickIcon, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="person-add" size={18} color="#1E40AF" />
        </View>
        <Text style={styles.quickText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHomeHeader = () => (
    <View>
      {renderHero()}
      {renderChips()}
      {renderQuickActions()}
      <Text style={styles.sectionHeading}>Your Trips</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        renderItem={renderTripItem}
        ListHeaderComponent={renderHomeHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tripsList}
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Trip</Text>
            <TouchableOpacity
              onPress={handleCreateTrip}
              disabled={isCreating}
            >
              <Text style={[styles.createButtonText, { color: '#007AFF' }]}>
                {isCreating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Trip Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter trip name"
                value={tripName}
                onChangeText={setTripName}
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your trip (optional)"
                value={tripDescription}
                onChangeText={setTripDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  chipText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  quickItem: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '31%',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  hero: {
    height: 560,
    width: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroOverlay: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 26,
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.3,
    lineHeight: 38,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 10,
    lineHeight: 20,
  },
  sectionHeading: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    marginTop: 10,
    marginBottom: 10,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  ctaButton: {
    backgroundColor: '#E1F0FF',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  ctaIconWrap: {
    backgroundColor: '#7CD4FF',
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ctaText: {
    color: '#0B1220',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  tripsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDestination: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  tripDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginLeft: 4,
  },
  tripDate: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_700Bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default HomeScreen;
