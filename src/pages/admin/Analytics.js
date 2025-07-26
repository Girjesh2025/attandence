import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({});

  // Mock analytics data
  const mockAnalyticsData = {
    overview: {
      totalEmployees: 45,
      activeEmployees: 42,
      avgAttendanceRate: 94.2,
      totalWorkingHours: 1680,
      productivity: 87.5,
      lateCheckIns: 23,
      earlyCheckOuts: 12,
      perfectAttendance: 15
    },
    attendanceTrend: [
      { date: '2024-07-01', present: 38, absent: 4, late: 3, percentage: 84.4 },
      { date: '2024-07-02', present: 41, absent: 2, late: 2, percentage: 91.1 },
      { date: '2024-07-03', present: 40, absent: 3, late: 2, percentage: 88.9 },
      { date: '2024-07-04', present: 42, absent: 1, late: 2, percentage: 93.3 },
      { date: '2024-07-05', present: 39, absent: 4, late: 2, percentage: 86.7 },
      { date: '2024-07-08', present: 43, absent: 1, late: 1, percentage: 95.6 },
      { date: '2024-07-09', present: 41, absent: 2, late: 2, percentage: 91.1 },
      { date: '2024-07-10', present: 42, absent: 2, late: 1, percentage: 93.3 },
      { date: '2024-07-11', present: 40, absent: 3, late: 2, percentage: 88.9 },
      { date: '2024-07-12', present: 44, absent: 1, late: 0, percentage: 97.8 }
    ],
    departmentStats: [
      { department: 'Engineering', employees: 15, attendance: 96.2, avgHours: 8.5 },
      { department: 'Marketing', employees: 8, attendance: 92.1, avgHours: 8.2 },
      { department: 'HR', employees: 5, attendance: 98.5, avgHours: 8.0 },
      { department: 'Finance', employees: 7, attendance: 89.3, avgHours: 8.1 },
      { department: 'Operations', employees: 6, attendance: 91.8, avgHours: 8.3 },
      { department: 'Sales', employees: 4, attendance: 94.5, avgHours: 8.4 }
    ],
    attendanceDistribution: [
      { name: 'Present', value: 85, color: '#10B981' },
      { name: 'Late', value: 10, color: '#F59E0B' },
      { name: 'Absent', value: 5, color: '#EF4444' }
    ],
    productivityTrend: [
      { month: 'Jan', productivity: 82, hours: 1520 },
      { month: 'Feb', productivity: 85, hours: 1580 },
      { month: 'Mar', productivity: 88, hours: 1620 },
      { month: 'Apr', productivity: 86, hours: 1590 },
      { month: 'May', productivity: 89, hours: 1650 },
      { month: 'Jun', productivity: 91, hours: 1680 },
      { month: 'Jul', productivity: 87, hours: 1640 }
    ],
    topPerformers: [
      { name: 'Sarah Johnson', department: 'Engineering', attendance: 100, hours: 172 },
      { name: 'Mike Chen', department: 'Marketing', attendance: 98.5, hours: 168 },
      { name: 'Emily Davis', department: 'HR', attendance: 97.8, hours: 165 },
      { name: 'James Wilson', department: 'Finance', attendance: 96.2, hours: 162 },
      { name: 'Lisa Anderson', department: 'Operations', attendance: 95.5, hours: 160 }
    ]
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get(`/admin/analytics?period=${dateRange}`);
      // setAnalyticsData(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setAnalyticsData(mockAnalyticsData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const StatCard = ({ title, value, change, icon: Icon, color, suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}{suffix}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, attendanceTrend, departmentStats, attendanceDistribution, productivityTrend, topPerformers } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your team's performance</p>
        </div>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={overview.totalEmployees}
          change={5.2}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Attendance Rate"
          value={overview.avgAttendanceRate}
          change={2.1}
          icon={Target}
          color="bg-green-500"
          suffix="%"
        />
        <StatCard
          title="Working Hours"
          value={overview.totalWorkingHours}
          change={-1.2}
          icon={Clock}
          color="bg-purple-500"
        />
        <StatCard
          title="Productivity"
          value={overview.productivity}
          change={3.8}
          icon={TrendingUp}
          color="bg-orange-500"
          suffix="%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => formatDate(value)}
                formatter={(value, name) => [value, name === 'percentage' ? 'Attendance %' : name]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Attendance %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Distribution</h3>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Bar dataKey="attendance" fill="#10B981" name="Attendance %" />
            <Bar dataKey="avgHours" fill="#3B82F6" name="Avg Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Productivity Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity & Hours Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={productivityTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="productivity" 
              stackId="1"
              stroke="#8B5CF6" 
              fill="#8B5CF6"
              fillOpacity={0.6}
              name="Productivity %"
            />
            <Area 
              type="monotone" 
              dataKey="hours" 
              stackId="2"
              stroke="#F59E0B" 
              fill="#F59E0B"
              fillOpacity={0.6}
              name="Total Hours"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500">{performer.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{performer.attendance}%</p>
                  <p className="text-xs text-gray-500">{performer.hours}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Perfect Attendance</span>
              </div>
              <span className="text-lg font-bold text-green-600">{overview.perfectAttendance}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-900">Late Check-ins</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{overview.lateCheckIns}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-900">Early Check-outs</span>
              </div>
              <span className="text-lg font-bold text-red-600">{overview.earlyCheckOuts}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Active Employees</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{overview.activeEmployees}/{overview.totalEmployees}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 