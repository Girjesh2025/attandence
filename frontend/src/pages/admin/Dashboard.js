import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import { toast } from 'react-toastify';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Bell
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import moment from 'moment';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();

    return () => {
      // Cleanup socket listeners
      socketService.offAttendanceUpdate(handleAttendanceUpdate);
      socketService.leaveAdminRoom();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load attendance statistics
      const statsResponse = await attendanceAPI.getStats({ period: 'month' });
      setStats(statsResponse.data);
      
      // Load recent attendance records
      const attendanceResponse = await attendanceAPI.getAllRecords({
        limit: 10,
        page: 1
      });
      setRecentAttendance(attendanceResponse.data.attendance || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Connect to socket and join admin room
    socketService.connect();
    socketService.joinAdminRoom({ userId: user._id, role: user.role });
    
    // Listen for attendance updates
    socketService.onAttendanceUpdate(handleAttendanceUpdate);
  };

  const handleAttendanceUpdate = (update) => {
    console.log('Real-time attendance update:', update);
    
    // Add to real-time updates list
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 4)]);
    
    // Show notification
    const message = `${update.employee.name} ${update.type === 'checkin' ? 'checked in' : 'checked out'}`;
    toast.info(message, {
      icon: <Bell className="h-4 w-4" />,
      autoClose: 3000
    });
    
    // Refresh dashboard data
    loadDashboardData();
  };

  const formatChartData = (data) => {
    return data?.map(item => ({
      ...item,
      date: moment(item.date).format('MMM DD')
    })) || [];
  };

  const statusColors = {
    present: '#10b981',
    late: '#f59e0b',
    halfDay: '#f59e0b',
    absent: '#ef4444'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'late':
        return <Timer className="h-4 w-4 text-warning-500" />;
      case 'half-day':
        return <Clock className="h-4 w-4 text-warning-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-lg"></div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-purple-100">
          {moment().format('dddd, MMMM Do YYYY')} • Real-time monitoring
        </p>
        <div className="flex items-center mt-2">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-purple-200 text-sm">Live updates active</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.overview?.totalEmployees || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats?.overview?.activeEmployees || 0} active today
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.overview?.attendanceRate || 0}%
              </p>
              <p className="text-sm text-success-600 mt-1">
                This month
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.overview?.totalHours || 0}h
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Avg: {stats?.overview?.averageHours || 0}h/day
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Today's Records */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.overview?.totalRecords || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Active sessions
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      {realtimeUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Updates
          </h2>
          <div className="space-y-3">
            {realtimeUpdates.map((update, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {update.type === 'checkin' ? 
                      <Clock className="h-4 w-4 text-blue-600" /> :
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {update.employee.name} {update.type === 'checkin' ? 'checked in' : 'checked out'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {update.employee.department} • {moment().fromNow()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-blue-600 font-medium">LIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Daily Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatChartData(stats?.chartData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="present" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Present"
              />
              <Line 
                type="monotone" 
                dataKey="late" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Late"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Attendance Status Breakdown
          </h2>
          <div className="flex flex-col h-80">
            {/* Chart Container */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: stats?.statusBreakdown?.present || 0, color: '#10b981' },
                      { name: 'Late', value: stats?.statusBreakdown?.late || 0, color: '#f59e0b' },
                      { name: 'Half Day', value: stats?.statusBreakdown?.halfDay || 0, color: '#f59e0b' },
                      { name: 'Absent', value: stats?.statusBreakdown?.absent || 0, color: '#ef4444' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Present', value: stats?.statusBreakdown?.present || 0, color: '#10b981' },
                      { name: 'Late', value: stats?.statusBreakdown?.late || 0, color: '#f59e0b' },
                      { name: 'Half Day', value: stats?.statusBreakdown?.halfDay || 0, color: '#f59e0b' },
                      { name: 'Absent', value: stats?.statusBreakdown?.absent || 0, color: '#ef4444' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  Present: {stats?.statusBreakdown?.present || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">
                  Absent: {stats?.statusBreakdown?.absent || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">
                  Late: {stats?.statusBreakdown?.late || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-sm text-gray-600">
                  Half Day: {stats?.statusBreakdown?.halfDay || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers & Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Top Performers
          </h2>
          {stats?.topPerformers?.length > 0 ? (
            <div className="space-y-4">
              {stats.topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-yellow-600' : 'bg-primary-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {performer.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {performer.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {((performer.presentDays / performer.totalDays) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.presentDays}/{performer.totalDays} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No performance data available</p>
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Attendance
          </h2>
          {recentAttendance.length > 0 ? (
            <div className="space-y-4">
              {recentAttendance.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(record.date).format('MMM DD')} • {record.checkIn}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      record.status === 'present' ? 'bg-success-100 text-success-800' :
                      record.status === 'late' ? 'bg-warning-100 text-warning-800' :
                      record.status === 'half-day' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent attendance records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 