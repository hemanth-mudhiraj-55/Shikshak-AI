const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin, validateOTP, validateEmailOnly, validateForgotPassword, validateResetPassword } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// Public routes
router.post('/send-otp', validateEmailOnly, authController.sendOTP);
router.post('/verify-otp-register', validateOTP, authController.verifyOTPAndRegister);
router.post('/login', validateLogin, authController.login);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/preferences', authMiddleware, authController.updatePreferences);
router.post('/profile-picture', authMiddleware, uploadAvatar, authController.uploadProfilePicture);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
