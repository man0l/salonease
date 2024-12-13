import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import SalonOwnerDashboard from './SalonOwnerDashboard';
import StaffDashboard from './StaffDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import SalonOwnerOnboarding from '../Onboarding/SalonOwnerOnboarding';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['common', 'dashboard']);

  if (user.role === 'SalonOwner' && !user.onboardingCompleted) {
    return <SalonOwnerOnboarding />;
  }

  switch (user.role) {
    case 'SuperAdmin':
      return (
        <div className="bg-gray-950 min-h-screen">
          <SuperAdminDashboard />
        </div>
      );
    case 'SalonOwner':
      return (
        <div className="bg-gray-950 min-h-screen">
          <SalonOwnerDashboard />
        </div>
      );
    case 'Staff':
      return (
        <div className="bg-gray-950 min-h-screen">
          <StaffDashboard />
        </div>
      );
    default:
      return (
        <div className="bg-gray-950 min-h-screen flex items-center justify-center">
          <div className="text-red-500 font-medium">
            {t('dashboard:error.invalid_user_role')}
          </div>
        </div>
      );
  }
};

export default Dashboard;
