import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../context/SocketContext';

const SimpleLocationScreen = ({ route, navigation }) => {
  const { tripId, tripName } = route.params;
  const {
    startLocationTracking,
    stopLocationTracking,
    updateLocation,
    onLocationUpdate,
  } = useSocket();

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [memberLocations, setMemberLocations] = useState(new Map());
  const [locationSubscription, setLocationSubscription] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    
    const unsubscribeLocationUpdate = onLocationUpdate(handleLocationUpdate);
    
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (isTracking) {
        stopLocationTracking(tripId);
      }
      unsubscribeLocationUpdate?.();
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required.');
        return false;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      return true;
    } catch (error) {
      console.error('Location error:', error);
      return false;
    }
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };

          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          updateLocation(tripId, locationData);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      startLocationTracking(tripId);
      Alert.alert('Started', 'Location tracking started!');
    } catch (error) {
      console.error('Tracking error:', error);
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
    stopLocationTracking(tripId);
    Alert.alert('Stopped', 'Location tracking stopped!');
  };

  const handleLocationUpdate = (data) => {
    const { userId, latitude, longitude } = data;
    setMemberLocations(prev => {
      const updated = new Map(prev);
      updated.set(userId, { latitude, longitude });
      return updated;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripName} - Location</Text>
      </View>

      {/* Location Info */}
      <View style={styles.content}>
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Your Location</Text>
          {currentLocation ? (
            <View>
              <Text style={styles.locationText}>
                📍 Lat: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                📍 Lng: {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationText}>Getting location...</Text>
          )}
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Trip Members</Text>
          {memberLocations.size === 0 ? (
            <Text style={styles.locationText}>No other members sharing location</Text>
          ) : (
            Array.from(memberLocations.entries()).map(([userId, location]) => (
              <View key={userId} style={styles.memberItem}>
                <Text style={styles.memberText}>
                  👤 Member {userId.slice(-4)}
                </Text>
                <Text style={styles.locationText}>
                  📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking ? styles.stopButton : styles.startButton
            ]}
            onPress={isTracking ? stopTracking : startTracking}
          >
            <Ionicons
              name={isTracking ? "stop" : "play"}
              size={20}
              color="white"
            />
            <Text style={styles.buttonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.status}>
          <Text style={styles.statusText}>
            Status: {isTracking ? '🟢 Sharing location' : '🔴 Not sharing'}
          </Text>
          <Text style={styles.statusText}>
            Members visible: {memberLocations.size}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  controls: {
    marginTop: 20,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  status: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default SimpleLocationScreen;
