import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import SalonOwnerDashboard from './SalonOwnerDashboard';
import StaffDashboard from './StaffDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  switch (user.role) {
    case 'SuperAdmin':
      return <SuperAdminDashboard />;
    case 'SalonOwner':
      return <SalonOwnerDashboard />;
    case 'Staff':
      return <StaffDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default Dashboard;
