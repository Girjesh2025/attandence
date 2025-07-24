import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import EmployeeDashboard from './employee/Dashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Render different dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard; 