import axios from 'axios';

// Base URL - adjust according to your environment
const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or however you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Statistics Factory
 * Contains all API calls for statistics
 */
export const statisticsFactory = {
  /**
   * Get monthly statistics
   * @param {Object} params - { ownerId?, month?, year? }
   * @returns {Promise<Object>} { totalBooking, totalCancel, totalRevenue, month, year }
   */
  getStaticsMonth: (params = {}) => {
    return apiClient.get('/statistics/month', { params });
  },

  /**
   * Get yearly revenue statistics
   * @param {Object} params - { ownerId?, year? }
   * @returns {Promise<Object>} { monthlyRevenue: [], year }
   */
  getStaticsYearRevenue: (params = {}) => {
    return apiClient.get('/statistics/year-revenue', { params });
  },

  /**
   * Get yearly booking statistics
   * @param {Object} params - { ownerId?, year? }
   * @returns {Promise<Object>} { monthlyBooking: [], year }
   */
  getStaticsYearTicket: (params = {}) => {
    return apiClient.get('/statistics/year-ticket', { params });
  },

  /**
   * Get top trending cities/routes
   * @param {Object} params - { year?, limit? }
   * @returns {Promise<Object>} { trendingCities: [], year }
   */
  getTopRouter: (params = {}) => {
    return apiClient.get('/statistics/top-router', { params });
  },

  /**
   * Get top accommodations by revenue
   * @param {Object} params - { year?, limit? }
   * @returns {Promise<Object>} { topAccommodations: [], year }
   */
  getStaticsYearTopHost: (params = {}) => {
    return apiClient.get('/statistics/top-hosts', { params });
  },

  /**
   * Get all hosts
   * @returns {Promise<Array>} Array of host objects
   */
  getAllHosts: () => {
    return apiClient.get('/statistics/hosts');
  },

  /**
   * Get homestays by host
   * @param {Object} params - { ownerId: string }
   * @returns {Promise<Array>} Array of homestay objects
   */
  getHomestaysByHost: (params) => {
    return apiClient.get('/statistics/homestays-by-host', { params });
  },

  /**
   * Get detailed statistics for a homestay
   * @param {Object} params - { accommodationId: string, filter: 'day'|'week'|'month', date?: string }
   * @returns {Promise<Object>} { data: { revenue: [], booking: [], filter, date, period } }
   */
  getHomestayStats: (params) => {
    return apiClient.get('/statistics/homestay-stats', { params });
  },
};

// Also export individual functions for convenience
export const {
  getStaticsMonth,
  getStaticsYearRevenue,
  getStaticsYearTicket,
  getTopRouter,
  getStaticsYearTopHost,
  getAllHosts,
  getHomestaysByHost,
  getHomestayStats,
} = statisticsFactory;

// Export as default
export default statisticsFactory;