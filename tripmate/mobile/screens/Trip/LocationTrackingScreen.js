import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const LocationTrackingScreen = ({ route, navigation }) => {
  const { tripId, tripName } = route.params;
  const { user } = useAuth();
  const {
    startLocationTracking,
    stopLocationTracking,
    updateLocation,
    requestCurrentLocations,
    onLocationUpdate,
    onUserStartedTracking,
    onUserStoppedTracking,
    onRequestLocation,
  } = useSocket();

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [memberLocations, setMemberLocations] = useState(new Map());
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139, // Default to Delhi
    longitude: 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    // Request location permissions
    requestLocationPermission();

    // Set up socket event listeners
    const unsubscribeLocationUpdate = onLocationUpdate(handleLocationUpdate);
    const unsubscribeUserStartedTracking = onUserStartedTracking(handleUserStartedTracking);
    const unsubscribeUserStoppedTracking = onUserStoppedTracking(handleUserStoppedTracking);
    const unsubscribeRequestLocation = onRequestLocation(handleLocationRequest);

    // Request current locations from other users
    requestCurrentLocations(tripId);

    return () => {
      // Cleanup
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (isTracking) {
        stopLocationTracking(tripId);
      }
      unsubscribeLocationUpdate?.();
      unsubscribeUserStartedTracking?.();
      unsubscribeUserStoppedTracking?.();
      unsubscribeRequestLocation?.();
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to track your location and share it with trip members.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(initialLocation);
      setMapRegion({
        ...initialLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to get location permission');
      return false;
    }
  };

  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      // Start location tracking
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
          };

          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          // Send location update via socket
          updateLocation(tripId, locationData);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
      startLocationTracking(tripId);

      Alert.alert(
        'Location Tracking Started',
        'Your location is now being shared with trip members.'
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    setIsTracking(false);
    stopLocationTracking(tripId);

    Alert.alert(
      'Location Tracking Stopped',
      'Your location is no longer being shared.'
    );
  };

  const handleLocationUpdate = (data) => {
    const { userId, latitude, longitude, accuracy, timestamp } = data;
    
    setMemberLocations(prev => {
      const updated = new Map(prev);
      updated.set(userId, {
        latitude,
        longitude,
        accuracy,
        timestamp,
      });
      return updated;
    });
  };

  const handleUserStartedTracking = (data) => {
    console.log(`User ${data.userId} started tracking location`);
  };

  const handleUserStoppedTracking = (data) => {
    console.log(`User ${data.userId} stopped tracking location`);
    setMemberLocations(prev => {
      const updated = new Map(prev);
      updated.delete(data.userId);
      return updated;
    });
  };

  const handleLocationRequest = (data) => {
    // If someone requests current locations and we're tracking, send our current location
    if (isTracking && currentLocation) {
      updateLocation(tripId, {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const centerOnAllLocations = () => {
    const allLocations = [];
    
    if (currentLocation) {
      allLocations.push(currentLocation);
    }

    memberLocations.forEach(location => {
      allLocations.push({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    });

    if (allLocations.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(allLocations, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripName} - Live Tracking</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Map */}
      {mapError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Map Error: {mapError}</Text>
          <Text style={styles.errorSubtext}>Please check your internet connection and try again.</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
        >
        {/* Current user location */}
        {currentLocation && (
          <>
            <Marker
              coordinate={currentLocation}
              title="You"
              description="Your current location"
              pinColor="blue"
            >
              <View style={styles.currentUserMarker}>
                <Ionicons name="person" size={16} color="white" />
              </View>
            </Marker>
            <Circle
              center={currentLocation}
              radius={50}
              strokeColor="rgba(0, 122, 255, 0.5)"
              fillColor="rgba(0, 122, 255, 0.1)"
            />
          </>
        )}

        {/* Other members' locations */}
        {Array.from(memberLocations.entries()).map(([userId, location]) => (
          <React.Fragment key={userId}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Member ${userId}`}
              description="Trip member location"
              pinColor="red"
            >
              <View style={styles.memberMarker}>
                <Ionicons name="person" size={16} color="white" />
              </View>
            </Marker>
            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={location.accuracy || 50}
              strokeColor="rgba(255, 59, 48, 0.5)"
              fillColor="rgba(255, 59, 48, 0.1)"
            />
          </React.Fragment>
        ))}
        </MapView>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnCurrentLocation}
          >
            <Ionicons name="locate" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnAllLocations}
          >
            <Ionicons name="people" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking ? styles.trackingButtonActive : styles.trackingButtonInactive
            ]}
            onPress={isTracking ? stopTracking : startTracking}
          >
            <Ionicons
              name={isTracking ? "stop" : "play"}
              size={20}
              color="white"
            />
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isTracking ? '🟢 Sharing location' : '🔴 Not sharing location'}
          </Text>
          <Text style={styles.membersText}>
            {memberLocations.size} member{memberLocations.size !== 1 ? 's' : ''} visible
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  currentUserMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  memberMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  trackingButtonActive: {
    backgroundColor: '#FF3B30',
  },
  trackingButtonInactive: {
    backgroundColor: '#34C759',
  },
  trackingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  membersText: {
    fontSize: 12,
    color: '#666',
  },
});

export default LocationTrackingScreen;
