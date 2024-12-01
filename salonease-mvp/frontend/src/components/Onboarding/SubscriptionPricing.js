import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { subscriptionApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/currencyFormatter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../Subscription/PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPricing = ({ onComplete, salonData }) => {
  const { t } = useTranslation(['common']);
  
  const pricingTiers = [
    {
      range: '1-5',
      price: 20,
      perUnit: true
    },
    {
      range: '6-8',
      price: 50,
      perUnit: true
    },
    {
      range: '9+',
      price: 100,
      perUnit: true
    }
  ];

  const bookingTiers = [
    { first: 1, last: 150, price: 0.50 },
    { first: 151, last: 450, price: 0.35 },
    { first: 451, last: 750, price: 0.30 },
    { first: 751, last: 1200, price: 0.25 },
    { first: 1201, last: '∞', price: 0.15 }
  ];

  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        console.log('Initiating setup intent creation');
        
        const response = await subscriptionApi.createSetupIntent();
        console.log('Setup intent response:', response);
        
        if (!response?.data || !response.data.client_secret || response.data.object !== 'setup_intent') {
          console.error('Invalid response structure:', response);
          throw new Error('Invalid setup intent response');
        }
        
        setClientSecret(response.data.client_secret);
        console.log('Client secret set successfully');
      } catch (error) {
        console.error('Detailed error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(t('common:subscription.pricing.error.setup_failed'));
      } finally {
        setIsLoading(false);
      }
    };

    if (!clientSecret) {
      initializePayment();
    }
  }, [clientSecret, t]);

  const handlePaymentSuccess = async () => {
    try {
      onComplete();
      toast.success(t('common:subscription.pricing.success.trial_activated'));
    } catch (error) {
      console.error('Error completing subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 text-center text-gray-900">
          {t('common:subscription.pricing.title.start_your_journey')}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          {/* Pricing Details Column */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('common:subscription.pricing.trial.title')}
              </h3>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-4xl sm:text-5xl font-extrabold">{formatCurrency(0)}</span>
                <span className="ml-2 text-gray-500">/ {t('common:subscription.pricing.trial.duration')}</span>
              </div>

              {/* Base Pricing */}
              <div className="mt-8 border-t pt-6">
                <h4 className="text-lg font-semibold mb-4">{t('common:subscription.pricing.base_price')}</h4>
                <div className="space-y-3">
                  {pricingTiers.map((tier, index) => (
                    <div key={index} className="flex justify-between items-center text-sm sm:text-base">
                      <span>{tier.range} {t('common:subscription.pricing.salons')}</span>
                      <span className="font-semibold">
                        {formatCurrency(tier.price)} {tier.perUnit ? t('common:subscription.pricing.per_salon') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage-based Pricing */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-semibold mb-4">{t('common:subscription.pricing.usage_price')}</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {bookingTiers.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center text-sm sm:text-base">
                        <span>{tier.first}-{tier.last} {t('common:subscription.pricing.bookings')}</span>
                        <span className="font-semibold">{formatCurrency(tier.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t pt-6">            
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-center text-sm sm:text-base">
                    <span className="text-green-500 mr-3 flex-shrink-0">
                      <FaCheck className="w-5 h-5" />
                    </span>
                    {t('common:subscription.pricing.trial.feature1')}
                  </li>
                  <li className="flex items-center text-sm sm:text-base">
                    <span className="text-green-500 mr-3 flex-shrink-0">
                      <FaCheck className="w-5 h-5" />
                    </span> 
                    {t('common:subscription.pricing.trial.feature2')}
                  </li>          
                </ul>
              </div>
            </div>

          </div>

          {/* Payment Form Column */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                {t('common:subscription.pricing.payment.details')}
              </h3>
              
              {clientSecret ? (
                <Elements 
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0EA5E9',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <PaymentForm 
                    onSuccess={handlePaymentSuccess} 
                    salonData={salonData} 
                  />
                </Elements>
              ) : (
                <div className="text-center text-red-600">
                  {t('common:subscription.pricing.error.setup_failed')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPricing;
