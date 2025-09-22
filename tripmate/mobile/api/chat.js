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

export const chatAPI = {
  getTripMessages: async (tripId, params = {}, token) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_ENDPOINTS.CHAT.GET_MESSAGES}/${tripId}?${queryParams}`
      : `${API_ENDPOINTS.CHAT.GET_MESSAGES}/${tripId}`;
    
    return makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    }, token);
  },

  sendMessage: async (tripId, messageData, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.SEND_MESSAGE}/${tripId}`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    }, token);
  },

  editMessage: async (messageId, messageData, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.EDIT_MESSAGE}/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(messageData),
    }, token);
  },

  deleteMessage: async (messageId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.DELETE_MESSAGE}/${messageId}`, {
      method: 'DELETE',
    }, token);
  },

  addReaction: async (messageId, emoji, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.ADD_REACTION}/${messageId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }, token);
  },

  removeReaction: async (messageId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.REMOVE_REACTION}/${messageId}/reaction`, {
      method: 'DELETE',
    }, token);
  },

  markAsRead: async (tripId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.CHAT.MARK_AS_READ}/${tripId}/read`, {
      method: 'POST',
    }, token);
  },
};
