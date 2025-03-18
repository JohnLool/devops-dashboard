import React from 'react';
import Spinner from './Spinner';

const AddServerModal = ({
  showModal,
  setShowModal,
  formError,
  serverForm,
  setServerForm,
  handleServerFormSubmit,
  serverSubmitting
}) => {
  if (!showModal) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={() => setShowModal(false)}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Add Server</h3>
        {formError && <p className="text-red-500 mb-4">{formError}</p>}
        <form onSubmit={handleServerFormSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name:</label>
            <input
              type="text"
              value={serverForm.name}
              onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Server name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description:</label>
            <input
              type="text"
              value={serverForm.description}
              onChange={e => setServerForm({ ...serverForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Host:</label>
            <input
              type="text"
              value={serverForm.host}
              onChange={e => setServerForm({ ...serverForm, host: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Example: 192.168.0.1"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Port:</label>
            <input
              type="number"
              value={serverForm.port}
              onChange={e => setServerForm({ ...serverForm, port: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Example: 443"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">SSH User:</label>
            <input
              type="text"
              value={serverForm.ssh_user}
              onChange={e => setServerForm({ ...serverForm, ssh_user: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='"root" by default'
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">SSH Private Key:</label>
            <textarea
              value={serverForm.ssh_private_key}
              onChange={e => setServerForm({ ...serverForm, ssh_private_key: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Your SSH key which starts with -----BEGIN OPENSSH PRIVATE KEY----- and ends with -----END OPENSSH PRIVATE KEY-----"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center"
          >
            {serverSubmitting && <Spinner />}
            {serverSubmitting ? 'Creating...' : 'Create Server'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddServerModal;
