import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  MessageCircle, 
  CheckCircle, 
  LogIn, 
  LogOut,
  AlertCircle,
  Timer
} from 'lucide-react';
import moment from 'moment';

const Attendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: 'Office',
    remarks: ''
  });
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    loadTodayStatus();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadTodayStatus = async () => {
    try {
      setLoading(true);
      
      // Check if user token is demo token
      const token = localStorage.getItem('token');
      const isDemo = token && token.startsWith('demo_token_');
      
      if (isDemo) {
        // Demo mode - use mock data
        const mockStatus = {
          isCheckedIn: true,
          checkInTime: '2025-07-26T09:15:00Z',
          checkOutTime: null,
          status: 'present',
          location: 'Office',
          remarks: 'Starting work for the day',
          date: '2025-07-26'
        };
        setTodayStatus(mockStatus);
      } else {
        // Real mode - make API call
        const response = await attendanceAPI.getTodayStatus();
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      
      // Check if user token is demo token
      const token = localStorage.getItem('token');
      const isDemo = token && token.startsWith('demo_token_');
      
      if (isDemo) {
        // Demo mode - simulate successful check-in
        toast.success('Check-in recorded successfully! (Demo Mode)');
        const updatedStatus = {
          ...todayStatus,
          isCheckedIn: true,
          checkInTime: new Date().toISOString(),
          status: 'present',
          location: formData.location,
          remarks: formData.remarks
        };
        setTodayStatus(updatedStatus);
        setFormData({ location: 'Office', remarks: '' });
      } else {
        // Real mode - make API call
        const response = await attendanceAPI.checkIn(formData);
        
        if (response.success) {
          toast.success('Check-in recorded successfully!');
          setFormData({ location: 'Office', remarks: '' });
          await loadTodayStatus();
        }
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to record check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      
      // Check if user token is demo token
      const token = localStorage.getItem('token');
      const isDemo = token && token.startsWith('demo_token_');
      
      if (isDemo) {
        // Demo mode - simulate successful check-out
        toast.success('Check-out recorded successfully! (Demo Mode)');
        const updatedStatus = {
          ...todayStatus,
          isCheckedIn: false,
          checkOutTime: new Date().toISOString(),
          location: formData.location,
          remarks: formData.remarks
        };
        setTodayStatus(updatedStatus);
        setFormData({ location: 'Office', remarks: '' });
      } else {
        // Real mode - make API call
        const response = await attendanceAPI.checkOut(formData);
        
        if (response.success) {
          toast.success('Check-out recorded successfully!');
          setFormData({ location: 'Office', remarks: '' });
          await loadTodayStatus();
        }
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to record check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateWorkingTime = () => {
    if (!todayStatus?.attendance?.checkIn) return '0h 0m';
    
    const checkInTime = moment(todayStatus.attendance.checkIn, 'HH:mm:ss');
    const currentMoment = moment();
    const duration = moment.duration(currentMoment.diff(checkInTime));
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${hours}h ${minutes}m`;
  };

  const getWorkingTimeColor = () => {
    if (!todayStatus?.attendance?.checkIn) return 'text-gray-500';
    
    const checkInTime = moment(todayStatus.attendance.checkIn, 'HH:mm:ss');
    const currentMoment = moment();
    const hoursWorked = currentMoment.diff(checkInTime, 'hours', true);
    
    if (hoursWorked >= 8) return 'text-success-600';
    if (hoursWorked >= 4) return 'text-warning-600';
    return 'text-primary-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
        <p className="text-gray-600">
          {currentTime.format('dddd, MMMM Do YYYY')}
        </p>
        <p className="text-2xl font-mono text-primary-600 mt-2">
          {currentTime.format('h:mm:ss A')}
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check-in Status */}
          <div className="text-center">
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-3 ${
              todayStatus?.hasCheckedIn ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              <LogIn className={`h-8 w-8 ${
                todayStatus?.hasCheckedIn ? 'text-success-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Check-in</h3>
            <p className="text-sm text-gray-600">
              {todayStatus?.attendance?.checkIn 
                ? moment(todayStatus.attendance.checkIn, 'HH:mm:ss').format('h:mm A')
                : 'Not checked in'
              }
            </p>
          </div>

          {/* Working Time */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <Timer className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Working Time</h3>
            <p className={`text-sm font-mono ${getWorkingTimeColor()}`}>
              {todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut 
                ? calculateWorkingTime() 
                : todayStatus?.attendance?.totalHours 
                  ? `${todayStatus.attendance.totalHours}h` 
                  : '0h 0m'
              }
            </p>
          </div>

          {/* Check-out Status */}
          <div className="text-center">
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-3 ${
              todayStatus?.hasCheckedOut ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              <LogOut className={`h-8 w-8 ${
                todayStatus?.hasCheckedOut ? 'text-success-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Check-out</h3>
            <p className="text-sm text-gray-600">
              {todayStatus?.attendance?.checkOut 
                ? moment(todayStatus.attendance.checkOut, 'HH:mm:ss').format('h:mm A')
                : 'Not checked out'
              }
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {todayStatus?.attendance?.status && (
          <div className="mt-6 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
              todayStatus.attendance.status === 'present' ? 'bg-success-100 text-success-800' :
              todayStatus.attendance.status === 'late' ? 'bg-warning-100 text-warning-800' :
              todayStatus.attendance.status === 'half-day' ? 'bg-warning-100 text-warning-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {todayStatus.attendance.status}
            </span>
          </div>
        )}
      </div>

      {/* Action Form */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {!todayStatus?.hasCheckedIn ? 'Check In' : 
           !todayStatus?.hasCheckedOut ? 'Check Out' : 'Attendance Complete'}
        </h2>

        {!todayStatus?.hasCheckedOut ? (
          <div className="space-y-4">
            {/* Location Input */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Office">Office</option>
                  <option value="Home">Work from Home</option>
                  <option value="Client Site">Client Site</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Remarks Input */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                Remarks (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={3}
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              {!todayStatus?.hasCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Check In
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Check Out
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Attendance Complete
            </h3>
            <p className="text-gray-600">
              You have successfully completed your attendance for today.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total working time: {todayStatus.attendance.totalHours}h
            </p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">Attendance Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check-in time: 9:00 AM (Late after 9:30 AM)</li>
              <li>• Minimum working hours: 8 hours for full day</li>
              <li>• Less than 4 hours will be marked as half-day</li>
              <li>• Don't forget to check-out when leaving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance; 