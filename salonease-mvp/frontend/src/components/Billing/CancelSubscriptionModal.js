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
        className="bg-gray-900 rounded-lg shadow-lg max-w-md w-full border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-100">
            {t('billing:title.cancel_subscription')}
          </h3>
          <p className="mb-4 text-gray-400">
            {t('billing:subscription.message.confirm_cancel')}
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors duration-300"
              onClick={onClose}
            >
              {t('billing:subscription.action.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300"
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
