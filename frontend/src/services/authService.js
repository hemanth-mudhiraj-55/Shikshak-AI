import { api, tokenService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from './apiConstants';

export const authService = {
  sendOTP: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SEND_OTP, { email });
    return response;
  },

  verifyOTPAndRegister: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP_REGISTER, userData);
    if (response.success && response.data?.data?.token && response.data?.data?.user) {
      tokenService.setToken(response.data.data.token);
      tokenService.setUser(response.data.data.user);
    }
    return response;
  },

  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.success && response.data?.data?.token && response.data?.data?.user) {
      tokenService.setToken(response.data.data.token);
      tokenService.setUser(response.data.data.user);
      if (response.data.data.refreshToken) {
        tokenService.setRefreshToken(response.data.data.refreshToken);
      }
    }
    return response;
  },

  resendOTP: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
    return response;
  },

  forgotPassword: async (identifier) => {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, identifier);
    return response;
  },

  verifyOTP: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, data);
    return response;
  },

  resetPassword: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response;
  },

  updateProfile: async (data) => {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    if (response.success && response.data?.data?.user) {
      tokenService.setUser(response.data.data.user);
    }
    return response;
  },

  updatePreferences: async (data) => {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PREFERENCES, data);
    if (response.success && response.data?.data?.user) {
      tokenService.setUser(response.data.data.user);
    }
    return response;
  },

  uploadProfilePicture: async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const response = await api.postForm(API_ENDPOINTS.AUTH.UPLOAD_PROFILE_PICTURE, form);
    if (response.success && response.data?.data?.user) {
      tokenService.setUser(response.data.data.user);
    }
    return response;
  },

  changePassword: async (data) => {
    const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
    return response;
  },

  logout: () => {
    tokenService.removeToken();
    return { success: true };
  },

  isAuthenticated: () => tokenService.isAuthenticated(),

  getStoredUser: () => tokenService.getUser(),
};

export default authService;
