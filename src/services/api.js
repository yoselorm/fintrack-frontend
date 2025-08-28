import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  }
};

// Financial data APIs
export const financialAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/api/financial/dashboard');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch financial data');
    }
  },

  // Simulated Plaid integration endpoint
  connectBank: async (publicToken) => {
    try {
      const response = await api.post('/api/financial/connect', {
        public_token: publicToken
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to connect bank account');
    }
  },

  // Refresh financial data
  refreshData: async () => {
    try {
      const response = await api.post('/api/financial/refresh');
      return response.data;
    } catch (error) {
      throw new Error('Failed to refresh financial data');
    }
  }
};

// Referral system APIs
export const referralAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/api/referrals/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch referral stats');
    }
  },

  generateNewCode: async () => {
    try {
      const response = await api.post('/api/referrals/generate-code');
      return response.data;
    } catch (error) {
      throw new Error('Failed to generate new referral code');
    }
  }
};

// AI insights APIs
export const aiAPI = {
  getSpendingInsights: async (timeframe = '30d') => {
    try {
      const response = await api.get(`/api/ai/insights?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch AI insights');
    }
  },

  getBudgetRecommendations: async () => {
    try {
      const response = await api.get('/api/ai/budget-recommendations');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch budget recommendations');
    }
  },

  detectAnomalies: async () => {
    try {
      const response = await api.get('/api/ai/anomalies');
      return response.data;
    } catch (error) {
      throw new Error('Failed to detect spending anomalies');
    }
  }
};

// Utility functions for security
export const securityUtils = {
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '');
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      suggestions: [
        ...(password.length < minLength ? ['At least 8 characters'] : []),
        ...(!hasUpperCase ? ['One uppercase letter'] : []),
        ...(!hasLowerCase ? ['One lowercase letter'] : []),
        ...(!hasNumbers ? ['One number'] : []),
        ...(!hasSpecialChar ? ['One special character (!@#$%^&*)'] : [])
      ]
    };
  },

  // Generate secure referral code
  generateSecureCode: (prefix = '') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Format currency safely
  formatCurrency: (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      return `$${parseFloat(amount).toFixed(2)}`;
    }
  },

  // Debounce function for API calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Error handling wrapper
export const apiErrorHandler = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      type: 'server_error'
    };
  } else if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      type: 'network_error'
    };
  } else {
    return {
      message: 'An unexpected error occurred',
      type: 'unknown_error'
    };
  }
};

// Real-time WebSocket connection for live updates
export class FinanceWebSocket {
  constructor(userId) {
    this.userId = userId;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {
      balance_update: [],
      transaction_alert: [],
      referral_update: []
    };
  }

  connect() {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/${this.userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(data) {
    const { type, payload } = data;
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(payload));
    }
  }

  subscribe(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    }
  }

  unsubscribe(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Analytics tracking
export const analytics = {
  track: (event, properties = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event, properties);
    }
    
  },

  identify: (userId, traits = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Identify:', userId, traits);
    }
  },

  page: (pageName, properties = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Page:', pageName, properties);
    }
  }
};

export default api;