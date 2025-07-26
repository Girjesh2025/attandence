import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Settings as SettingsIcon,
  Building,
  Clock,
  Bell,
  Shield,
  Users,
  Database,
  Mail,
  Globe,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    company: {
      name: 'AttendEase Company',
      address: '123 Business Street, City, State 12345',
      phone: '+1-555-0123',
      email: 'admin@attendease.com',
      website: 'https://attendease.com',
      logo: null,
      timezone: 'America/New_York',
      currency: 'USD'
    },
    attendance: {
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      lateThreshold: 15, // minutes
      breakDuration: 60, // minutes
      weekends: ['saturday', 'sunday'],
      allowRemoteCheckIn: true,
      requireLocation: false,
      enableOvertime: true,
      overtimeMultiplier: 1.5
    },
    notifications: {
      email: {
        enabled: true,
        dailyReports: true,
        lateArrivals: true,
        absentEmployees: true,
        weeklyReports: false
      },
      sms: {
        enabled: false,
        emergencyOnly: true
      },
      inApp: {
        enabled: true,
        realTimeUpdates: true,
        systemAlerts: true
      }
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      sessionTimeout: 30, // minutes
      twoFactorAuth: false,
      ipWhitelist: [],
      autoLogout: true
    },
    integrations: {
      hrSystem: {
        enabled: false,
        apiKey: '',
        syncFrequency: 'daily'
      },
      payroll: {
        enabled: false,
        provider: '',
        apiKey: ''
      }
    }
  });

  const tabs = [
    { id: 'company', name: 'Company', icon: Building },
    { id: 'attendance', name: 'Attendance', icon: Clock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Globe }
  ];

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/admin/settings');
      // setSettings(response.data);
      
      // Using mock data for now
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await api.put('/admin/settings', settings);
      
      // Mock save delay
      setTimeout(() => {
        setLoading(false);
        toast.success('Settings saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      setLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (category, section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [section]: {
          ...prev[category][section],
          [key]: value
        }
      }
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle logo upload
      const reader = new FileReader();
      reader.onload = (e) => {
        updateSetting('company', 'logo', e.target.result);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            value={settings.company.name}
            onChange={(e) => updateSetting('company', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.company.email}
            onChange={(e) => updateSetting('company', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={settings.company.phone}
            onChange={(e) => updateSetting('company', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={settings.company.website}
            onChange={(e) => updateSetting('company', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.company.timezone}
            onChange={(e) => updateSetting('company', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={settings.company.currency}
            onChange={(e) => updateSetting('company', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={settings.company.address}
          onChange={(e) => updateSetting('company', 'address', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        <div className="flex items-center space-x-4">
          {settings.company.logo && (
            <img src={settings.company.logo} alt="Logo" className="h-16 w-16 object-cover rounded-lg" />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Attendance Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Start Time</label>
          <input
            type="time"
            value={settings.attendance.workingHours.start}
            onChange={(e) => updateNestedSetting('attendance', 'workingHours', 'start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work End Time</label>
          <input
            type="time"
            value={settings.attendance.workingHours.end}
            onChange={(e) => updateNestedSetting('attendance', 'workingHours', 'end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Late Threshold (minutes)</label>
          <input
            type="number"
            value={settings.attendance.lateThreshold}
            onChange={(e) => updateSetting('attendance', 'lateThreshold', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (minutes)</label>
          <input
            type="number"
            value={settings.attendance.breakDuration}
            onChange={(e) => updateSetting('attendance', 'breakDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weekend Days</label>
        <div className="grid grid-cols-7 gap-2">
          {weekdays.map(day => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.attendance.weekends.includes(day)}
                onChange={(e) => {
                  const weekends = e.target.checked
                    ? [...settings.attendance.weekends, day]
                    : settings.attendance.weekends.filter(d => d !== day);
                  updateSetting('attendance', 'weekends', weekends);
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{day.slice(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Allow Remote Check-in</h4>
            <p className="text-sm text-gray-500">Enable employees to check in from remote locations</p>
          </div>
          <input
            type="checkbox"
            checked={settings.attendance.allowRemoteCheckIn}
            onChange={(e) => updateSetting('attendance', 'allowRemoteCheckIn', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Require Location</h4>
            <p className="text-sm text-gray-500">Require GPS location for check-in/out</p>
          </div>
          <input
            type="checkbox"
            checked={settings.attendance.requireLocation}
            onChange={(e) => updateSetting('attendance', 'requireLocation', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Enable Overtime</h4>
            <p className="text-sm text-gray-500">Track and calculate overtime hours</p>
          </div>
          <input
            type="checkbox"
            checked={settings.attendance.enableOvertime}
            onChange={(e) => updateSetting('attendance', 'enableOvertime', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.email.enabled}
                onChange={(e) => updateNestedSetting('notifications', 'email', 'enabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Daily Reports</span>
              <input
                type="checkbox"
                checked={settings.notifications.email.dailyReports}
                onChange={(e) => updateNestedSetting('notifications', 'email', 'dailyReports', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Late Arrivals</span>
              <input
                type="checkbox"
                checked={settings.notifications.email.lateArrivals}
                onChange={(e) => updateNestedSetting('notifications', 'email', 'lateArrivals', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">In-App Notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Real-time Updates</span>
              <input
                type="checkbox"
                checked={settings.notifications.inApp.realTimeUpdates}
                onChange={(e) => updateNestedSetting('notifications', 'inApp', 'realTimeUpdates', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">System Alerts</span>
              <input
                type="checkbox"
                checked={settings.notifications.inApp.systemAlerts}
                onChange={(e) => updateNestedSetting('notifications', 'inApp', 'systemAlerts', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Configuration</h3>
      
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Password Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
            <input
              type="number"
              value={settings.security.passwordPolicy.minLength}
              onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Require Uppercase Letters</span>
            <input
              type="checkbox"
              checked={settings.security.passwordPolicy.requireUppercase}
              onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Require Numbers</span>
            <input
              type="checkbox"
              checked={settings.security.passwordPolicy.requireNumbers}
              onChange={(e) => updateNestedSetting('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your attendance system preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSettings}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'company' && renderCompanySettings()}
        {activeTab === 'attendance' && renderAttendanceSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'integrations' && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Integrations</h3>
            <p className="text-gray-500">Connect with external systems and services</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Save Confirmation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            Remember to save your changes before leaving this page. Some settings may require system restart to take effect.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 