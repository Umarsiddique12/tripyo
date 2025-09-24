import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import HomeScreen from '../screens/Home/HomeScreen';
import TripDetailsScreen from '../screens/Trip/TripDetailsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import AddExpenseScreen from '../screens/Expenses/AddExpenseScreen';
import ExpenseSummaryScreen from '../screens/Expenses/ExpenseSummaryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import InviteMemberScreen from '../screens/Trip/InviteMemberScreen';
import TripsScreen from '../screens/Trip/TripsScreen';
import AddTripScreen from '../screens/Trip/AddTripScreen';
import LocationTrackingScreen from '../screens/Trip/LocationTrackingScreen';
import SimpleLocationScreen from '../screens/Trip/SimpleLocationScreen';
import BasicLocationScreen from '../screens/Trip/BasicLocationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const TripsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="TripsHome"
      component={TripsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TripDetails" 
      component={TripDetailsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="InviteMember" 
      component={InviteMemberScreen}
      options={{ 
        title: 'Invite Member',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="ChatMain" 
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ExpensesMain" 
      component={ExpensesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddExpense" 
      component={AddExpenseScreen}
      options={{ 
        title: 'Add Expense',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="ExpenseSummary" 
      component={ExpenseSummaryScreen}
      options={{ 
        title: 'Expense Summary',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="LocationTracking" 
      component={BasicLocationScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Custom center tab button for Add Trip
const AddTabButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.addButton}
      onPress={() => navigation.navigate('AddTripModal')}
    >
      <View style={styles.addButtonInner}>
        <Ionicons name="add" size={26} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ 
        title: 'Edit Profile',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
      }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ 
        title: 'Settings',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
      }}
    />
  </Stack.Navigator>
);

const TabsNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Trips') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }
        if (!iconName) return null;
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#7C3AED',
      tabBarInactiveTintColor: '#98A2B3',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      tabBarStyle: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 18,
        backgroundColor: 'rgba(11,18,32,0.92)',
        borderTopWidth: 0,
        height: 72,
        paddingBottom: 10,
        paddingTop: 10,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 24,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen
      name="AddTripLauncher"
      component={() => null}
      options={{
        tabBarLabel: '',
        tabBarIcon: () => null,
        tabBarButton: () => <AddTabButton />,
      }}
    />
    <Tab.Screen
      name="Trips"
      component={TripsStack}
      options={{
        // Hide Trips from the bottom tab bar but keep it navigable
        tabBarButton: () => null,
      }}
    />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={TabsNavigator} />
      <RootStack.Screen
        name="AddTripModal"
        component={AddTripScreen}
        options={{ presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
};

const styles = StyleSheet.create({
  addButton: {
    top: -18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)'
  },
});

export default AppNavigator;
