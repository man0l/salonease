import React from 'react';
import { useTranslation } from 'react-i18next';

const SuperAdminDashboard = () => {
  const { t } = useTranslation(['common']);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">
        {t('dashboard:title.super_admin')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add styled admin cards here */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            {t('dashboard:stats.total_salons')}
          </h2>
          {/* Add content */}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
