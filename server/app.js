const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const hotelRoutes = require('./routes/hotelRoutes');

const app = express();

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Hotel API is running',
  });
});

// API Routes
app.use('/api/hotels', hotelRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  // Handle Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File size too large. Maximum limit is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle custom status errors
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Default 500 server error
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

module.exports = app;
