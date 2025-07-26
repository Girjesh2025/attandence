const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes - using relative paths for serverless
const authRoutes = require('../backend/routes/auth');
const attendanceRoutes = require('../backend/routes/attendance');

// Initialize Express app
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.VERCEL_URL ? [
    `https://${process.env.VERCEL_URL}`,
    'https://your-app-name.vercel.app'
  ] : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for getting correct IP addresses
app.set('trust proxy', true);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AttendEase API is running on Vercel!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo route for testing
app.get('/api/demo', (req, res) => {
  res.json({
    success: true,
    message: 'AttendEase API is working on Vercel!',
    features: [
      '✅ Server Running',
      '✅ CORS Configured', 
      '✅ Serverless Ready',
      '✅ MongoDB Connected'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the Express API for Vercel
module.exports = app; 