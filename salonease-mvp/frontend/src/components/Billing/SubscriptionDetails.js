import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaCreditCard } from 'react-icons/fa';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';

const SubscriptionDetails = ({ subscription, onCancelClick }) => {
  const { t, i18n } = useTranslation(['billing']);

  const getLocale = () => {
    return i18n.language.startsWith('bg') ? bg : enUS;
  };

  const formatDate = (timestamp) => {
    if (timestamp === 'N/A') return timestamp;
    return format(new Date(timestamp * 1000), 'PPP', {
      locale: getLocale()
    });
  };

  if (!subscription) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (subscription.status === 'inactive') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-100">
            {t('billing:subscription.title')}
          </h2>
          <FaCreditCard className="text-gray-400 h-6 w-6" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">
              {t('billing:subscription.status_label')}
            </p>
            <p className="font-medium text-red-400">
              {t('billing:subscription.inactive')}
            </p>
          </div>
          <p className="text-sm text-gray-400">
            {t('billing:subscription.no_active_plan')}
          </p>
        </div>
      </div>
    );
  }

  const {
    status = 'unknown',
    currentPeriodStart = 'N/A',
    currentPeriodEnd = 'N/A',
    plan = {},
    meters = {}
  } = subscription;

  const { amount = 0, interval = 'month', currency = 'USD' } = plan || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">
          {t('billing:subscription.title')}
        </h2>
        <FaCreditCard className="text-primary-400 h-6 w-6" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">
            {t('billing:subscription.status_label')}
          </p>
          <p className="font-medium text-gray-100">
            {t(`billing:subscription.status.${status || 'unknown'}`)}
            <span className={`ml-2 ${
              status === 'active' ? 'text-emerald-400' :
              status === 'trialing' ? 'text-blue-400' :
              status === 'past_due' ? 'text-amber-400' :
              'text-red-400'
            }`}>●</span>
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">
            {t('billing:subscription.plan')}
          </p>
          <p className="font-medium text-gray-100">
            {t('billing:subscription.base_plan', {
              amount: amount / 100,
              interval: t(`billing:subscription.intervals.${interval}`),
              currency: currency
            })}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">
            {t('billing:subscription.current_period')}
          </p>
          <p className="font-medium text-gray-100">
            {formatDate(currentPeriodStart)} - {formatDate(currentPeriodEnd)}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={onCancelClick}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
          >
            {t('billing:subscription.cancel_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails; 