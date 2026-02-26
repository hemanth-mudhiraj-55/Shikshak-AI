// API Base URL - adjust based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2000/api';


// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP_REGISTER: '/auth/verify-otp-register',
  LOGIN: '/auth/login',
  RESEND_OTP: '/auth/resend-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  ME: '/auth/me',
  VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  RESET_PASSWORD: '/auth/reset-password'
}
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken'
};


// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input fields.'
};