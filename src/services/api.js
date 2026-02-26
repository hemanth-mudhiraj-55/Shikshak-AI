import { API_BASE_URL, STORAGE_KEYS, ERROR_MESSAGES } from './apiConstants';

// Custom fetch wrapper
const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // ✅ Always use STORAGE_KEYS
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);



  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // ✅ Attach token if exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error(data.message || ERROR_MESSAGES.VALIDATION_ERROR);

        case 401:
          const isLoginEndpoint = endpoint.includes('/login');

          if (!isLoginEndpoint) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (
              !window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/')
            ) {
              window.location.href = '/';
            }

            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          }

          throw new Error(data.message || 'Invalid credentials');

        case 403:
          throw new Error(data.message || 'Access forbidden');

        case 404:
          throw new Error('Resource not found');

        case 429:
          throw new Error('Too many requests. Please try again later.');

        case 500:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);

        default:
          throw new Error(data.message || `Error ${response.status}`);
      }
    }

    return {
      success: true,
      data,
      status: response.status,
    };

  } catch (error) {
    console.error('API Error:', error);

    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    throw error;
  }
};

// HTTP Methods
export const api = {
  get: (endpoint, options = {}) =>
    fetchApi(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint, data, options = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data, options = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options = {}) =>
    fetchApi(endpoint, { ...options, method: 'DELETE' }),
};

// Token Management
export const tokenService = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),

  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  setRefreshToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getRefreshToken: () =>
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token; // ✅ Simple & safe
  },
};

export default api;
