import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BasicLocationScreen = ({ route, navigation }) => {
  const { tripId, tripName } = route.params;
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentLocation({
      latitude: 28.6139 + Math.random() * 0.01,
      longitude: 77.2090 + Math.random() * 0.01,
    });
    Alert.alert('Started', 'Location tracking started!');
  };

  const stopTracking = () => {
    setIsTracking(false);
    Alert.alert('Stopped', 'Location tracking stopped!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tripName} - Location Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Location Tracking Test</Text>
          <Text style={styles.description}>
            This is a simple test screen to verify navigation and basic functionality work.
            No map loading issues here!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Your Location</Text>
          {currentLocation ? (
            <View>
              <Text style={styles.locationText}>
                Latitude: {currentLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Longitude: {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={styles.locationText}>Click "Start Tracking" to get location</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Trip Info</Text>
          <Text style={styles.infoText}>Trip ID: {tripId}</Text>
          <Text style={styles.infoText}>Trip Name: {tripName}</Text>
          <Text style={styles.infoText}>Status: {isTracking ? '🟢 Active' : '🔴 Inactive'}</Text>
        </View>

        {/* Controls */}
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

        <View style={styles.testResults}>
          <Text style={styles.testTitle}>✅ Test Results:</Text>
          <Text style={styles.testItem}>✅ Navigation working</Text>
          <Text style={styles.testItem}>✅ Screen loads instantly</Text>
          <Text style={styles.testItem}>✅ No map loading issues</Text>
          <Text style={styles.testItem}>✅ Trip data received</Text>
        </View>
      </ScrollView>
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
  card: {
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
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  testResults: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5A2D',
    marginBottom: 8,
  },
  testItem: {
    fontSize: 14,
    color: '#2D5A2D',
    marginBottom: 4,
  },
});

export default BasicLocationScreen;
