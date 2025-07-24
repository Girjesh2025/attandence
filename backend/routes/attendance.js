const express = require('express');
const router = express.Router();
const moment = require('moment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { authenticate, requireEmployee, requireAdmin } = require('../middleware/auth');

// Check if we're in demo mode (no MongoDB)
const isDemoMode = () => !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('memory');

// Demo mode helper functions for attendance
const findAttendanceInDemo = (query) => {
  if (!global.demoAttendance) global.demoAttendance = [];
  
  if (query.userId && query.date) {
    // Find by user and date range
    const startDate = moment(query.date.$gte).startOf('day');
    const endDate = moment(query.date.$lt).endOf('day');
    
    return global.demoAttendance.find(record => 
      record.userId === query.userId &&
      moment(record.date).isBetween(startDate, endDate, null, '[]')
    );
  }
  
  return null;
};

const addAttendanceToDemo = (attendanceData) => {
  if (!global.demoAttendance) global.demoAttendance = [];
  
  const newRecord = {
    _id: 'demo_attendance_' + Date.now(),
    ...attendanceData,
    date: moment(attendanceData.checkIn.time).startOf('day').toDate(),
    totalHours: 0,
    status: 'present',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  global.demoAttendance.push(newRecord);
  return newRecord;
};

const updateAttendanceInDemo = (recordId, updateData) => {
  if (!global.demoAttendance) global.demoAttendance = [];
  
  const index = global.demoAttendance.findIndex(record => record._id === recordId);
  if (index !== -1) {
    global.demoAttendance[index] = { ...global.demoAttendance[index], ...updateData };
    
    // Calculate total hours if check-out is added
    if (updateData.checkOut && global.demoAttendance[index].checkIn) {
      const checkInTime = moment(global.demoAttendance[index].checkIn.time);
      const checkOutTime = moment(updateData.checkOut.time);
      global.demoAttendance[index].totalHours = Math.round(checkOutTime.diff(checkInTime, 'minutes') / 60 * 100) / 100;
    }
    
    return global.demoAttendance[index];
  }
  return null;
};

const formatAttendanceData = (record) => {
  return {
    _id: record._id,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    date: moment(record.date).format('YYYY-MM-DD'),
    checkIn: record.checkIn && record.checkIn.time ? moment(record.checkIn.time).format('HH:mm:ss') : null,
    checkOut: record.checkOut && record.checkOut.time ? moment(record.checkOut.time).format('HH:mm:ss') : null,
    totalHours: record.totalHours || 0,
    status: record.status || 'present',
    remarks: record.remarks
  };
};

// @route   POST /api/attendance/checkin
// @desc    Mark check-in attendance
// @access  Private (Employee/Admin)
router.post('/checkin', authenticate, requireEmployee, async (req, res) => {
  try {
    const { location = 'Office', remarks } = req.body;
    const userId = req.user._id || req.user.userId;
    
    if (isDemoMode()) {
      console.log('🎯 Demo mode check-in for:', req.user.name);
      
      // Check if user already checked in today in demo mode
      const today = moment().startOf('day').toDate();
      const existingAttendance = findAttendanceInDemo({
        userId,
        date: {
          $gte: today,
          $lt: moment(today).add(1, 'day').toDate()
        }
      });

      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked in today.',
          data: {
            attendance: formatAttendanceData(existingAttendance)
          }
        });
      }

      // Create new attendance record in demo mode
      const attendanceData = {
        userId,
        employeeId: req.user.employeeId,
        employeeName: req.user.name,
        checkIn: {
          time: new Date(),
          location: location.trim(),
          ipAddress: 'demo_ip'
        },
        remarks: remarks ? remarks.trim() : undefined
      };

      const attendance = addAttendanceToDemo(attendanceData);

      // Emit real-time update to admin dashboard
      const io = req.app.get('socketio');
      if (io) {
        io.emit('attendance_update', {
          type: 'checkin',
          data: formatAttendanceData(attendance),
          employee: {
            name: req.user.name,
            employeeId: req.user.employeeId,
            department: req.user.department
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Check-in recorded successfully (Demo Mode).',
        data: {
          attendance: formatAttendanceData(attendance)
        }
      });
    }

    // MongoDB mode (original code)
    const today = moment().startOf('day').toDate();

    // Check if user already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: moment(today).add(1, 'day').toDate()
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today.',
        data: {
          attendance: existingAttendance.getFormattedData()
        }
      });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Create new attendance record
    const attendanceData = {
      userId,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      checkIn: {
        time: new Date(),
        location: location.trim(),
        ipAddress
      },
      remarks: remarks ? remarks.trim() : undefined
    };

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    // Emit real-time update to admin dashboard
    const io = req.app.get('socketio');
    if (io) {
      io.emit('attendance_update', {
        type: 'checkin',
        data: attendance.getFormattedData(),
        employee: {
          name: req.user.name,
          employeeId: req.user.employeeId,
          department: req.user.department
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully.',
      data: {
        attendance: attendance.getFormattedData()
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in.'
    });
  }
});

// @route   PUT /api/attendance/checkout
// @desc    Mark check-out attendance
// @access  Private (Employee/Admin)
router.put('/checkout', authenticate, requireEmployee, async (req, res) => {
  try {
    const { location = 'Office', remarks } = req.body;
    const userId = req.user._id || req.user.userId;
    
    if (isDemoMode()) {
      console.log('🎯 Demo mode check-out for:', req.user.name);
      
      // Find today's attendance record in demo mode
      const today = moment().startOf('day').toDate();
      const attendance = findAttendanceInDemo({
        userId,
        date: {
          $gte: today,
          $lt: moment(today).add(1, 'day').toDate()
        }
      });

      if (!attendance) {
        return res.status(400).json({
          success: false,
          message: 'No check-in record found for today. Please check-in first.'
        });
      }

      if (attendance.checkOut && attendance.checkOut.time) {
        return res.status(400).json({
          success: false,
          message: 'You have already checked out today.',
          data: {
            attendance: formatAttendanceData(attendance)
          }
        });
      }

      // Update attendance with check-out information
      const updatedAttendance = updateAttendanceInDemo(attendance._id, {
        checkOut: {
          time: new Date(),
          location: location.trim(),
          ipAddress: 'demo_ip'
        },
        remarks: remarks ? remarks.trim() : attendance.remarks,
        updatedAt: new Date()
      });

      // Emit real-time update to admin dashboard
      const io = req.app.get('socketio');
      if (io) {
        io.emit('attendance_update', {
          type: 'checkout',
          data: formatAttendanceData(updatedAttendance),
          employee: {
            name: req.user.name,
            employeeId: req.user.employeeId,
            department: req.user.department
          }
        });
      }

      return res.json({
        success: true,
        message: 'Check-out recorded successfully (Demo Mode).',
        data: {
          attendance: formatAttendanceData(updatedAttendance)
        }
      });
    }

    // MongoDB mode (original code)
    const today = moment().startOf('day').toDate();

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId,
      date: {
        $gte: today,
        $lt: moment(today).add(1, 'day').toDate()
      }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check-in first.'
      });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today.',
        data: {
          attendance: attendance.getFormattedData()
        }
      });
    }

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Update attendance with check-out information
    attendance.checkOut = {
      time: new Date(),
      location: location.trim(),
      ipAddress
    };

    if (remarks) {
      attendance.remarks = remarks.trim();
    }

    await attendance.save();

    // Emit real-time update to admin dashboard
    const io = req.app.get('socketio');
    if (io) {
      io.emit('attendance_update', {
        type: 'checkout',
        data: attendance.getFormattedData(),
        employee: {
          name: req.user.name,
          employeeId: req.user.employeeId,
          department: req.user.department
        }
      });
    }

    res.json({
      success: true,
      message: 'Check-out recorded successfully.',
      data: {
        attendance: attendance.getFormattedData()
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-out.'
    });
  }
});

// @route   GET /api/attendance/my-records
// @desc    Get current user's attendance records
// @access  Private (Employee/Admin)
router.get('/my-records', authenticate, requireEmployee, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user._id || req.user.userId;

    if (isDemoMode()) {
      console.log('🎯 Demo mode get my records for:', req.user.name);
      
      // Filter demo attendance records
      let filteredRecords = global.demoAttendance?.filter(record => record.userId === userId) || [];
      
      // Apply date filters
      if (startDate && endDate) {
        const start = moment(startDate).startOf('day');
        const end = moment(endDate).endOf('day');
        filteredRecords = filteredRecords.filter(record => 
          moment(record.date).isBetween(start, end, null, '[]')
        );
      }

      // Sort by date (newest first)
      filteredRecords.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRecords = filteredRecords.slice(skip, skip + parseInt(limit));

      // Calculate stats
      const stats = {
        totalDays: filteredRecords.length,
        presentDays: filteredRecords.filter(record => record.status === 'present').length,
        lateDays: filteredRecords.filter(record => record.status === 'late').length,
        halfDays: filteredRecords.filter(record => record.status === 'half-day').length,
        totalHours: filteredRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0)
      };

      return res.json({
        success: true,
        data: {
          attendance: paginatedRecords.map(record => formatAttendanceData(record)),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredRecords.length / parseInt(limit)),
            totalRecords: filteredRecords.length,
            hasNextPage: skip + parseInt(limit) < filteredRecords.length,
            hasPrevPage: parseInt(page) > 1
          },
          stats
        }
      });
    }

    // MongoDB mode (original code continues...)
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: moment(startDate).startOf('day').toDate(),
          $lte: moment(endDate).endOf('day').toDate()
        }
      };
    } else {
      // Default to current month
      dateFilter = {
        date: {
          $gte: moment().startOf('month').toDate(),
          $lte: moment().endOf('month').toDate()
        }
      };
    }

    const query = { userId, ...dateFilter };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRecords = await Attendance.countDocuments(query);

    // Calculate attendance statistics
    const stats = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(record => record.status === 'present').length,
      lateDays: attendanceRecords.filter(record => record.status === 'late').length,
      halfDays: attendanceRecords.filter(record => record.status === 'half-day').length,
      totalHours: attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0)
    };

    res.json({
      success: true,
      data: {
        attendance: attendanceRecords.map(record => record.getFormattedData()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRecords / parseInt(limit)),
          totalRecords,
          hasNextPage: skip + parseInt(limit) < totalRecords,
          hasPrevPage: parseInt(page) > 1
        },
        stats
      }
    });
  } catch (error) {
    console.error('Get my records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records.'
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status for current user
// @access  Private (Employee/Admin)
router.get('/today', authenticate, requireEmployee, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    
    if (isDemoMode()) {
      console.log('🎯 Demo mode get today status for:', req.user.name);
      
      const attendance = findAttendanceInDemo({
        userId,
        date: {
          $gte: moment().startOf('day').toDate(),
          $lt: moment().add(1, 'day').startOf('day').toDate()
        }
      });

      if (!attendance) {
        return res.json({
          success: true,
          data: {
            hasCheckedIn: false,
            hasCheckedOut: false,
            attendance: null
          }
        });
      }

      return res.json({
        success: true,
        data: {
          hasCheckedIn: true,
          hasCheckedOut: !!(attendance.checkOut && attendance.checkOut.time),
          attendance: formatAttendanceData(attendance)
        }
      });
    }

    // MongoDB mode (original code)
    const attendance = await Attendance.getTodaysAttendance(userId);

    if (attendance.length === 0) {
      return res.json({
        success: true,
        data: {
          hasCheckedIn: false,
          hasCheckedOut: false,
          attendance: null
        }
      });
    }

    const todayAttendance = attendance[0];

    res.json({
      success: true,
      data: {
        hasCheckedIn: true,
        hasCheckedOut: !!(todayAttendance.checkOut && todayAttendance.checkOut.time),
        attendance: todayAttendance.getFormattedData()
      }
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching today\'s attendance.'
    });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all attendance records (Admin only)
// @access  Private (Admin)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      employeeId, 
      status, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    if (isDemoMode()) {
      console.log('🎯 Demo mode get all attendance');
      
      // Return demo attendance records
      let filteredRecords = global.demoAttendance || [];
      
      // Apply filters
      if (employeeId) {
        filteredRecords = filteredRecords.filter(record => record.employeeId === employeeId);
      }
      
      if (status) {
        filteredRecords = filteredRecords.filter(record => record.status === status);
      }
      
      if (search) {
        filteredRecords = filteredRecords.filter(record => 
          record.employeeName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (startDate && endDate) {
        const start = moment(startDate).startOf('day');
        const end = moment(endDate).endOf('day');
        filteredRecords = filteredRecords.filter(record => 
          moment(record.date).isBetween(start, end, null, '[]')
        );
      }

      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRecords = filteredRecords.slice(skip, skip + parseInt(limit));

      return res.json({
        success: true,
        data: {
          attendance: paginatedRecords.map(record => ({
            ...formatAttendanceData(record),
            user: {
              name: record.employeeName,
              email: 'demo@example.com',
              department: 'Demo Department'
            }
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(filteredRecords.length / parseInt(limit)),
            totalRecords: filteredRecords.length,
            hasNextPage: skip + parseInt(limit) < filteredRecords.length,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });
    }

    // MongoDB mode (original code continues...)
    // Build query
    let query = {};

    // Date filter
    if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    } else {
      // Default to current month
      query.date = {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate()
      };
    }

    // Employee filter
    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search filter (by employee name)
    if (search) {
      query.employeeName = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get attendance records with user details
    const attendanceRecords = await Attendance.find(query)
      .populate('userId', 'name email department')
      .sort({ date: -1, 'checkIn.time': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalRecords = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: {
        attendance: attendanceRecords.map(record => ({
          ...record.getFormattedData(),
          user: record.userId
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRecords / parseInt(limit)),
          totalRecords,
          hasNextPage: skip + parseInt(limit) < totalRecords,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records.'
    });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics for admin dashboard
// @access  Private (Admin)
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    if (isDemoMode()) {
      console.log('🎯 Demo mode get stats');
      
      // Generate demo stats
      const demoStats = {
        overview: {
          totalRecords: global.demoAttendance?.length || 0,
          totalEmployees: global.demoUsers?.filter(u => u.role === 'employee').length || 0,
          activeEmployees: 1, // Current user
          attendanceRate: 85.5,
          totalHours: global.demoAttendance?.reduce((sum, record) => sum + (record.totalHours || 8), 0) || 8,
          averageHours: 8.2
        },
        statusBreakdown: {
          present: global.demoAttendance?.filter(r => r.status === 'present').length || 0,
          late: global.demoAttendance?.filter(r => r.status === 'late').length || 0,
          halfDay: global.demoAttendance?.filter(r => r.status === 'half-day').length || 0,
          absent: 0
        },
        chartData: [], // Empty for demo
        topPerformers: [],
        period
      };

      return res.json({
        success: true,
        data: demoStats
      });
    }

    // MongoDB mode (original code continues...)
    let startDate, endDate;
    
    // Determine date range based on period
    switch (period) {
      case 'today':
        startDate = moment().startOf('day').toDate();
        endDate = moment().endOf('day').toDate();
        break;
      case 'week':
        startDate = moment().startOf('week').toDate();
        endDate = moment().endOf('week').toDate();
        break;
      case 'month':
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
        break;
      case 'year':
        startDate = moment().startOf('year').toDate();
        endDate = moment().endOf('year').toDate();
        break;
      default:
        startDate = moment().startOf('month').toDate();
        endDate = moment().endOf('month').toDate();
    }

    // Get attendance data for the period
    const attendanceData = await Attendance.findByDateRange(startDate, endDate);
    
    // Calculate overall stats
    const totalRecords = attendanceData.length;
    const presentCount = attendanceData.filter(record => record.status === 'present').length;
    const lateCount = attendanceData.filter(record => record.status === 'late').length;
    const halfDayCount = attendanceData.filter(record => record.status === 'half-day').length;
    const totalHours = attendanceData.reduce((sum, record) => sum + (record.totalHours || 0), 0);

    // Get unique employees count
    const uniqueEmployees = new Set(attendanceData.map(record => record.employeeId)).size;
    
    // Get total active employees
    const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });

    // Daily attendance chart data
    const dailyStats = {};
    attendanceData.forEach(record => {
      const date = moment(record.date).format('YYYY-MM-DD');
      if (!dailyStats[date]) {
        dailyStats[date] = { date, present: 0, late: 0, halfDay: 0, absent: 0 };
      }
      dailyStats[date][record.status === 'half-day' ? 'halfDay' : record.status]++;
    });

    const chartData = Object.values(dailyStats).sort((a, b) => 
      moment(a.date).valueOf() - moment(b.date).valueOf()
    );

    // Employee performance data
    const employeeStats = {};
    attendanceData.forEach(record => {
      const empId = record.employeeId;
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          employeeName: record.employeeName,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          halfDays: 0,
          totalHours: 0
        };
      }
      employeeStats[empId].totalDays++;
      employeeStats[empId].totalHours += record.totalHours || 0;
      
      switch (record.status) {
        case 'present':
          employeeStats[empId].presentDays++;
          break;
        case 'late':
          employeeStats[empId].lateDays++;
          break;
        case 'half-day':
          employeeStats[empId].halfDays++;
          break;
      }
    });

    const topPerformers = Object.values(employeeStats)
      .sort((a, b) => (b.presentDays / b.totalDays) - (a.presentDays / a.totalDays))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        overview: {
          totalRecords,
          totalEmployees,
          activeEmployees: uniqueEmployees,
          attendanceRate: totalEmployees > 0 ? ((uniqueEmployees / totalEmployees) * 100).toFixed(1) : 0,
          totalHours: totalHours.toFixed(1),
          averageHours: totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : 0
        },
        statusBreakdown: {
          present: presentCount,
          late: lateCount,
          halfDay: halfDayCount,
          absent: totalEmployees - uniqueEmployees
        },
        chartData,
        topPerformers,
        period
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance statistics.'
    });
  }
});

module.exports = router; 