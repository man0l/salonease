import React from 'react';
import { useTranslation } from 'react-i18next';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation(['billing']);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {t('billing:title.cancel_subscription')}
          </h3>
          <p className="mb-4 text-gray-600">
            {t('billing:subscription.message.confirm_cancel')}
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              {t('billing:subscription.action.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              onClick={onConfirm}
            >
              {t('billing:subscription.action.confirm_cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;
