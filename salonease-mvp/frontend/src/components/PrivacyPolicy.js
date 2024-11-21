import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation('legal');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="mb-4">{t('privacy.last_updated', { date: '[DATE]' })}</p>
      <p className="mb-4">
        {t('privacy.introduction', {
          company: '[COMPANY_NAME]',
          website: '[WEBSITE_URL]'
        })}
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.information_collection.title')}</h2>
      <p className="mb-4">{t('privacy.sections.information_collection.content')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.log_data.title')}</h2>
      <p className="mb-4">{t('privacy.sections.log_data.content')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.cookies.title')}</h2>
      <p className="mb-4">{t('privacy.sections.cookies.content')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.security.title')}</h2>
      <p className="mb-4">{t('privacy.sections.security.content')}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.changes.title')}</h2>
      <p className="mb-4">{t('privacy.sections.changes.content', { date: '[DATE]' })}</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">{t('privacy.sections.contact.title')}</h2>
      <p className="mb-4">{t('privacy.sections.contact.content', { email: '[CONTACT_EMAIL]' })}</p>
    </div>
  );
};

export default PrivacyPolicy;
