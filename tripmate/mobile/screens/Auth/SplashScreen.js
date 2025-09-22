import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/home-hero.jpg')}
      defaultSource={require('../../assets/23.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient colors={[ 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)' ]} style={styles.overlay}>
      <View style={styles.container}>
        <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        >
          <Ionicons name="airplane" size={80} color="#FFFFFF" />
          <Text style={styles.logoText}>TripMate</Text>
          <Text style={styles.tagline}>Your Travel Companion</Text>
        </Animated.View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  version: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default SplashScreen;
