const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check your input fields',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    next();
  }
];

const validateEmailOnly = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];



const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email or username is required')
    .custom((value) => {
      const v = String(value || '').trim();
      // Allow either a real email or a username like "admin"
      if (!v) return false;
      if (v.includes('@')) {
        // Basic email shape check; keep it permissive.
        // express-validator's isEmail is stricter but we'd lose username logins.
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
      return true;
    }).withMessage('Please provide a valid email or username'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

const validateOTP = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

const validateForgotPassword = [
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Email or username is required' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
    }
    next();
  }
];

const validateResetPassword = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('newPassword').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
    }
    next();
  }
];

const validateTodo = [
  body('text').trim().notEmpty().withMessage('Task text is required'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
    }
    next();
  }
];

const validateEvent = [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('date').notEmpty().withMessage('Event date is required'),
  body('type').optional().isIn(['meeting', 'deadline', 'task', 'reminder']).withMessage('Invalid event type'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateOTP,
  validateEmailOnly,
  validateForgotPassword,
  validateResetPassword,
  validateTodo,
  validateEvent
};
