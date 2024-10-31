import React from 'react';

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
        <p className="mb-4">Are you sure you want to delete this client? This action cannot be undone.</p>
        <div className="flex justify-end">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2 transition duration-300"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
