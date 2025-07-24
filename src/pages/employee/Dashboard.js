import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../utils/api';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Timer,
  User,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import moment from 'moment';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load today's attendance status
      const todayResponse = await attendanceAPI.getTodayStatus();
      setTodayStatus(todayResponse.data);
      
      // Load recent attendance records (last 7 days)
      const recordsResponse = await attendanceAPI.getMyRecords({
        limit: 7,
        page: 1
      });
      setRecentRecords(recordsResponse.data.attendance || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'late':
        return <Timer className="h-5 w-5 text-warning-500" />;
      case 'half-day':
        return <Clock className="h-5 w-5 text-warning-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success-100 text-success-800';
      case 'late':
        return 'bg-warning-100 text-warning-800';
      case 'half-day':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-primary-100">
          {moment().format('dddd, MMMM Do YYYY')}
        </p>
        {user?.employeeId && (
          <p className="text-primary-200 text-sm mt-1">
            Employee ID: {user.employeeId}
          </p>
        )}
      </div>

      {/* Today's Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check-in Status */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check-in Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {todayStatus?.hasCheckedIn ? 'Checked In' : 'Not Checked In'}
              </p>
              {todayStatus?.attendance?.checkIn && (
                <p className="text-sm text-gray-500 mt-1">
                  {moment(todayStatus.attendance.checkIn, 'HH:mm:ss').format('h:mm A')}
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              todayStatus?.hasCheckedIn ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              <Clock className={`h-6 w-6 ${
                todayStatus?.hasCheckedIn ? 'text-success-600' : 'text-gray-400'
              }`} />
            </div>
          </div>
        </div>

        {/* Check-out Status */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Check-out Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {todayStatus?.hasCheckedOut ? 'Checked Out' : 'Not Checked Out'}
              </p>
              {todayStatus?.attendance?.checkOut && (
                <p className="text-sm text-gray-500 mt-1">
                  {moment(todayStatus.attendance.checkOut, 'HH:mm:ss').format('h:mm A')}
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              todayStatus?.hasCheckedOut ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              <CheckCircle className={`h-6 w-6 ${
                todayStatus?.hasCheckedOut ? 'text-success-600' : 'text-gray-400'
              }`} />
            </div>
          </div>
        </div>

        {/* Today's Hours */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {todayStatus?.attendance?.totalHours || '0.0'}h
              </p>
              {todayStatus?.attendance?.status && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${
                  getStatusColor(todayStatus.attendance.status)
                }`}>
                  {getStatusIcon(todayStatus.attendance.status)}
                  <span className="ml-1">{todayStatus.attendance.status}</span>
                </span>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/attendance"
          className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                Mark Attendance
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Check-in or check-out for today
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>

        <Link
          to="/my-attendance"
          className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                My Records
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                View your attendance history
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                Profile
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update your information
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
          </div>
        </Link>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Attendance</h2>
            <Link
              to="/my-attendance"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        {recentRecords.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentRecords.slice(0, 5).map((record, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {moment(record.date).format('MMM DD, YYYY')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.checkIn} - {record.checkOut || 'Not checked out'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      getStatusColor(record.status)
                    }`}>
                      {record.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {record.totalHours}h
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard; 