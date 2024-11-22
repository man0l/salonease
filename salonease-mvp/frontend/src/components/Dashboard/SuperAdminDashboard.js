import React from 'react';
import { useTranslation } from 'react-i18next';

const SuperAdminDashboard = () => {
  const { t } = useTranslation(['common']);
  return (
    <div>
      <h1>{t('dashboard:title.super_admin')}</h1>
      {/* Add Super Admin specific content */}
    </div>
  );
};

export default SuperAdminDashboard;
