import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const InfoContainerModal = ({ show, container, onClose }) => {
  if (!show || !container) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          title="Close"
        >
          <CloseIcon />
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Container Info</h3>
        <div className="space-y-2">
          <p><strong>ID:</strong> {container.id}</p>
          <p><strong>Name:</strong> {container.name}</p>
          <p><strong>Image:</strong> {container.image}</p>
          <p><strong>Ports:</strong> {container.ports || '-'}</p>
          <p><strong>Docker ID:</strong> {container.docker_id || '-'}</p>
          <p><strong>Status:</strong> {container.status}</p>
          <p><strong>Active:</strong> {container.is_active ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoContainerModal;
