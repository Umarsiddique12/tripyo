import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

const MapDebugger = () => {
  const [mapReady, setMapReady] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert('Error', 'Failed to get location permission');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Map Ready: {mapReady ? '✅' : '❌'}</Text>
        <Text style={styles.debugText}>Location Permission: {locationPermission || 'Checking...'}</Text>
        <Text style={styles.debugText}>Current Location: {currentLocation ? '✅' : '❌'}</Text>
      </View>
      
      <MapView
        style={styles.map}
        onMapReady={() => {
          console.log('Map is ready!');
          setMapReady(true);
        }}
        onError={(error) => {
          console.error('Map error:', error);
          Alert.alert('Map Error', error.message);
        }}
        initialRegion={{
          latitude: currentLocation?.latitude || 28.6139,
          longitude: currentLocation?.longitude || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  map: {
    flex: 1,
  },
});

export default MapDebugger;
