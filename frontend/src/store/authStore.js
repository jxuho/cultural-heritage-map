import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// Adjust fields according to the actual backend response.
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [role] // Optional field
 * @property {Object} [settings] // Optional field
 * @property {string} [username] // Added username field
 * @property {string} [bio] // Added bio field
 * @property {string} [profileImage] // Added profileImage field
 */

// Create axios instance (if needed)
// Setting baseURL can prevent typing the full URL every time.
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Include HttpOnly cookies in all requests
});

const useAuthStore = create(devtools((set) => ({
  /** @type {User | null} */
  user: null, // User information
  isAuthenticated: false, // Authentication status
  loading: true, // Initial authentication status loading state

  // Login action (also sets current user information)
  login: (/** @type {User} */ userData) => {
    set({ user: userData, isAuthenticated: true });
  },

  // ✨ Added action: Update user information
  updateUser: (/** @type {Partial<User>} */ userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : userData,
    }));
  },

  // Logout action
  logout: async () => {
    try {
      // Use axios for POST request
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
      // Extract message from axios error response (optional)
      if (error.response) {
        console.error('Logout API call failed:', error.response.status, error.response.data);
      }
    } finally {
      // Initialize client state regardless of API call success
      set({ user: null, isAuthenticated: false });
    }
  },

  // Check initial authentication status (called on app startup)
  checkAuthStatus: async () => {
    set({ loading: true });
    try {
      // Use axios for GET request
      const response = await api.get('/users/me');

      // axios automatically treats 2xx status codes as success,
      // and puts the response data in response.data.
      set({ user: response.data.data.user, isAuthenticated: true });
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // Extract message from axios error response (optional)
      if (error.response) {
        console.warn('Authentication check failed:', error.response.status, error.response.data);
      }
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
})));

export default useAuthStore;