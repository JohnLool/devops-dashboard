import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const InfoServerModal = ({ show, server, onClose }) => {
  const [expandedKey, setExpandedKey] = useState(false);

  if (!show || !server) return null;

  const toggleExpandedKey = () => {
    setExpandedKey(prev => !prev);
  };

  const sshKey = server.ssh_private_key || '';
  const displayedSshKey =
    !expandedKey && sshKey.length > 100
      ? sshKey.slice(0, 100) + '...'
      : sshKey;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          title="Close"
        >
          <CloseIcon />
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Server Info</h3>
        <div className="space-y-2">
          <p><strong>ID:</strong> {server.id}</p>
          <p><strong>Name:</strong> {server.name}</p>
          <p><strong>Description:</strong> {server.description || '-'}</p>
          <p><strong>Host:</strong> {server.host}</p>
          <p><strong>Port:</strong> {server.port}</p>
          <p><strong>SSH User:</strong> {server.ssh_user}</p>
          <div>
            <p className="font-semibold">SSH Private Key:</p>
            <div className="border border-gray-300 p-2 rounded overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {displayedSshKey}
              </pre>
            </div>
            {sshKey.length > 100 && (
              <button
                onClick={toggleExpandedKey}
                className="text-blue-600 hover:underline mt-1 text-sm"
              >
                {expandedKey ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoServerModal;
