import { API_URL, API_ENDPOINTS } from './config';

const makeAuthenticatedRequest = async (endpoint, options = {}, token) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const expensesAPI = {
  createExpense: async (expenseData, token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.EXPENSES.CREATE, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }, token);
  },

  getTripExpenses: async (tripId, params = {}, token) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_ENDPOINTS.EXPENSES.GET_TRIP_EXPENSES}/${tripId}?${queryParams}`
      : `${API_ENDPOINTS.EXPENSES.GET_TRIP_EXPENSES}/${tripId}`;
    
    return makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    }, token);
  },

  getExpense: async (expenseId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.EXPENSES.GET_ONE}/${expenseId}`, {
      method: 'GET',
    }, token);
  },

  updateExpense: async (expenseId, expenseData, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.EXPENSES.UPDATE}/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    }, token);
  },

  deleteExpense: async (expenseId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.EXPENSES.DELETE}/${expenseId}`, {
      method: 'DELETE',
    }, token);
  },

  getExpenseSummary: async (tripId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.EXPENSES.GET_SUMMARY}/${tripId}/summary`, {
      method: 'GET',
    }, token);
  },

  settleExpense: async (expenseId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.EXPENSES.SETTLE}/${expenseId}/settle`, {
      method: 'PUT',
    }, token);
  },
};
