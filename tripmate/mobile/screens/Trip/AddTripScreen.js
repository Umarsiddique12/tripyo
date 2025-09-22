import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { tripsAPI } from '../../api/trips';

const AddTripScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Missing name', text2: 'Please enter a trip name' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        startDate: new Date().toISOString(),
        budget: { total: 0, currency: 'USD' },
      };
      const res = await tripsAPI.createTrip(payload, token);
      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Trip created' });
        navigation.goBack();
        // After closing, optionally navigate to the new trip list via event, for now rely on refresh in lists
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res?.message || 'Failed to create trip' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create trip' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Trip</Text>
        <TouchableOpacity onPress={onCreate} disabled={submitting} style={styles.createCta}>
          <Text style={[styles.createText, submitting && { opacity: 0.6 }]}>{submitting ? 'Creating...' : 'Create'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Trip name</Text>
            <TextInput
              placeholder="e.g. Goa Friends Getaway"
              placeholderTextColor="#9AA4B2"
              style={styles.input}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Add a short description (optional)"
              placeholderTextColor="#9AA4B2"
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.tip}>
            <Ionicons name="sparkles" size={16} color="#7C3AED" />
            <Text style={styles.tipText}>Pro tip: You can invite members from the Trip Details screen after creating.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(11,18,32,0.85)'
  },
  iconBtn: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#F9FAFB', fontSize: 20, fontWeight: '800', marginTop: 8 },
  createCta: { position: 'absolute', right: 20, bottom: 16 },
  createText: { color: '#7C3AED', fontSize: 16, fontWeight: '800' },

  content: { flex: 1, padding: 20 },
  inputWrap: { marginBottom: 18 },
  label: { color: '#CBD5E1', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#E5E7EB',
    fontSize: 16,
  },
  textarea: { height: 120 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)' },
  tipText: { color: '#D6BBFB', fontSize: 13, flex: 1 },
});

export default AddTripScreen;
