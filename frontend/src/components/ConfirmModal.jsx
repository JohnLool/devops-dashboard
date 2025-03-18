import React from 'react';

const ConfirmModal = ({ showConfirm, setShowConfirm, confirmEditSubmit, serverId }) => {
  if (!showConfirm) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-center">Confirm Recreate</h3>
        <p className="mb-6 text-center">
          Are you sure you want to recreate the container with the new data?
        </p>
        <div className="flex justify-around">
          <button
            onClick={() => {
              confirmEditSubmit(serverId);
              setShowConfirm(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Confirm
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
