const { verifyToken } = require('../utils/generateToken');
const { readDb, monthKey } = require('../lib/localStore');

// Auth middleware - verifies JWT token and attaches user to request
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Fetch full user from DB
    const db = await readDb();
    const user = db.users.find(candidate => candidate._id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
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

// Book access middleware
const checkBookAccess = async (req, res, next) => {
  try {
    const db = await readDb();
    const currentMonth = monthKey();
    const booksThisMonth = db.userBooks.filter(record =>
      record.user === req.user._id && record.month === currentMonth
    ).length;

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

module.exports = { authMiddleware, requireRole, checkBookAccess };
