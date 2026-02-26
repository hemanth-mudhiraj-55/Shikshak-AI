const { verifyToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ FIXED AUTH MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Incoming Token:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);
    console.log("Decoded Token:", decoded);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // ✅ Fetch full user from DB
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Alternative protect middleware (now fixed also)
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({ message: 'Not authorized, no token' });

  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'teacher')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Book access middleware
const checkBookAccess = async (req, res, next) => {
  try {
    const UserBook = require('../models/UserBook');
    const currentMonth = new Date().toISOString().slice(0, 7);

    const booksThisMonth = await UserBook.countDocuments({
      user: req.user._id,
      month: currentMonth
    });

    if (booksThisMonth >= req.user.monthlyBookLimit) {
      return res.status(403).json({
        message: 'Monthly book limit reached',
        limit: req.user.monthlyBookLimit,
        current: booksThisMonth
      });
    }

    next();

  } catch (error) {
    console.error('Check book access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  protect,
  admin,
  checkBookAccess
};