import { API_URL, API_ENDPOINTS } from './config';

const makeRequest = async (endpoint, options = {}) => {
  const fullUrl = `${API_URL}${endpoint}`;
  
  console.log('🚀 Making API Request:', {
    url: fullUrl,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body ? JSON.parse(options.body) : undefined
  });

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json();
    console.log('📦 Response data:', data);

    if (!response.ok) {
      console.error('❌ Request failed:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      throw new Error(data.message || 'Request failed');
    }

    console.log('✅ Request successful');
    return data;
  } catch (error) {
    console.error('💥 API Request Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      url: fullUrl,
      options: options
    });
    throw error;
  }
};

const makeAuthenticatedRequest = async (endpoint, options = {}, token) => {
  return makeRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

export const authAPI = {
  login: async (email, password) => {
    console.log('🔐 Login attempt:', { email, passwordLength: password.length });
    return makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    console.log('📝 Register attempt:', { name, email, passwordLength: password.length });
    return makeRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  getMe: async (token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    }, token);
  },

  updateProfile: async (profileData, token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, token);
  },

  updatePassword: async (passwordData, token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }, token);
  },

  deleteAccount: async (password, token) => {
    return makeAuthenticatedRequest(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }, token);
  },
};
