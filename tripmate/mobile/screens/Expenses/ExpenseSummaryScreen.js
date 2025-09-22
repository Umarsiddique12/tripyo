import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI } from '../../api/expenses';
import Toast from 'react-native-toast-message';

const ExpenseSummaryScreen = ({ navigation, route }) => {
  const { trip } = route.params || {};
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (trip) {
      loadSummary();
    }
  }, [trip]);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const response = await expensesAPI.getExpenseSummary(trip._id, token);
      if (response.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Load summary error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load expense summary',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  const renderCategoryBreakdown = () => {
    if (!summary.categoryBreakdown) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {Object.entries(summary.categoryBreakdown).map(([category, amount]) => (
          <View key={category} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMemberBalances = () => {
    if (!summary.memberBalances) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Member Balances</Text>
        {Object.values(summary.memberBalances).map((balance) => (
          <View key={balance.userId} style={styles.balanceItem}>
            <View style={styles.balanceInfo}>
              <Text style={styles.memberName}>{balance.name}</Text>
              <Text style={styles.balanceDetails}>
                Paid: ${balance.totalPaid.toFixed(2)} | Owed: ${balance.totalOwed.toFixed(2)}
              </Text>
            </View>
            <Text
              style={[
                styles.balanceAmount,
                balance.balance > 0
                  ? styles.balancePositive
                  : balance.balance < 0
                  ? styles.balanceNegative
                  : styles.balanceZero,
              ]}
            >
              {balance.balance > 0 ? '+' : ''}${balance.balance.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSettlements = () => {
    if (!summary.settlements || summary.settlements.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settlement Suggestions</Text>
        {summary.settlements.map((settlement, index) => (
          <View key={index} style={styles.settlementItem}>
            <View style={styles.settlementInfo}>
              <Text style={styles.settlementFrom}>{settlement.fromName}</Text>
              <Ionicons name="arrow-forward" size={16} color="#666" />
              <Text style={styles.settlementTo}>{settlement.toName}</Text>
            </View>
            <Text style={styles.settlementAmount}>${settlement.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Expenses Yet</Text>
      <Text style={styles.emptyStateText}>
        Add some expenses to see the summary
      </Text>
    </View>
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </View>
    );
  }

  if (!summary || summary.totalExpenses === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Expense Summary</Text>
          <Text style={styles.subtitle}>{trip.name}</Text>
        </View>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expense Summary</Text>
        <Text style={styles.subtitle}>{trip.name}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>${summary.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>{summary.totalExpenses}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Currency</Text>
            <Text style={styles.summaryValue}>{summary.currency}</Text>
          </View>
        </View>

        {renderCategoryBreakdown()}
        {renderMemberBalances()}
        {renderSettlements()}
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  balanceDetails: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#4CAF50',
  },
  balanceNegative: {
    color: '#F44336',
  },
  balanceZero: {
    color: '#666',
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  settlementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settlementFrom: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  settlementTo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});

export default ExpenseSummaryScreen;
