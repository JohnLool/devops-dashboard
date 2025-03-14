import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [containers, setContainers] = useState({});
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
  const navigate = useNavigate();

  // Проверка авторизации
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Получение списка серверов
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
  }, []);

  // Функция для получения контейнеров для сервера
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

  // Переключение раскрытия сервера и загрузка контейнеров, если нужно
  const toggleServer = async (serverId) => {
    setExpanded((prev) => ({ ...prev, [serverId]: !prev[serverId] }));
    if (!expanded[serverId] && !containers[serverId]) {
      await fetchContainersForServer(serverId);
    }
  };

  // Функция для управления контейнером (start, stop, restart)
  const handleControl = async (containerId, action, serverId) => {
    // Set loading state for this container to the action name
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

  // Состояние для отслеживания загрузки действий над контейнерами
  const [actionLoading, setActionLoading] = useState({});

  // Функция для выхода
  const handleLogout = () => {
    Cookies.remove('access_token', { path: '/' });
    navigate('/login');
  };

  // Функция для отправки формы создания сервера
  const handleServerFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
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
          port: parseInt(serverForm.port, 10)  // преобразование порта в число
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Server creation failed.');
      }
      const newServer = await response.json();
      setServers((prev) => [...prev, newServer]);
      setShowModal(false);
      // Сброс формы
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <button
              onClick={() => setShowModal(true)}
              className="p-2 text-black rounded-full hover:bg-gray-200 transition"
              title="Add Server"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1 H12 V12 H1.5 V23 V12 H12 V22.5 H23 H12 V12 H22.5 V0.5"/>
            </svg>
          </button>
          <button
              onClick={() => setShowModal(true)}
              className="p-2 text-black rounded-full hover:bg-gray-200 transition"
              title="Add Server"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22.5 1 V12.5 H1.5 V23"/>
            </svg>
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
                <div key={server.id} className="border rounded shadow-sm">
                  <div
                      className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => toggleServer(server.id)}
              >
                <div>
                  <h3 className="text-xl font-semibold">{server.name}</h3>
                  <p>{server.host}:{server.port}</p>
                </div>
                <div>
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
                          <li key={container.id} className="border p-2 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-medium">{container.name}</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleControl(container.id, 'start', server.id)}
                                  disabled={actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-green-700 hover:bg-green-800 transition ${actionLoading[container.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] && actionLoading[container.id] === 'start' ? 'Starting...' : 'Start'}
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'stop', server.id)}
                                  disabled={actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-red-600 hover:bg-red-700 transition ${actionLoading[container.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] && actionLoading[container.id] === 'stop' ? 'Stopping...' : 'Stop'}
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'restart', server.id)}
                                  disabled={actionLoading[container.id]}
                                  className={`px-2 py-1 rounded text-white text-sm bg-blue-600 hover:bg-blue-700 transition ${actionLoading[container.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {actionLoading[container.id] && actionLoading[container.id] === 'restart' ? 'Restarting...' : 'Restart'}
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Status: {actionLoading[container.id] ? (
                                // Используем значение, которое определяет тип действия
                                actionLoading[container.id] === 'start'
                                  ? 'Starting...'
                                  : actionLoading[container.id] === 'stop'
                                  ? 'Stopping...'
                                  : actionLoading[container.id] === 'restart'
                                  ? 'Restarting...'
                                  : 'Updating...'
                              ) : container.status}
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
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Description:</label>
                <input
                  type="text"
                  value={serverForm.description}
                  onChange={e => setServerForm({ ...serverForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Create Server
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
