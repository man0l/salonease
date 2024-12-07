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
    return <div>Loading...</div>;
  }

  if (subscription.status === 'inactive') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {t('billing:subscription.title')}
          </h2>
          <FaCreditCard className="text-gray-400 h-6 w-6" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              {t('billing:subscription.status_label')}
            </p>
            <p className="font-medium text-red-600">
              {t('billing:subscription.inactive')}
            </p>
          </div>
          <p className="text-sm text-gray-500">
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {t('billing:subscription.title')}
        </h2>
        <FaCreditCard className="text-gray-400 h-6 w-6" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            {t('billing:subscription.status_label')}
          </p>
          <p className="font-medium text-gray-900">
            {t(`billing:subscription.status.${status || 'unknown'}`)}
            {status === 'active' && (
              <span className="ml-2 text-green-600">●</span>
            )}
            {status === 'trialing' && (
              <span className="ml-2 text-blue-600">●</span>
            )}
            {status === 'past_due' && (
              <span className="ml-2 text-yellow-600">●</span>
            )}
            {(status === 'canceled' || status === 'incomplete') && (
              <span className="ml-2 text-red-600">●</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            {t('billing:subscription.plan')}
          </p>
          <p className="font-medium text-gray-900">
            {t('billing:subscription.base_plan', {
              amount: amount / 100,
              interval: t(`billing:subscription.intervals.${interval}`),
              currency: currency
            })}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            {t('billing:subscription.current_period')}
          </p>
          <p className="font-medium text-gray-900">
            {formatDate(currentPeriodStart)} - {formatDate(currentPeriodEnd)}
          </p>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={onCancelClick}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            {t('billing:subscription.cancel_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails; 