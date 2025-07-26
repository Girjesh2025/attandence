import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

function EmployeeDashboard() {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    totalHours: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load today's status
      const todayResponse = await attendanceAPI.getTodayStatus();
      setTodayStatus(todayResponse.data);

      // Load recent records (last 7 days)
      const recordsResponse = await attendanceAPI.getMyRecords({
        limit: 7,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      setRecentRecords(recordsResponse.data?.records || []);

      // Calculate basic stats
      const allRecordsResponse = await attendanceAPI.getMyRecords({
        limit: 100 // Get more records for stats
      });
      const allRecords = allRecordsResponse.data?.records || [];
      
      calculateStats(allRecords);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const totalDays = records.length;
    const presentDays = records.filter(record => record.status === 'present').length;
    const totalHours = records.reduce((sum, record) => {
      if (record.hoursWorked) {
        return sum + record.hoursWorked;
      }
      return sum;
    }, 0);
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    setStats({
      totalDays,
      presentDays,
      totalHours: Math.round(totalHours * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Employee'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your attendance and view your performance
        </p>
      </div>

      {/* Today's Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-600" />
          Today's Status
        </h2>
        
        {todayStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Check In</p>
                <p className="text-green-700">{formatTime(todayStatus.checkIn)}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Check Out</p>
                <p className="text-blue-700">
                  {todayStatus.checkOut ? formatTime(todayStatus.checkOut) : 'Not yet'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Hours Today</p>
                <p className="text-purple-700">
                  {todayStatus.hoursWorked ? `${todayStatus.hoursWorked}h` : 'In progress...'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-900">Not Checked In</p>
              <p className="text-yellow-700">Please mark your attendance for today</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Present Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.presentDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h2>
        
        {recentRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkOut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hoursWorked ? `${record.hoursWorked}h` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No attendance records found</p>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard; 