import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaFileInvoice } from 'react-icons/fa';
import { format } from 'date-fns';

const UsageMetrics = ({ subscription }) => {
  const { t } = useTranslation(['billing']);

  if (!subscription?.nextInvoice) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-100">
            {t('billing:usage.title')}
          </h2>
          <FaFileInvoice className="text-primary-400 h-6 w-6" />
        </div>
        <p className="text-gray-400">{t('billing:usage.no_data')}</p>
      </div>
    );
  }

  const invoice = subscription.nextInvoice;
  const periodStart = new Date(invoice.period_start * 1000);
  const periodEnd = new Date(invoice.period_end * 1000);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">
          {t('billing:usage.next_invoice')}
        </h2>
        <FaFileInvoice className="text-primary-400 h-6 w-6" />
      </div>

      <div className="space-y-6">
        {/* Invoice Period */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">{t('billing:usage.billing_period')}</span>
          <span className="text-gray-100">
            {format(periodStart, 'dd/MM/yyyy')} - {format(periodEnd, 'dd/MM/yyyy')}
          </span>
        </div>

        {/* Invoice Lines */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-100">{t('billing:usage.usage_details')}</h3>
          {invoice.lines.data.map((line) => (
            <div key={line.id} className="border-b border-gray-800 pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-100">{line.description}</p>
                  <p className="text-xs text-gray-400">
                    {t('billing:usage.quantity')}: {line.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-100">
                  {(line.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice Summary */}
        <div className="space-y-2 pt-4 border-t border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('billing:usage.subtotal')}</span>
            <span className="text-gray-100">
              {(invoice.subtotal / 100).toFixed(2)} {invoice.currency.toUpperCase()}
            </span>
          </div>

          {invoice.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('billing:usage.tax')}</span>
              <span className="text-gray-100">
                {(invoice.tax / 100).toFixed(2)} {invoice.currency.toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-800">
            <span className="text-gray-100">{t('billing:usage.total')}</span>
            <span className="text-primary-400">
              {(invoice.total / 100).toFixed(2)} {invoice.currency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="text-sm text-gray-400">
          {t('billing:usage.payment_due')}: 
          <span className="text-primary-400 ml-1">
            {format(new Date(invoice.next_payment_attempt * 1000), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UsageMetrics; 