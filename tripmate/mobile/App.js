import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './context/ThemeContext';
import { 
  useFonts,
  Inter_800ExtraBold,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium,
  Inter_400Regular
} from '@expo-google-fonts/inter';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthNavigator from './navigation/AuthNavigator';
import AppNavigator from './navigation/AppNavigator';
import LoadingScreen from './screens/Auth/LoadingScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_800ExtraBold,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
  });

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <PaperProvider>
        <AuthProvider>
          <SocketProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AuthNavigator />
              <Toast />
            </NavigationContainer>
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
