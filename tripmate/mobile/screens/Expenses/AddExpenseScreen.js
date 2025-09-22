import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI } from '../../api/expenses';
import Toast from 'react-native-toast-message';

const AddExpenseScreen = ({ navigation, route }) => {
  const { trip } = route.params || {};
  const { token, user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [splitType, setSplitType] = useState('equal');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { key: 'food', label: 'Food & Dining', icon: 'restaurant' },
    { key: 'transportation', label: 'Transportation', icon: 'car' },
    { key: 'accommodation', label: 'Accommodation', icon: 'bed' },
    { key: 'activities', label: 'Activities', icon: 'game-controller' },
    { key: 'shopping', label: 'Shopping', icon: 'bag' },
    { key: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
  ];

  const splitTypes = [
    { key: 'equal', label: 'Equal Split' },
    { key: 'custom', label: 'Custom Split' },
    { key: 'individual', label: 'Individual' },
  ];

  const handleAddExpense = async () => {
    if (!description.trim() || !amount.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid amount',
      });
      return;
    }

    if (!trip) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No trip selected',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calculate participants based on split type
      let participants = [];
      
      if (splitType === 'equal') {
        const amountPerPerson = expenseAmount / trip.members.length;
        participants = trip.members.map(member => ({
          user: member.user._id,
          amount: amountPerPerson,
          paid: false,
        }));
      } else {
        // For custom and individual splits, we'll need additional UI
        // For now, default to equal split
        const amountPerPerson = expenseAmount / trip.members.length;
        participants = trip.members.map(member => ({
          user: member.user._id,
          amount: amountPerPerson,
          paid: false,
        }));
      }

      const expenseData = {
        tripId: trip._id,
        description: description.trim(),
        amount: expenseAmount,
        currency: 'USD',
        category,
        splitType,
        participants,
      };

      const response = await expensesAPI.createExpense(expenseData, token);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Expense added successfully',
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to add expense',
        });
      }
    } catch (error) {
      console.error('Add expense error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add expense',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryItem = (categoryItem) => (
    <TouchableOpacity
      key={categoryItem.key}
      style={[
        styles.categoryItem,
        category === categoryItem.key && styles.categoryItemSelected,
      ]}
      onPress={() => setCategory(categoryItem.key)}
    >
      <Ionicons
        name={categoryItem.icon}
        size={24}
        color={category === categoryItem.key ? '#007AFF' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          category === categoryItem.key && styles.categoryTextSelected,
        ]}
      >
        {categoryItem.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSplitTypeItem = (splitTypeItem) => (
    <TouchableOpacity
      key={splitTypeItem.key}
      style={[
        styles.splitTypeItem,
        splitType === splitTypeItem.key && styles.splitTypeItemSelected,
      ]}
      onPress={() => setSplitType(splitTypeItem.key)}
    >
      <Text
        style={[
          styles.splitTypeText,
          splitType === splitTypeItem.key && styles.splitTypeTextSelected,
        ]}
      >
        {splitTypeItem.label}
      </Text>
    </TouchableOpacity>
  );

  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.errorText}>No trip selected</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.input}
              placeholder="What was this expense for?"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map(renderCategoryItem)}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Split Type</Text>
            <View style={styles.splitTypesContainer}>
              {splitTypes.map(renderSplitTypeItem)}
            </View>
          </View>

          <View style={styles.tripInfo}>
            <Text style={styles.tripInfoTitle}>Trip: {trip.name}</Text>
            <Text style={styles.tripInfoText}>
              {trip.members.length} member{trip.members.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            onPress={handleAddExpense}
            disabled={isLoading}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? 'Adding...' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 50,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  categoryTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  splitTypesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  splitTypeItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  splitTypeItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  splitTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  splitTypeTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tripInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tripInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tripInfoText: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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

export default AddExpenseScreen;
