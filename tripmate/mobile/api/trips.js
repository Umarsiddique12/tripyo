import { API_URL, API_ENDPOINTS } from './config';

const makeAuthenticatedRequest = async (endpoint, options = {}, token) => {
  try {
    const fullUrl = `${API_URL}${endpoint}`;
    console.log('🌐 Making API request to:', fullUrl);
    console.log('🔑 Token present:', token ? 'Yes' : 'No');
    
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('💥 API Request Error:', error);
    throw error;
  }
};

export const tripsAPI = {
  createTrip: async (tripData, token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.TRIPS.CREATE, {
      method: 'POST',
      body: JSON.stringify(tripData),
    }, token);
  },

  getTrips: async (params = {}, token) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `${API_ENDPOINTS.TRIPS.GET_ALL}?${queryParams}`
      : API_ENDPOINTS.TRIPS.GET_ALL;
    
    return makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    }, token);
  },

  getTrip: async (tripId, token) => {
    const endpoint = `${API_ENDPOINTS.TRIPS.GET_ONE}/${tripId}`;
    console.log('🌐 API Call - getTrip:', endpoint);
    return makeAuthenticatedRequest(endpoint, {
      method: 'GET',
    }, token);
  },

  updateTrip: async (tripId, tripData, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.TRIPS.UPDATE}/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    }, token);
  },

  deleteTrip: async (tripId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.TRIPS.DELETE}/${tripId}`, {
      method: 'DELETE',
    }, token);
  },

  inviteMember: async (tripId, email, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.TRIPS.INVITE_MEMBER}/${tripId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, token);
  },

  removeMember: async (tripId, memberId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.TRIPS.REMOVE_MEMBER}/${tripId}/members/${memberId}`, {
      method: 'DELETE',
    }, token);
  },

  leaveTrip: async (tripId, token) => {
    return makeAuthenticatedRequest(`${API_ENDPOINTS.TRIPS.LEAVE_TRIP}/${tripId}/leave`, {
      method: 'POST',
    }, token);
  },
};
