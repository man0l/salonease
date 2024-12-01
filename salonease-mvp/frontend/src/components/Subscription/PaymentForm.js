import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyFormatter';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';

const PaymentForm = ({ onSuccess, salonData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation(['common']);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/complete`,
          payment_method_data: {
            billing_details: {
              name: salonData?.name,
              email: salonData?.email,
              address: {
                line1: salonData?.address,
                city: salonData?.city,
                state: salonData?.state,
                postal_code: salonData?.postalCode,
                country: 'BG',
              },
            },
          },
        },
      });

      if (error) {
        throw error;
      }

      onSuccess();
    } catch (error) {
      let errorMessage;
      
      switch (error.type) {
        case 'card_error':
        case 'validation_error':
          errorMessage = t(`common:subscription.pricing.errors.card.${error.code}`);
          break;
        default:
          errorMessage = t('common:subscription.pricing.errors.validation');
          break;
      }
      
      toast.error(errorMessage);
      console.error('Payment setup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
                radios: true,
                spacedAccordionItems: true
              },
              fields: {
                billingDetails: {
                  address: {
                    country: 'never'
                  }
                }
              },
              loader: 'auto',
              paymentMethodOrder: ['card', 'ideal', 'sepa_debit']
            }}
            className={`${loading ? 'opacity-50 pointer-events-none' : ''} min-h-[300px]`}
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-md text-white font-medium text-sm sm:text-base transition-colors
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'}`}
        >
          {loading 
            ? t('common:subscription.pricing.action.processing')
            : t('common:subscription.pricing.action.start_trial')
          }
        </button>

        <p className="text-xs sm:text-sm text-gray-500 text-center mt-4">
          {t('common:subscription.pricing.billing_details.note')}
        </p>
      </form>
    </div>
  );
};

export default PaymentForm; 