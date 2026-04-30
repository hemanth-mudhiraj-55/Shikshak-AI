const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// FIXED: Return null instead of throwing error
const verifyToken = (token) => {
  try {
    if (!token) {
      return null;
    }
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return null; // Return null, don't throw error
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken
};