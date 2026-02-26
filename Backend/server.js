const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer'); // Add this for error handling

dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminBookRoutes = require('./routes/adminBookRoutes');
const todoRoutes = require('./routes/todoRoutes');
const app = express();
const eventRoutes = require('./routes/eventRoutes');


// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - FIX: Mount routes correctly
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin/books', adminBookRoutes); // Make sure this matches the route in adminBookRoutes
app.use('/api/todos', todoRoutes);//Todolist
app.use('/api/events', eventRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

