const mongoose = require('mongoose');
const moment = require('moment');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      default: 'Office'
    },
    ipAddress: String
  },
  checkOut: {
    time: Date,
    location: {
      type: String,
      default: 'Office'
    },
    ipAddress: String
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'half-day', 'late', 'absent'],
    default: 'present'
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ employeeId: 1, date: -1 });
attendanceSchema.index({ date: -1 });

// Pre-save middleware to update timestamps
attendanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set date to start of day for consistent date comparison
  if (this.isNew) {
    this.date = moment(this.checkIn.time).startOf('day').toDate();
  }
  
  next();
});

// Calculate total hours when check-out is recorded
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkOut.time && this.checkIn && this.checkIn.time) {
    const checkInTime = moment(this.checkIn.time);
    const checkOutTime = moment(this.checkOut.time);
    
    // Calculate total hours (difference in hours with 2 decimal places)
    this.totalHours = Math.round(checkOutTime.diff(checkInTime, 'minutes') / 60 * 100) / 100;
    
    // Determine status based on total hours
    if (this.totalHours < 4) {
      this.status = 'half-day';
    } else if (checkInTime.hour() > 9 || (checkInTime.hour() === 9 && checkInTime.minute() > 30)) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
  
  next();
});

// Static method to find attendance by date range
attendanceSchema.statics.findByDateRange = function(startDate, endDate, userId = null) {
  const query = {
    date: {
      $gte: moment(startDate).startOf('day').toDate(),
      $lte: moment(endDate).endOf('day').toDate()
    }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).populate('userId', 'name email employeeId department').sort({ date: -1 });
};

// Static method to get today's attendance
attendanceSchema.statics.getTodaysAttendance = function(userId = null) {
  const today = moment().startOf('day').toDate();
  const tomorrow = moment().add(1, 'day').startOf('day').toDate();
  
  const query = {
    date: {
      $gte: today,
      $lt: tomorrow
    }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query).populate('userId', 'name email employeeId department').sort({ 'checkIn.time': -1 });
};

// Instance method to format attendance data
attendanceSchema.methods.getFormattedData = function() {
  return {
    _id: this._id,
    employeeId: this.employeeId,
    employeeName: this.employeeName,
    date: moment(this.date).format('YYYY-MM-DD'),
    checkIn: this.checkIn.time ? moment(this.checkIn.time).format('HH:mm:ss') : null,
    checkOut: this.checkOut && this.checkOut.time ? moment(this.checkOut.time).format('HH:mm:ss') : null,
    totalHours: this.totalHours,
    status: this.status,
    remarks: this.remarks
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema); 