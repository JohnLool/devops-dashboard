import React from 'react';
import Spinner from './Spinner';

const EditServerModal = ({
  showEditServerModal,
  editServerForm,
  setEditServerForm,
  handleEditServerSubmit,
  serverEditSubmitting,
  closeEditServerModal
}) => {
  if (!showEditServerModal) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={closeEditServerModal}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Edit Server</h3>
        <form onSubmit={handleEditServerSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name:</label>
            <input
              type="text"
              value={editServerForm.name}
              onChange={(e) => setEditServerForm({ ...editServerForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description:</label>
            <input
              type="text"
              value={editServerForm.description}
              onChange={(e) => setEditServerForm({ ...editServerForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Host:</label>
            <input
              type="text"
              value={editServerForm.host}
              onChange={(e) => setEditServerForm({ ...editServerForm, host: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Port:</label>
            <input
              type="number"
              value={editServerForm.port}
              onChange={(e) => setEditServerForm({ ...editServerForm, port: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">SSH User:</label>
            <input
              type="text"
              value={editServerForm.ssh_user}
              onChange={(e) => setEditServerForm({ ...editServerForm, ssh_user: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">SSH Private Key:</label>
            <textarea
              value={editServerForm.ssh_private_key}
              onChange={(e) => setEditServerForm({ ...editServerForm, ssh_private_key: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center">
            {serverEditSubmitting && <Spinner />}
            {serverEditSubmitting ? 'Updating...' : 'Update Server'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditServerModal;
