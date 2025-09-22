import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const GetStartedScreen = ({ navigation }) => {
  // TEMP: Force remote fallback to verify background renders; set to false after confirming local asset works
  const [useFallback, setUseFallback] = useState(true);
  return (
    <View style={styles.container}>
      <ImageBackground
        source={useFallback ? { uri: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1960&auto=format&fit=crop' } : require('../../assets/home-hero.jpg')}
        defaultSource={require('../../assets/23.png')}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
        onLoad={() => console.log('GetStarted background loaded')}
        onError={(e) => {
          console.warn('GetStarted background failed, using fallback', e?.nativeEvent);
          setUseFallback(true);
        }}
      >
        <LinearGradient
          colors={[ 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)' ]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="airplane" size={100} color="#ffffff" />
              <Text style={styles.title}>Welcome to TripMate</Text>
              <Text style={styles.subtitle}>
                Plan, manage, and track your trips with friends and family
              </Text>
            </View>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="people" size={30} color="#ffffff" />
                <Text style={styles.featureText}>Collaborate with friends</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="receipt" size={30} color="#ffffff" />
                <Text style={styles.featureText}>Track expenses easily</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="chatbubbles" size={30} color="#ffffff" />
                <Text style={styles.featureText}>Real-time group chat</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#007AFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  features: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 15,
    opacity: 0.9,
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
  },
});

export default GetStartedScreen;
