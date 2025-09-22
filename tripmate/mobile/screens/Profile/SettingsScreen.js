import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';

const SettingsScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode || false);
  const [mediaAutoDownload, setMediaAutoDownload] = useState(user?.preferences?.mediaAutoDownload || true);
  const [notifications, setNotifications] = useState(user?.preferences?.notifications || true);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePreferenceChange = async (preference, value) => {
    setIsUpdating(true);
    try {
      const preferences = {
        ...user.preferences,
        [preference]: value,
      };

      const result = await updateProfile({ preferences });
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Settings updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update settings',
        });
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update settings',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    handlePreferenceChange('darkMode', value);
  };

  const handleMediaAutoDownloadToggle = (value) => {
    setMediaAutoDownload(value);
    handlePreferenceChange('mediaAutoDownload', value);
  };

  const handleNotificationsToggle = (value) => {
    setNotifications(value);
    handlePreferenceChange('notifications', value);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This will permanently delete your account and all associated data.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderSettingItem = (title, subtitle, icon, onPress, rightComponent) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightComponent || <Ionicons name="chevron-forward" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            'Dark Mode',
            'Use dark theme throughout the app',
            'moon-outline',
            null,
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              disabled={isUpdating}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          {renderSettingItem(
            'Auto-download Media',
            'Automatically download images and files',
            'download-outline',
            null,
            <Switch
              value={mediaAutoDownload}
              onValueChange={handleMediaAutoDownloadToggle}
              disabled={isUpdating}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'Push Notifications',
            'Receive notifications for new messages and updates',
            'notifications-outline',
            null,
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              disabled={isUpdating}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem(
            'Change Password',
            'Update your account password',
            'key-outline',
            handleChangePassword
          )}
          {renderSettingItem(
            'Delete Account',
            'Permanently delete your account',
            'trash-outline',
            handleDeleteAccount
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingItem(
            'App Version',
            '1.0.0',
            'information-circle-outline',
            null,
            <Text style={styles.versionText}>1.0.0</Text>
          )}
          {renderSettingItem(
            'Privacy Policy',
            'Read our privacy policy',
            'shield-outline',
            () => Alert.alert('Privacy Policy', 'Privacy policy will be available soon.')
          )}
          {renderSettingItem(
            'Terms of Service',
            'Read our terms of service',
            'document-text-outline',
            () => Alert.alert('Terms of Service', 'Terms of service will be available soon.')
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  versionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default SettingsScreen;
