const User = require('../models/User');
const { generateToken,generateRefreshToken } = require('../utils/generateToken');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

class AuthController {
  // Send OTP for registration
  async sendOTP(req, res) {
    try {
      const { email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Check if can request new OTP
      const canRequest = await otpService.canRequestOTP(email);
      if (!canRequest) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP'
        });
      }

      // Generate and save OTP
      const otp = await otpService.createOTP(email);

      // Send OTP via email
      await emailService.sendOTP(email, otp);

      // Get current attempts
      const attempts = await otpService.getOTPAttempts(email);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          email,
          attempts,
          expiresIn: 300 // 5 minutes in seconds
        }
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }

  // Verify OTP and register user
  async verifyOTPAndRegister(req, res) {
    try {
      const { username, email, password, otp } = req.body;

      // Verify OTP
      const otpVerification = await otpService.verifyOTP(email, otp);
      
      if (!otpVerification.isValid) {
        return res.status(400).json({
          success: false,
          message: otpVerification.message
        });
      }

      // Check if user already exists (double check)
      const existingUser = await User.findOne({ 
        $or: [
          { email: email.toLowerCase() },
          { username }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email.toLowerCase() 
            ? 'User already exists with this email' 
            : 'Username already taken'
        });
      }

      // Create new user
      const user = new User({
        username,
        email: email.toLowerCase(),
        password,
        isVerified: true
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id, user.role);

      // Send welcome email
      emailService.sendWelcomeEmail(email, username);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  // Login user

// Login user
async login(req, res) {
  try {
    const { email, password } = req.body;
    

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user - MAKE SURE TO INCLUDE PASSWORD FIELD
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.accountStatus}`
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Return user data WITHOUT password
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
}

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user data'
      });
    }
  }

  // Resend OTP
  async resendOTP(req, res) {
    try {
      const { email } = req.body;

      // Check if can request new OTP
      const canRequest = await otpService.canRequestOTP(email);
      if (!canRequest) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 60 seconds before requesting another OTP'
        });
      }

      // Check attempts
      const attempts = await otpService.getOTPAttempts(email);
      if (attempts >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum OTP attempts reached. Please try again later.'
        });
      }

      // Generate and send new OTP
      const otp = await otpService.createOTP(email);
      await emailService.sendOTP(email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP resent successfully',
        data: {
          email,
          attempts: attempts + 1,
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP'
      });
    }
  }

  // Forgot password (placeholder - implement as needed)
  async forgotPassword(req, res) {
    // Implement password reset functionality
    res.status(501).json({
      success: false,
      message: 'Forgot password functionality not implemented yet'
    });
  }
}

module.exports = new AuthController();