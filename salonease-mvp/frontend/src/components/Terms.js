import React from 'react';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation('legal');
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title.terms_and_conditions')}</h1>
      <p className="mb-4">{t('welcome_message')}</p>
      <p className="mb-4">{t('terms_intro')}</p>
      <p className="mb-4">{t('terms_acceptance')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('title.cookies')}</h2>
      <p className="mb-4">{t('cookies_explanation')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('title.license')}</h2>
      <p className="mb-4">{t('license_explanation')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('title.restrictions')}</h2>
    </div>
  );
};

export default Terms;
