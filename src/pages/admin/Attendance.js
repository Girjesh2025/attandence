import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Check,
  X,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';

const AdminAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Mock attendance data
  const mockAttendanceRecords = [
    {
      _id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Engineering',
      date: '2024-07-26',
      checkIn: '09:00:00',
      checkOut: '18:00:00',
      hoursWorked: 8.0,
      status: 'present',
      location: 'Office',
      notes: 'Regular day',
      isLate: false,
      overtime: 0
    },
    {
      _id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      department: 'Marketing',
      date: '2024-07-26',
      checkIn: '09:15:00',
      checkOut: '18:30:00',
      hoursWorked: 8.25,
      status: 'late',
      location: 'Office',
      notes: 'Traffic delay',
      isLate: true,
      overtime: 0.25
    },
    {
      _id: '3',
      employeeId: 'EMP003',
      employeeName: 'Mike Johnson',
      department: 'HR',
      date: '2024-07-26',
      checkIn: null,
      checkOut: null,
      hoursWorked: 0,
      status: 'absent',
      location: null,
      notes: 'Sick leave',
      isLate: false,
      overtime: 0
    },
    {
      _id: '4',
      employeeId: 'EMP004',
      employeeName: 'Sarah Wilson',
      department: 'Finance',
      date: '2024-07-26',
      checkIn: '08:45:00',
      checkOut: '17:30:00',
      hoursWorked: 7.75,
      status: 'present',
      location: 'Remote',
      notes: 'Work from home',
      isLate: false,
      overtime: 0
    },
    {
      _id: '5',
      employeeId: 'EMP005',
      employeeName: 'David Brown',
      department: 'Operations',
      date: '2024-07-26',
      checkIn: '09:30:00',
      checkOut: '13:00:00',
      hoursWorked: 3.5,
      status: 'half-day',
      location: 'Office',
      notes: 'Doctor appointment',
      isLate: true,
      overtime: 0
    }
  ];

  const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'];
  const statuses = ['present', 'absent', 'late', 'half-day'];

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/admin/attendance/all');
      // setAttendanceRecords(response.data.records);
      
      // Using mock data for now
      setTimeout(() => {
        setAttendanceRecords(mockAttendanceRecords);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading attendance records:', error);
      toast.error('Failed to load attendance records');
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') setFilterStatus(value);
    if (filterType === 'department') setFilterDepartment(value);
    if (filterType === 'date') setFilterDate(value);
    setCurrentPage(1);
  };

  const handleRecordSelect = (recordId) => {
    setSelectedRecords(prev => {
      const updated = prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId];
      setShowBulkActions(updated.length > 0);
      return updated;
    });
  };

  const handleSelectAll = () => {
    const allRecordIds = filteredRecords.map(record => record._id);
    setSelectedRecords(prev => 
      prev.length === allRecordIds.length ? [] : allRecordIds
    );
    setShowBulkActions(selectedRecords.length !== allRecordIds.length);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedRecords.length} records?`)) return;
    
    try {
      // TODO: Replace with actual API call
      // await api.delete('/admin/attendance/bulk', { recordIds: selectedRecords });
      
      setAttendanceRecords(prev => 
        prev.filter(record => !selectedRecords.includes(record._id))
      );
      setSelectedRecords([]);
      setShowBulkActions(false);
      toast.success(`${selectedRecords.length} records deleted successfully`);
    } catch (error) {
      console.error('Error deleting records:', error);
      toast.error('Failed to delete records');
    }
  };

  const handleEditRecord = async (recordData) => {
    try {
      // TODO: Replace with actual API call
      // await api.put(`/admin/attendance/${editingRecord._id}`, recordData);
      
      setAttendanceRecords(prev => 
        prev.map(record => 
          record._id === editingRecord._id ? { ...record, ...recordData } : record
        )
      );
      setEditingRecord(null);
      toast.success('Record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      // TODO: Replace with actual API call
      // await api.delete(`/admin/attendance/${recordId}`);
      
      setAttendanceRecords(prev => prev.filter(record => record._id !== recordId));
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || record.department === filterDepartment;
    const matchesDate = !filterDate || record.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    halfDay: attendanceRecords.filter(r => r.status === 'half-day').length
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'half-day': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Attendance Records</h1>
          <p className="text-gray-600 mt-1">Monitor and manage employee attendance data</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAttendanceRecords}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Present</p>
              <p className="text-xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <XCircle className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Absent</p>
              <p className="text-xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Late</p>
              <p className="text-xl font-bold text-gray-900">{stats.late}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Half Day</p>
              <p className="text-xl font-bold text-gray-900">{stats.halfDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedRecords.length} records selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedRecords([]);
                  setShowBulkActions(false);
                }}
                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRecords.length === filteredRecords.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record._id)}
                      onChange={() => handleRecordSelect(record._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {record.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        <div className="text-sm text-gray-500">{record.employeeId} • {record.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>In: {formatTime(record.checkIn)}</div>
                      <div>Out: {formatTime(record.checkOut)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.hoursWorked}h
                    {record.overtime > 0 && (
                      <div className="text-xs text-blue-600">+{record.overtime}h OT</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.location || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * recordsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * recordsPerPage, filteredRecords.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRecords.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Attendance Record</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                handleEditRecord(data);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check In Time</label>
                  <input
                    type="time"
                    name="checkIn"
                    defaultValue={editingRecord.checkIn}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check Out Time</label>
                  <input
                    type="time"
                    name="checkOut"
                    defaultValue={editingRecord.checkOut}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    defaultValue={editingRecord.status}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editingRecord.notes}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Update Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance; 