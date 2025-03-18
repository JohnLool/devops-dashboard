import React from 'react';
import Spinner from './Spinner';

const ConfirmServerDeleteModal = ({ show, onConfirm, onCancel, loading }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-center">Confirm Delete Server</h3>
        <p className="mb-6 text-center">
          Are you sure you want to delete this server?
        </p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
          >
            {loading && <Spinner />}
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmServerDeleteModal;
