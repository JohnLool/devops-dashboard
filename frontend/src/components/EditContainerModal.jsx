import React from 'react';
import Spinner from './Spinner';

const EditContainerModal = ({
  showEditModal,
  editContainer,
  editForm,
  setEditForm,
  handleEditSubmit,
  containerSubmitting,
  closeEditModal
}) => {
  if (!showEditModal) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={closeEditModal}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Edit (Recreate) Container</h3>
        <form onSubmit={(e) => handleEditSubmit(e, editContainer.server_id)}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name:</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Image:</label>
            <input
              type="text"
              value={editForm.image}
              onChange={e => setEditForm({ ...editForm, image: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Ports:</label>
            <input
              type="text"
              value={editForm.ports}
              onChange={e => setEditForm({ ...editForm, ports: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 80:80, 5432:5432"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Env (JSON):</label>
            <textarea
              value={editForm.env}
              onChange={e => setEditForm({ ...editForm, env: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder='e.g. {"ENV_VAR": "value", "POSTGRES_PASSWORD": "mysecretpassword"}'
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Extra Args:</label>
            <input
              type="text"
              value={editForm.extra_args}
              onChange={e => setEditForm({ ...editForm, extra_args: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. --restart unless-stopped"
            />
          </div>
          {/* Переключатель Active */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={editForm.is_active}
                  onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                <div className={`w-10 h-4 rounded-full shadow-inner ${editForm.is_active ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute w-6 h-6 bg-gray-100 rounded-full shadow -left-1 -top-1 transition-transform ${editForm.is_active ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="ml-3 text-gray-700 font-medium">Active</span>
            </label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center">
            {containerSubmitting && <Spinner />}
            {containerSubmitting ? 'Updating...' : 'Update Container'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditContainerModal;
