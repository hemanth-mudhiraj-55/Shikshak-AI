export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP_REGISTER: '/auth/verify-otp-register',
    LOGIN: '/auth/login',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    UPDATE_PREFERENCES: '/auth/preferences',
    UPLOAD_PROFILE_PICTURE: '/auth/profile-picture',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  TODOS: {
    BASE: '/todos',
  },
  EVENTS: {
    BASE: '/events',
  },
  BOOKS: {
    BASE: '/books',
    STATS: '/books/stats',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  TEACHERS: {
    BASE: '/teachers',
    STATS: '/teachers/stats',
    PREPARE_AVATAR: (id) => `/teachers/${id}/prepare-avatar`,
    LIVE_SESSION: (id) => `/teachers/${id}/live-session`,
    LIVE_SESSIONS: (id) => `/teachers/${id}/live-sessions`,
    SESSION: (id) => `/teachers/sessions/${id}`,
    ASK: (id) => `/teachers/sessions/${id}/ask`,
    INTERRUPT: (id) => `/teachers/sessions/${id}/interrupt`,
    FEEDBACK: (id) => `/teachers/sessions/${id}/feedback`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ_ALL: '/notifications/read-all',
    READ: (id) => `/notifications/${id}/read`,
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    USERS: '/messages/users',
    BASE: '/messages',
  },
  HOMEWORK: {
    BASE: '/homework',
  },
  EXAMS: {
    BASE: '/exams',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    STATS: '/transactions/stats',
  },
  FEES: {
    OVERVIEW: '/fees/overview',
    INVOICES: '/fees/invoices',
    PAYMENTS: '/fees/payments',
    PAY_INVOICE: (id) => `/fees/invoices/${id}/pay`,
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_STATUS: (id) => `/admin/users/${id}/status`,
  },
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION_ERROR: 'Please check your input fields.',
};
