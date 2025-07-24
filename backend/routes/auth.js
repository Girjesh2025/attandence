const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// Check if we're in demo mode (no MongoDB)
const isDemoMode = () => !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('memory');

// Demo mode helper functions
const findUserInDemo = (email) => {
  return global.demoUsers?.find(user => user.email.toLowerCase() === email.toLowerCase());
};

const addUserToDemo = (userData) => {
  const newUser = {
    _id: 'demo_user_' + Date.now(),
    ...userData,
    employeeId: userData.role === 'employee' ? `EMP${Date.now().toString().slice(-6)}` : undefined,
    isActive: true,
    createdAt: new Date()
  };
  global.demoUsers = global.demoUsers || [];
  global.demoUsers.push(newUser);
  return newUser;
};

// @route   POST /api/auth/register
// @desc    Register new user (employee or admin)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'employee', department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (isDemoMode()) {
      // Demo mode registration
      console.log('🎯 Demo mode registration for:', email);
      
      // Check if user exists in demo
      const existingUser = findUserInDemo(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists.'
        });
      }

      // Create demo user
      const userData = {
        name: name.trim(),
        email: email.toLowerCase(),
        password: 'hashed_' + password, // Simple demo hash
        role,
        department: department ? department.trim() : undefined
      };

      const user = addUserToDemo(userData);
      const token = generateToken(user._id);

      // Return user data without password
      const { password: _, ...userProfile } = user;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Demo Mode).',
        data: {
          user: userProfile,
          token
        }
      });
    }

    // MongoDB mode (original code)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      department: department ? department.trim() : undefined
    };

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);
    const userProfile = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: userProfile,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists.`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    if (isDemoMode()) {
      // Demo mode login
      console.log('🎯 Demo mode login for:', email);
      
      const user = findUserInDemo(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Simple demo password check
      if (!user.password.includes(password)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user._id);
      const { password: _, ...userProfile } = user;

      return res.json({
        success: true,
        message: 'Login successful (Demo Mode).',
        data: {
          user: userProfile,
          token
        }
      });
    }

    // MongoDB mode (original code)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated. Please contact administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);
    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userProfile,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    if (isDemoMode()) {
      // Demo mode - find user in memory
      const user = global.demoUsers?.find(u => u._id === req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const { password: _, ...userProfile } = user;
      return res.json({
        success: true,
        data: {
          user: userProfile
        }
      });
    }

    // MongoDB mode
    const userProfile = req.user.getPublicProfile();
    
    res.json({
      success: true,
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile.'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, department } = req.body;

    if (!name && !department) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.'
      });
    }

    if (isDemoMode()) {
      // Demo mode update
      const userIndex = global.demoUsers?.findIndex(u => u._id === req.user.userId);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      if (name) global.demoUsers[userIndex].name = name.trim();
      if (department) global.demoUsers[userIndex].department = department.trim();

      const { password: _, ...userProfile } = global.demoUsers[userIndex];
      
      return res.json({
        success: true,
        message: 'Profile updated successfully (Demo Mode).',
        data: {
          user: userProfile
        }
      });
    }

    // MongoDB mode
    const userId = req.user._id;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (department) updateData.department = department.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userProfile = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: userProfile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.'
    });
  }
});

module.exports = router; 