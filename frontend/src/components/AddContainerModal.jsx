import React from 'react';
import Spinner from './Spinner';

const AddContainerModal = ({
  show,
  onClose,
  containerForm,
  setContainerForm,
  handleSubmit,
  submitting
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={onClose}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Add Container</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name:</label>
            <input
              type="text"
              value={containerForm.name}
              onChange={(e) => setContainerForm({ ...containerForm, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Container name"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Image:</label>
            <input
              type="text"
              value={containerForm.image}
              onChange={(e) => setContainerForm({ ...containerForm, image: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Container image"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Ports:</label>
            <input
              type="text"
              value={containerForm.ports}
              onChange={(e) => setContainerForm({ ...containerForm, ports: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 80:80, 443:443"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Env (JSON):</label>
            <textarea
              value={containerForm.env}
              onChange={(e) => setContainerForm({ ...containerForm, env: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder='e.g. {"ENV_VAR": "value"}'
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Extra Args:</label>
            <input
              type="text"
              value={containerForm.extra_args}
              onChange={(e) => setContainerForm({ ...containerForm, extra_args: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='e.g. --restart unless-stopped'
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center"
          >
            {submitting && <Spinner />}
            {submitting ? 'Creating...' : 'Create Container'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContainerModal;
