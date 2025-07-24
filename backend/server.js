const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Connect to MongoDB (gracefully handle connection failures)
connectDB().catch(err => {
  console.log('⚠️  MongoDB connection failed, running in demo mode');
  console.log('📝 Note: Some features may not work without database');
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for getting correct IP addresses
app.set('trust proxy', true);

// Make Socket.IO available to routes
app.set('socketio', io);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Demo route for testing without database
app.get('/api/demo', (req, res) => {
  res.json({
    success: true,
    message: 'AttendEase API is working!',
    features: [
      '✅ Server Running',
      '✅ CORS Configured', 
      '✅ Socket.io Ready',
      '⚠️ Database Connection Needed'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join admin room for real-time updates
  socket.on('join_admin', (data) => {
    console.log(`Admin joined: ${socket.id}`, data);
    socket.join('admin_room');
    
    // Send confirmation
    socket.emit('admin_joined', {
      success: true,
      message: 'Successfully joined admin room',
      socketId: socket.id
    });
  });

  // Leave admin room
  socket.on('leave_admin', () => {
    console.log(`Admin left: ${socket.id}`);
    socket.leave('admin_room');
  });

  // Handle employee connection
  socket.on('join_employee', (data) => {
    console.log(`Employee joined: ${socket.id}`, data);
    socket.join(`employee_${data.userId}`);
    
    // Send confirmation
    socket.emit('employee_joined', {
      success: true,
      message: 'Successfully connected',
      socketId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error(`Socket connection error: ${socket.id}`, error);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🔗 API Demo: http://localhost:${PORT}/api/demo`);
});

module.exports = { app, server, io }; 