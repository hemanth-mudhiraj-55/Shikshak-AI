const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');
const { RateLimiterMemory } = require('rate-limiter-flexible');

dotenv.config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminBookRoutes = require('./routes/adminBookRoutes');
const todoRoutes = require('./routes/todoRoutes');
const eventRoutes = require('./routes/eventRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const messageRoutes = require('./routes/messageRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const homeworkPackRoutes = require('./routes/homeworkPackRoutes');
const adminHomeworkPackRoutes = require('./routes/adminHomeworkPackRoutes');
const examRoutes = require('./routes/examRoutes');
const adminExamRoutes = require('./routes/adminExamRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const feeRoutes = require('./routes/feeRoutes');
const adminFeeRoutes = require('./routes/adminFeeRoutes');
const botRoutes = require('./routes/botRoutes');
const chatRequestRoutes = require('./routes/chatRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS - read from env
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }
};

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', rateLimitMiddleware, authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin/books', adminBookRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/homework', homeworkPackRoutes);
app.use('/api/admin/homework', adminHomeworkPackRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin/exams', adminExamRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/admin/fees', adminFeeRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/chat-requests', chatRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
