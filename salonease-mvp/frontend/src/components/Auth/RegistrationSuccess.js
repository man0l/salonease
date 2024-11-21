import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RegistrationSuccess = () => {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('success.registration_successful')}
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="text-center text-gray-700 mb-4">
            {t('thank_you_for_registering_you_will_receive_an_email_shortly_with_instructions_to_verify_your_account')}
          </p>
          <p className="text-center text-gray-700 mb-4">
            {t('message.please_check_your_email_and_follow_the_verification_link_to_complete_the_registration_process')}
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('action.return_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
