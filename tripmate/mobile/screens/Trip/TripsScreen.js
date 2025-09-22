import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../context/AuthContext';
import { tripsAPI } from '../../api/trips';
import { useTheme } from '../../context/ThemeContext';

const TripsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const response = await tripsAPI.getTrips({}, token);
      if (response?.success) {
        setTrips(response.data.trips || []);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response?.message || 'Failed to load trips' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load trips' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const onRefresh = () => { setRefreshing(true); loadTrips(); };

  const getStatus = (status) => {
    switch (status) {
      case 'planning': return { colors: ['#F6C77A', '#E89F28'], icon: 'calendar' };
      case 'active': return { colors: ['#5EE7A2', '#22C55E'], icon: 'play-circle' };
      case 'completed': return { colors: ['#B0B8C1', '#6C757D'], icon: 'checkmark-circle' };
      case 'cancelled': return { colors: ['#FF8A8A', '#DC3545'], icon: 'close-circle' };
      default: return { colors: ['#8FB5FF', '#3B82F6'], icon: 'map' };
    }
  };

  const renderItem = ({ item }) => {
    const s = getStatus(item.status);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('TripDetails', { tripId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.destination || 'No destination set'}
            </Text>
          </View>
          <LinearGradient colors={s.colors} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.badge}>
            <Ionicons name={s.icon} size={16} color="#fff" />
            <Text style={styles.badgeText}>{item.status}</Text>
          </LinearGradient>
        </View>
        {item.description ? (
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.rowCenter}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {item.memberCount} members
            </Text>
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {moment(item.startDate).format('MMM DD, YYYY')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Your Trips</Text>
      <FlatList
        data={trips}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 6 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}> 
            <Ionicons name="airplane-outline" size={72} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No trips yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap the + button to create your first trip
            </Text>
          </View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 22, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { fontSize: 13, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6, textTransform: 'capitalize' },
  desc: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 13, marginLeft: 6 },
  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptyText: { fontSize: 14, marginTop: 4 },
});

export default TripsScreen;
