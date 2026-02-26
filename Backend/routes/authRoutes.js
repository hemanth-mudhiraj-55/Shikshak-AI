const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, validateOTP,validateEmailOnly } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
// router.post('/send-otp', validateRegistration, authController.sendOTP);
router.post('/send-otp', validateEmailOnly, authController.sendOTP);
router.post('/verify-otp-register', validateOTP, authController.verifyOTPAndRegister);
router.post('/login', validateLogin, authController.login);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;