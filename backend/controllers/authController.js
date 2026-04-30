const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');
const { readDb, withDb, makeRecord, normalizeEmail, touchRecord } = require('../lib/localStore');

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  profilePicture: user.profilePicture || null,
  phone: user.phone || '',
  bio: user.bio || '',
  preferences: user.preferences || {
    theme: 'system',
    notifications: { email: true, push: true },
    privacy: { readReceipts: true, onlineStatus: true },
    accessibility: { reduceMotion: false, highContrast: false }
  },
  lastLogin: user.lastLogin || null,
  monthlyBookLimit: user.monthlyBookLimit ?? 10,
  booksReadThisMonth: user.booksReadThisMonth ?? 0,
  totalPagesRead: user.totalPagesRead ?? 0,
  readingStreak: user.readingStreak ?? 0,
  lastReadDate: user.lastReadDate || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const createStoredUser = async ({ username, email, password, role = 'user' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return makeRecord({
    username,
    email: normalizeEmail(email),
    password: hashedPassword,
    role,
    isVerified: true,
    accountStatus: 'active',
    profilePicture: null,
    phone: '',
    bio: '',
    preferences: {
      theme: 'system',
      notifications: { email: true, push: true },
      privacy: { readReceipts: true, onlineStatus: true },
      accessibility: { reduceMotion: false, highContrast: false }
    },
    lastLogin: null,
    monthlyBookLimit: 10,
    booksReadThisMonth: 0,
    totalPagesRead: 0,
    readingStreak: 0,
    lastReadDate: null,
    resetToken: null,
    resetTokenExpiry: null
  });
};

class AuthController {
  async sendOTP(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      const db = await readDb();
      const existingUser = db.users.find(user => user.email === email);

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const canRequest = await otpService.canRequestOTP(email);
      if (!canRequest) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP'
        });
      }

      const otp = await otpService.createOTP(email);
      await emailService.sendOTP(email, otp);
      const attempts = await otpService.getOTPAttempts(email);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          email,
          attempts,
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  }

  async verifyOTPAndRegister(req, res) {
    try {
      const { username, password, otp } = req.body;
      const email = normalizeEmail(req.body.email);
      const otpVerification = await otpService.verifyOTP(email, otp);

      if (!otpVerification.isValid) {
        return res.status(400).json({ success: false, message: otpVerification.message });
      }

      let user;
      await withDb(async (db) => {
        const existingUser = db.users.find(candidate =>
          candidate.email === email || candidate.username === username
        );

        if (existingUser) {
          throw new Error(existingUser.email === email ? 'User already exists with this email' : 'Username already taken');
        }

        user = await createStoredUser({ username, email, password });
        db.users.push(user);
      });

      const token = generateToken(user._id, user.role);
      emailService.sendWelcomeEmail(email, username);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: sanitizeUser(user),
          token
        }
      });
    } catch (error) {
      if (error.message === 'User already exists with this email' || error.message === 'Username already taken') {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const rawIdentifier = String(req.body.email || req.body.username || '').trim();
      const isEmail = rawIdentifier.includes('@');
      const email = isEmail ? normalizeEmail(rawIdentifier) : '';
      const username = !isEmail ? rawIdentifier : '';
      const { password } = req.body;

      if (!rawIdentifier || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
      }

      let user;
      await withDb(async (db) => {
        user = isEmail
          ? db.users.find(candidate => candidate.email === email)
          : db.users.find(candidate => candidate.username === username);
        if (!user) return;
        user.lastLogin = new Date().toISOString();
        user.updatedAt = new Date().toISOString();
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email first' });
      }

      if (user.accountStatus !== 'active') {
        return res.status(403).json({ success: false, message: `Account is ${user.accountStatus}` });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitizeUser(user),
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
  }

  async logout(req, res) {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  async getCurrentUser(req, res) {
    try {
      const db = await readDb();
      const user = db.users.find(candidate => candidate._id === req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, message: 'Failed to get user data' });
    }
  }

  async resendOTP(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      const canRequest = await otpService.canRequestOTP(email);
      if (!canRequest) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 60 seconds before requesting another OTP'
        });
      }

      const attempts = await otpService.getOTPAttempts(email);
      if (attempts >= 3) {
        return res.status(400).json({
          success: false,
          message: 'Maximum OTP attempts reached. Please try again later.'
        });
      }

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
      res.status(500).json({ success: false, message: 'Failed to resend OTP' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const email = req.body.email ? normalizeEmail(req.body.email) : null;
      const username = req.body.username ? String(req.body.username).trim() : null;
      const db = await readDb();

      const user = db.users.find(candidate =>
        (email && candidate.email === email) || (username && candidate.username === username)
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with that email or username'
        });
      }

      const canRequest = await otpService.canRequestOTP(user.email);
      if (!canRequest) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before requesting another OTP'
        });
      }

      const otp = await otpService.createOTP(user.email);
      await emailService.sendOTP(user.email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { email: user.email, expiresIn: 300 }
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Failed to send reset OTP' });
    }
  }

  async verifyResetOTP(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      const { otp } = req.body;
      const otpVerification = await otpService.verifyOTP(email, otp);
      if (!otpVerification.isValid) {
        return res.status(400).json({ success: false, message: otpVerification.message });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      await withDb(async (db) => {
        const user = db.users.find(candidate => candidate.email === email);
        if (!user) {
          throw new Error('User not found');
        }
        Object.assign(user, touchRecord(user, {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        }));
      });

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: { resetToken }
      });
    } catch (error) {
      console.error('Verify reset OTP error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
  }

  async resetPassword(req, res) {
    try {
      const email = normalizeEmail(req.body.email);
      const { newPassword, resetToken } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }

      if (!resetToken) {
        return res.status(400).json({ success: false, message: 'Reset token is required' });
      }

      let updated = false;
      await withDb(async (db) => {
        const user = db.users.find(candidate =>
          candidate.email === email &&
          candidate.resetToken === resetToken &&
          candidate.resetTokenExpiry &&
          new Date(candidate.resetTokenExpiry) > new Date()
        );

        if (!user) {
          return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        Object.assign(user, touchRecord(user, {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }));
        updated = true;
      });

      if (!updated) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  }

  async updateProfile(req, res) {
    try {
      const username = req.body.username ? String(req.body.username).trim() : '';
      const email = req.body.email ? normalizeEmail(req.body.email) : '';
      const phone = req.body.phone !== undefined ? String(req.body.phone).trim() : undefined;
      const bio = req.body.bio !== undefined ? String(req.body.bio).trim() : undefined;
      let user;

      await withDb(async (db) => {
        user = db.users.find(candidate => candidate._id === req.user._id);
        if (!user) {
          throw new Error('User not found');
        }

        if (username) {
          const existing = db.users.find(candidate => candidate.username === username && candidate._id !== user._id);
          if (existing) {
            throw new Error('Username already taken');
          }
          user.username = username;
        }

        if (email && email !== user.email) {
          const existing = db.users.find(candidate => candidate.email === email && candidate._id !== user._id);
          if (existing) {
            throw new Error('Email already in use');
          }
          user.email = email;
        }

        if (phone !== undefined) {
          // Very lightweight validation; keep it permissive for international formats.
          if (phone.length > 20) {
            throw new Error('Phone number is too long');
          }
          user.phone = phone;
        }

        if (bio !== undefined) {
          if (bio.length > 500) {
            throw new Error('Bio is too long');
          }
          user.bio = bio;
        }

        Object.assign(user, touchRecord(user));
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: sanitizeUser(user) }
      });
    } catch (error) {
      if (['User not found', 'Username already taken', 'Email already in use', 'Phone number is too long', 'Bio is too long'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }

  async updatePreferences(req, res) {
    try {
      const prefs = req.body?.preferences || req.body || {};
      const theme = prefs.theme ? String(prefs.theme) : undefined;
      const notifications = prefs.notifications || {};
      const privacy = prefs.privacy || {};
      const accessibility = prefs.accessibility || {};

      const allowedThemes = new Set(['light', 'dark', 'system']);
      if (theme !== undefined && !allowedThemes.has(theme)) {
        return res.status(400).json({ success: false, message: 'Invalid theme value' });
      }

      let user;
      await withDb(async (db) => {
        user = db.users.find(candidate => candidate._id === req.user._id);
        if (!user) throw new Error('User not found');

        const existing = user.preferences || {};
        user.preferences = {
          theme: theme ?? existing.theme ?? 'system',
          notifications: {
            email: typeof notifications.email === 'boolean' ? notifications.email : (existing.notifications?.email ?? true),
            push: typeof notifications.push === 'boolean' ? notifications.push : (existing.notifications?.push ?? true)
          },
          privacy: {
            readReceipts: typeof privacy.readReceipts === 'boolean' ? privacy.readReceipts : (existing.privacy?.readReceipts ?? true),
            onlineStatus: typeof privacy.onlineStatus === 'boolean' ? privacy.onlineStatus : (existing.privacy?.onlineStatus ?? true)
          },
          accessibility: {
            reduceMotion: typeof accessibility.reduceMotion === 'boolean' ? accessibility.reduceMotion : (existing.accessibility?.reduceMotion ?? false),
            highContrast: typeof accessibility.highContrast === 'boolean' ? accessibility.highContrast : (existing.accessibility?.highContrast ?? false)
          }
        };

        Object.assign(user, touchRecord(user));
      });

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { user: sanitizeUser(user) }
      });
    } catch (error) {
      if (['User not found'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Update preferences error:', error);
      res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
  }

  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Avatar file is required' });
      }

      const { deleteFile } = require('../middleware/uploadMiddleware');

      const storedPath = pathToUploadUrl(req.file);
      let user;

      await withDb(async (db) => {
        user = db.users.find(candidate => candidate._id === req.user._id);
        if (!user) throw new Error('User not found');

        // If we previously stored a local uploads path, remove it.
        if (user.profilePicture && isLocalUploadPath(user.profilePicture)) {
          deleteFile(user.profilePicture);
        }

        user.profilePicture = storedPath;
        Object.assign(user, touchRecord(user));
      });

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: { user: sanitizeUser(user) }
      });
    } catch (error) {
      if (['User not found'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Upload profile picture error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      let changed = false;
      await withDb(async (db) => {
        const user = db.users.find(candidate => candidate._id === req.user._id);
        if (!user) {
          throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          throw new Error('Current password is incorrect');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        Object.assign(user, touchRecord(user));
        changed = true;
      });

      if (!changed) {
        return res.status(400).json({ success: false, message: 'Failed to change password' });
      }

      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      if (['User not found', 'Current password is incorrect'].includes(error.message)) {
        return res.status(400).json({ success: false, message: error.message });
      }
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  }
}

module.exports = new AuthController();

function isLocalUploadPath(value) {
  const v = String(value || '');
  return v.startsWith('uploads/') || v.startsWith('uploads\\');
}

function pathToUploadUrl(file) {
  // We store a relative path like "uploads/avatars/xxx.png" so:
  // - it can be deleted safely from disk
  // - frontend can turn it into a full URL with the backend base
  const rel = path
    .join('uploads', path.basename(path.dirname(file.path)), path.basename(file.path))
    .replace(/\\/g, '/');
  return rel;
}
