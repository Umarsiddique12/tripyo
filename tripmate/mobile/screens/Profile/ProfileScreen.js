import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const menuItems = [
    {
      id: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      onPress: handleEditProfile,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      icon: 'settings-outline',
      onPress: handleSettings,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => {
        Alert.alert('Help & Support', 'Contact us at support@tripmate.com');
      },
    },
    {
      id: 'about',
      title: 'About TripMate',
      subtitle: 'Version 1.0.0',
      icon: 'information-circle-outline',
      onPress: () => {
        Alert.alert('About TripMate', 'TripMate v1.0.0\nYour travel companion for planning and managing trips with friends and family.');
      },
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
      onPress={item.onPress}
      activeOpacity={0.9}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={item.icon} size={22} color={colors.accent} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <LinearGradient
        colors={[ 'rgba(124,58,237,0.85)', 'rgba(11,18,32,0.0)' ]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Text style={[styles.title, { color: colors.primaryTextOn }]}>Profile</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: 'transparent' }]}>
          <View style={[styles.avatarContainer, { borderColor: colors.border }]}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
          {user?.bio ? (
            <Text style={[styles.userBio, { color: colors.textSecondary }]}>{user.bio}</Text>
          ) : null}
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuItems.map(renderMenuItem)}
        </View>

        <LinearGradient
          colors={[ '#F97373', '#DC3545' ]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        >
          <TouchableOpacity
            style={styles.logoutInner}
            onPress={handleLogout}
            disabled={isLoggingOut}
            activeOpacity={0.9}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 26,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 26, fontWeight: '800' },
  scrollView: {
    flex: 1,
  },
  profileSection: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 8 },
  userBio: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  menuSection: { marginHorizontal: 16, marginBottom: 24, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  menuItemSubtitle: { fontSize: 13 },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 14,
  },
  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutButtonDisabled: { opacity: 0.75 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});

export default ProfileScreen;
