import { api, tokenService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from './apiConstants';

// Authentication Service
export const authService = {
  // Send OTP for registration
  sendOTP: async (email) => {
    console.log('EMAIL BEING SENT:', email);
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SEND_OTP, { email });
      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  },

  // Verify OTP and register user
  verifyOTPAndRegister: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP_REGISTER, userData);
      
      if (response.success && response.data.data.token && response.data.data.user) {
  tokenService.setToken(response.data.data.token);
  tokenService.setUser(response.data.data.user);
}
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      if (response.success && response.data.data.token && response.data.data.user) {
  tokenService.setToken(response.data.data.token);
  tokenService.setUser(response.data.data.user);
}
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Get current user (protected endpoint)
  getCurrentUser: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    tokenService.removeToken();
    return { success: true, message: 'Logged out successfully' };
  },

  // Check authentication status
  isAuthenticated: () => {
    return tokenService.isAuthenticated();
  },

  // Get stored user data
  getStoredUser: () => {
    return tokenService.getUser();
  },

  forgotPassword: async (identifier) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, identifier);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to send OTP');
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Verify OTP for password reset
  verifyOTP: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, data);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Invalid OTP');
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to reset password');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

export default authService;