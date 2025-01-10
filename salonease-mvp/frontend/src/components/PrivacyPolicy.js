import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation('legal');
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="mb-4">{t('privacy.last_updated', { date: currentDate })}</p>
      <p className="mb-8">
        {t('privacy.introduction', {
          company: t('company.name'),
          website: t('company.website')
        })}
      </p>
      
      {/* Information Collection */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.information_collection.title')}</h2>
      <p className="mb-6">{t('privacy.sections.information_collection.content')}</p>
      
      {/* Log Data */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.log_data.title')}</h2>
      <p className="mb-6">{t('privacy.sections.log_data.content')}</p>
      
      {/* Cookies */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.cookies.title')}</h2>
      <p className="mb-6">{t('privacy.sections.cookies.content')}</p>
      
      {/* Security */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.security.title')}</h2>
      <p className="mb-6">{t('privacy.sections.security.content')}</p>

      {/* GDPR Section */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.gdpr.title')}</h2>
      <p className="mb-4">{t('privacy.sections.gdpr.content')}</p>
      <ul className="list-disc pl-6 mb-4 space-y-2">
        {t('privacy.sections.gdpr.rights', { returnObjects: true }).map((right, index) => (
          <li key={index} className="text-gray-700">{right}</li>
        ))}
      </ul>
      <p className="mb-6">{t('privacy.sections.gdpr.exercise_rights')}</p>
      
      {/* Changes */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.changes.title')}</h2>
      <p className="mb-6">{t('privacy.sections.changes.content', { date: currentDate })}</p>
      
      {/* Contact */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">{t('privacy.sections.contact.title')}</h2>
      <p className="mb-6">{t('privacy.sections.contact.content', { email: t('company.email') })}</p>
    </div>
  );
};

export default PrivacyPolicy;
