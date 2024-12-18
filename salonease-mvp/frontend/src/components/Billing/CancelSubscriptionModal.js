import React from 'react';
import { useTranslation } from 'react-i18next';

const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation(['billing']);
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-card max-w-md w-full border border-muted"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4 text-foreground">
            {t('billing:title.cancel_subscription')}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t('billing:subscription.message.confirm_cancel')}
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-md transition-colors duration-300"
              onClick={onClose}
            >
              {t('billing:subscription.action.cancel')}
            </button>
            <button
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-300"
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
