import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI } from '../../api/expenses';
import { tripsAPI } from '../../api/trips';
import Toast from 'react-native-toast-message';

const ExpensesScreen = ({ navigation, route }) => {
  const { trip, tripId } = route.params || {};
  const { token } = useAuth();
  const [tripData, setTripData] = useState(trip);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (tripId && !trip) {
      loadTripDetails();
    } else if (trip) {
      setTripData(trip);
      loadExpenses();
    }
  }, [tripId, trip]);

  const loadTripDetails = async () => {
    try {
      const response = await tripsAPI.getTrip(tripId, token);
      if (response.success) {
        setTripData(response.data.trip);
        loadExpenses();
      }
    } catch (error) {
      console.error('Load trip details error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load trip details',
      });
    }
  };

  const loadExpenses = async () => {
    if (!tripData) return;
    
    try {
      setIsLoading(true);
      const response = await expensesAPI.getTripExpenses(tripData._id, {}, token);
      if (response.success) {
        setExpenses(response.data.expenses);
      }
    } catch (error) {
      console.error('Load expenses error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load expenses',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense', { trip: tripData });
  };

  const handleViewSummary = () => {
    navigation.navigate('ExpenseSummary', { trip: tripData });
  };

  const handleExpensePress = (expense) => {
    // TODO: Navigate to expense details screen
    Alert.alert('Expense Details', `Description: ${expense.description}\nAmount: $${expense.amount}`);
  };

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.expenseItem}
      onPress={() => handleExpensePress(item)}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
        </View>
        <Text style={styles.expenseAmount}>${item.amount}</Text>
      </View>
      <View style={styles.expenseFooter}>
        <Text style={styles.expenseAddedBy}>Added by {item.addedBy.name}</Text>
        <Text style={styles.expenseDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Expenses Yet</Text>
      <Text style={styles.emptyStateText}>
        Start tracking your trip expenses by adding the first one
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExpense}>
        <Text style={styles.emptyStateButtonText}>Add First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  if (!tripData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>No trip selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>{tripData.name}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.summaryButton} onPress={handleViewSummary}>
          <Ionicons name="analytics" size={20} color="#007AFF" />
          <Text style={styles.summaryButtonText}>Summary</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  summaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseAddedBy: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
});

export default ExpensesScreen;
