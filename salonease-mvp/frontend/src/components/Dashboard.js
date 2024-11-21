import React from 'react';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation(['dashboard']);

  return (
    <div>
      <h1 className="text-3xl font-bold">{t('dashboard:title')}</h1>
      <p>{t('dashboard:welcome')}</p>
    </div>
  );
}

export default Dashboard;
