import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [containers, setContainers] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [serverForm, setServerForm] = useState({
    name: '',
    description: '',
    host: '',
    port: '',
    ssh_user: '',
    ssh_private_key: ''
  });
  const [formError, setFormError] = useState('');
  const [serverSubmitting, setServerSubmitting] = useState(false);
  const [containerMenuOpen, setContainerMenuOpen] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContainer, setEditContainer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    ports: '',
    env: '',
    extra_args: '',
    is_active: true
  });
  const [containerSubmitting, setContainerSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Глобальный обработчик для закрытия всех контейнерных меню при клике вне
  useEffect(() => {
    const handleDocumentClick = () => setContainerMenuOpen({});
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Проверка авторизации
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Получение серверов
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('access_token');
        const response = await fetch('http://127.0.0.1:8000/servers/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          Cookies.remove('access_token', { path: '/' });
          navigate('/login');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch servers');
        }
        const data = await response.json();
        setServers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServers();
  }, [navigate]);

  // Получение контейнеров для сервера
  const fetchContainersForServer = async (serverId) => {
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverId}/containers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch containers');
      }
      const data = await response.json();
      setContainers((prev) => ({ ...prev, [serverId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  // Переключение раскрытия сервера
  const toggleServer = async (serverId) => {
    setExpanded((prev) => ({ ...prev, [serverId]: !prev[serverId] }));
    setContainerMenuOpen((prev) => ({ ...prev, [serverId]: false }));
    if (!expanded[serverId] && !containers[serverId]) {
      await fetchContainersForServer(serverId);
    }
  };

  // Переключение меню MoreVert для контейнера
  const toggleContainerMenu = (containerId, e) => {
    e.stopPropagation();
    setContainerMenuOpen((prev) => ({
      ...prev,
      [containerId]: !prev[containerId]
    }));
  };

  // Функция управления контейнером (start, stop, restart)
  const handleControl = async (containerId, action, serverId) => {
    setActionLoading((prev) => ({ ...prev, [containerId]: action }));
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverId}/containers/${containerId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Action failed');
      }
      await fetchContainersForServer(serverId);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [containerId]: false }));
    }
  };

  // Открытие модального окна редактирования контейнера
  const openEditModal = (container, serverId) => {
    setEditContainer({ ...container, server_id: serverId });
    setEditForm({
      name: container.name,
      image: container.image,
      ports: container.ports || '',
      env: '',
      extra_args: '',
      is_active: container.is_active !== undefined ? container.is_active : true
    });
    setShowEditModal(true);
    setContainerMenuOpen((prev) => ({ ...prev, [container.id]: false }));
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditContainer(null);
    setShowConfirm(false);
    setContainerSubmitting(false);
  };

  // Функция для обновления контейнера Active статусом (PUT запрос)
  const updateContainerActiveStatus = async (serverId, containerId, is_active) => {
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverId}/containers/${containerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Active status update failed');
      }
      await fetchContainersForServer(serverId);
    } catch (error) {
      console.error(error);
    }
  };

  // Функция обработки отправки формы редактирования контейнера
  const handleEditSubmit = async (e, serverId) => {
    e.preventDefault();
    setContainerSubmitting(true);
    const { name, image, ports, env, extra_args, is_active } = editForm;
    const fieldsChanged = (
      name !== editContainer.name ||
      image !== editContainer.image ||
      ports !== (editContainer.ports || '') ||
      env.trim() !== '' ||
      extra_args.trim() !== ''
    );
    if (!fieldsChanged) {
      if (is_active !== editContainer.is_active) {
        await updateContainerActiveStatus(serverId, editContainer.id, is_active);
      }
      closeEditModal();
      return;
    }
    // Вместо browser alert – показываем модальное окно подтверждения (уже реализовано в confirm modal ниже)
    setShowConfirm(true);
    setContainerSubmitting(false);
  };

  // Функция подтверждения пересоздания контейнера (из модального окна подтверждения)
  const confirmEditSubmit = async (serverId) => {
    setContainerSubmitting(true);
    const { name, image, ports, env, extra_args, is_active } = editForm;
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverId}/containers/${editContainer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          image,
          ports,
          env: env ? JSON.parse(env) : {},
          extra_args
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Container update failed.');
      }
      if (is_active !== editContainer.is_active) {
        await updateContainerActiveStatus(serverId, editContainer.id, is_active);
      }
      await fetchContainersForServer(serverId);
      closeEditModal();
    } catch (err) {
      console.error(err);
      setContainerSubmitting(false);
    }
  };

  // Функция для выхода
  const handleLogout = () => {
    Cookies.remove('access_token', { path: '/' });
    navigate('/login');
  };

  // Функция для отправки формы создания сервера
  const handleServerFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setServerSubmitting(true);
    try {
      const token = Cookies.get('access_token');
      const response = await fetch('http://127.0.0.1:8000/servers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...serverForm,
          port: parseInt(serverForm.port, 10)
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Server creation failed.');
      }
      const newServer = await response.json();
      setServers(prev => [...prev, newServer]);
      setShowModal(false);
      setServerForm({
        name: '',
        description: '',
        host: '',
        port: '',
        ssh_user: '',
        ssh_private_key: ''
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setServerSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-white border border-black text-black rounded hover:bg-green-200 transition"
            title="Add Server"
          >
            Add Server
          </button>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-600">Loading servers...</p>
      ) : servers.length > 0 ? (
        <div className="space-y-4">
          {servers.map((server) => (
            <div key={server.id} className="border rounded shadow-sm relative">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
                onClick={() => toggleServer(server.id)}
              >
                <div>
                  <h3 className="text-xl font-semibold">{server.name}</h3>
                  <p>{server.host}:{server.port}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={(e) => e.stopPropagation()} className="p-1">
                    {/* Серверное меню можно добавить сюда */}
                  </button>
                  {expanded[server.id] ? (
                    <KeyboardArrowUpIcon fontSize="large" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="large" />
                  )}
                </div>
              </div>
              {expanded[server.id] && (
                <div className="p-4">
                  {containers[server.id] ? (
                    containers[server.id].length > 0 ? (
                      <ul className="space-y-2">
                        {containers[server.id].map((container) => (
                          <li
                            key={container.id}
                            className={`border p-2 rounded relative ${!container.is_active ? 'bg-gray-200' : ''}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium">{container.name}</p>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleControl(container.id, 'start', server.id)}
                                  disabled={!container.is_active || actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-green-600 hover:bg-green-700 transition ${(!container.is_active || actionLoading[container.id] === 'start') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] === 'start' ? 'Starting...' : 'Start'}
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'stop', server.id)}
                                  disabled={!container.is_active || actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-red-600 hover:bg-red-700 transition ${(!container.is_active || actionLoading[container.id] === 'stop') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] === 'stop' ? 'Stopping...' : 'Stop'}
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'restart', server.id)}
                                  disabled={!container.is_active || actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-blue-600 hover:bg-blue-700 transition ${(!container.is_active || actionLoading[container.id] === 'restart') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] === 'restart' ? 'Restarting...' : 'Restart'}
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setContainerMenuOpen(prev => ({ ...prev, [container.id]: !prev[container.id] }));
                                    }}
                                    className="p-1"
                                  >
                                    <MoreVertIcon className="h-6 w-6 text-black" />
                                  </button>
                                  {containerMenuOpen[container.id] && (
                                    <div className="absolute -right-4 top-8 transform scale-90 bg-white border border-gray-300 rounded shadow-md z-10"
                                         onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditModal(container, server.id);
                                        }}
                                        className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                                      >
                                        <EditIcon className="h-5 w-5 mr-2" /> Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setContainerMenuOpen(prev => ({ ...prev, [container.id]: false }));
                                        }}
                                        className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                                      >
                                        <DeleteIcon className="h-5 w-5 mr-2" /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Status: {actionLoading[container.id]
                                ? actionLoading[container.id] === 'start'
                                  ? 'Starting...'
                                  : actionLoading[container.id] === 'stop'
                                  ? 'Stopping...'
                                  : actionLoading[container.id] === 'restart'
                                  ? 'Restarting...'
                                  : 'Updating...'
                                : container.status}{!container.is_active && ' [DEACTIVATED]'}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No containers found.</p>
                    )
                  ) : (
                    <p className="text-gray-600">Loading containers...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No servers found.</p>
      )}

      {/* Modal for Adding Server */}
      {showModal && (
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              setServerSubmitting(true);
              try {
                const token = Cookies.get('access_token');
                const response = await fetch('http://127.0.0.1:8000/servers/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    ...serverForm,
                    port: parseInt(serverForm.port, 10)
                  }),
                  credentials: 'include'
                });
                if (!response.ok) {
                  throw new Error('Server creation failed.');
                }
                const newServer = await response.json();
                setServers(prev => [...prev, newServer]);
                setShowModal(false);
                setServerForm({
                  name: '',
                  description: '',
                  host: '',
                  port: '',
                  ssh_user: '',
                  ssh_private_key: ''
                });
              } catch (err) {
                setFormError(err.message);
              } finally {
                setServerSubmitting(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Name:</label>
                <input
                  type="text"
                  value={serverForm.name}
                  onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Server name"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Description:</label>
                <input
                  type="text"
                  value={serverForm.description}
                  onChange={e => setServerForm({ ...serverForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='"root" by default'
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-semibold">SSH Private Key:</label>
                <textarea
                  value={serverForm.ssh_private_key}
                  onChange={e => setServerForm({ ...serverForm, ssh_private_key: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Your SSH key which starts with -----BEGIN OPENSSH PRIVATE KEY----- and ends with -----END OPENSSH PRIVATE KEY-----"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center">
                {serverSubmitting && <Spinner />}
                {serverSubmitting ? 'Creating...' : 'Create Server'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Container */}
      {showEditModal && (
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Image:</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Ports:</label>
                <input
                  type="text"
                  value={editForm.ports}
                  onChange={e => setEditForm({ ...editForm, ports: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 80:80, 5432:5432"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Env (JSON):</label>
                <textarea
                  value={editForm.env}
                  onChange={e => setEditForm({ ...editForm, env: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      )}

      {/* Confirmation Modal for Recreate */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4 text-center">
              Confirm Recreate
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to recreate the container with the new data?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  confirmEditSubmit(editContainer.server_id);
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
      )}

      {/* Modal for Adding Server */}
      {showModal && (
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              setServerSubmitting(true);
              try {
                const token = Cookies.get('access_token');
                const response = await fetch('http://127.0.0.1:8000/servers/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    ...serverForm,
                    port: parseInt(serverForm.port, 10)
                  }),
                  credentials: 'include'
                });
                if (!response.ok) {
                  throw new Error('Server creation failed.');
                }
                const newServer = await response.json();
                setServers(prev => [...prev, newServer]);
                setShowModal(false);
                setServerForm({
                  name: '',
                  description: '',
                  host: '',
                  port: '',
                  ssh_user: '',
                  ssh_private_key: ''
                });
              } catch (err) {
                setFormError(err.message);
              } finally {
                setServerSubmitting(false);
              }
            }}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Name:</label>
                <input
                  type="text"
                  value={serverForm.name}
                  onChange={e => setServerForm({ ...serverForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Server name"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Description:</label>
                <input
                  type="text"
                  value={serverForm.description}
                  onChange={e => setServerForm({ ...serverForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='"root" by default'
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-semibold">SSH Private Key:</label>
                <textarea
                  value={serverForm.ssh_private_key}
                  onChange={e => setServerForm({ ...serverForm, ssh_private_key: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Your SSH key which starts with -----BEGIN OPENSSH PRIVATE KEY----- and ends with -----END OPENSSH PRIVATE KEY-----"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex justify-center items-center">
                {serverSubmitting && <Spinner />}
                {serverSubmitting ? 'Creating...' : 'Create Server'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
