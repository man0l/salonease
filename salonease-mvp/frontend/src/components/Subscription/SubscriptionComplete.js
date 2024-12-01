import React, { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const SubscriptionComplete = () => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common']);
  const [status, setStatus] = useState('processing');
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleSetupIntent = async () => {
      if (!stripe) {
        // Stripe is not yet loaded
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const clientSecret = searchParams.get('setup_intent_client_secret');
      const setupIntentId = searchParams.get('setup_intent');

      if (!clientSecret) {
        setStatus('error');
        toast.error(t('common:subscription.complete.error.missing_intent'));
        return;
      }

      try {
        const { setupIntent } = await stripe.retrieveSetupIntent(clientSecret);
        
        switch (setupIntent.status) {
          case 'succeeded':
            setStatus('success');
            toast.success(t('common:subscription.complete.success'));
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
            break;
          case 'processing':
            setStatus('processing');
            toast.info(t('common:subscription.complete.processing'));
            break;
          case 'requires_payment_method':
            setStatus('error');
            toast.error(t('common:subscription.complete.payment_failed'));
            setTimeout(() => {
              navigate('/subscription');
            }, 2000);
            break;
          default:
            setStatus('error');
            toast.error(t('common:subscription.complete.error'));
            break;
        }
      } catch (error) {
        console.error('Setup intent error:', error);
        setStatus('error');
        toast.error(error.message);
      }
    };

    if (stripe) {
      handleSetupIntent();
    }
  }, [stripe, navigate, t, location]);

  if (!stripe || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <FaCheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            )}
            {status === 'error' && (
              <FaTimesCircle className="h-12 w-12 text-red-500 mx-auto" />
            )}
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t(`common:subscription.complete.status.${status}.title`)}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t(`common:subscription.complete.status.${status}.message`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionComplete;

