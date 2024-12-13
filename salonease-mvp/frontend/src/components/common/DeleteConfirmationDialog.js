import React from 'react';
import { useTranslation } from 'react-i18next';

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-100">
          {t('dialog.confirm_deletion')}
        </h3>
        <p className="mb-6 text-gray-400">{t('dialog.delete_confirmation_message')}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded-md transition duration-300"
          >
            {t('action.cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-gray-100 px-4 py-2 rounded-md transition duration-300"
          >
            {t('action.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
