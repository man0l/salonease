import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const VerifyEmail = () => {
  const { t } = useTranslation('auth');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get('token');

      if (token) {
        try {
          const response = await authApi.verifyEmail(token);
          setMessage(t('success.verification_successful'));
          setStatus('success');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (error) {
          setMessage(error.response?.data?.message || t('error.verification_failed'));
          setStatus('error');
        }
      } else {
        setMessage(t('error.invalid_verification_link'));
        setStatus('error');
      }
    };

    verifyEmail();
  }, [navigate, location, t]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" role="status">
              <span className="sr-only">{t('loading')}</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{t('verifying_your_email')}</h2>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">{message}</h2>
            <p className="mt-2">{t('redirecting_to_login')}</p>
          </>
        );
      case 'error':
        return (
          <>
            <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold">{message}</h2>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={() => navigate('/login')}
            >
              {t('action.go_to_login')}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto mt-8 max-w-md">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('email_verification')}</h1>
        <div className="flex flex-col items-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
