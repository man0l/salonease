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
      return <SuperAdminDashboard />;
    case 'SalonOwner':
      return <SalonOwnerDashboard />;
    case 'Staff':
      return <StaffDashboard />;
    default:
      return <div>{t('dashboard:error.invalid_user_role')}</div>;
  }
};

export default Dashboard;
