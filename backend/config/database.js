const mongoose = require('mongoose');

// In-memory storage for demo (when MongoDB is not available)
global.demoUsers = [];
global.demoAttendance = [];

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('⚠️  MongoDB not available, using demo mode');
    console.log('📝 Note: Data will not persist in demo mode');
    
    // Initialize demo data
    global.demoUsers = [
      {
        _id: 'demo_admin_001',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        role: 'admin',
        employeeId: 'EMP001',
        department: 'Management',
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    global.demoAttendance = [];
    
    return false; // MongoDB not connected, but app can still run
  }
};

module.exports = connectDB; 