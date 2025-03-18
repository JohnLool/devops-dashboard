import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from '@mui/icons-material/Info';
import AddServerModal from '../components/AddServerModal';
import EditContainerModal from '../components/EditContainerModal';
import ConfirmModal from '../components/ConfirmModal';
import EditServerModal from '../components/EditServerModal';
import ConfirmServerDeleteModal from '../components/ConfirmServerDeleteModal';
import ConfirmContainerDeleteModal from '../components/ConfirmContainerDeleteModal';
import AddContainerModal from '../components/AddContainerModal';
import InfoServerModal from '../components/InfoServerModal';
import InfoContainerModal from '../components/InfoContainerModal';
import Spinner from '../components/Spinner';

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
  const [serverMenuOpen, setServerMenuOpen] = useState({});
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
  const [showEditServerModal, setShowEditServerModal] = useState(false);
  const [editServer, setEditServer] = useState(null);
  const [editServerForm, setEditServerForm] = useState({
    name: '',
    description: '',
    host: '',
    port: '',
    ssh_user: '',
    ssh_private_key: ''
  });
  const [serverEditSubmitting, setServerEditSubmitting] = useState(false);
  const [showConfirmServer, setShowConfirmServer] = useState(false);
  const [showConfirmServerDelete, setShowConfirmServerDelete] = useState(false);
  const [serverToDelete, setServerToDelete] = useState(null);
  const [showConfirmContainerDelete, setShowConfirmContainerDelete] = useState(false);
  const [containerToDelete, setContainerToDelete] = useState(null);
  const [showAddContainerModal, setShowAddContainerModal] = useState(false);
  const [addContainerServerId, setAddContainerServerId] = useState(null);
  const [containerForm, setContainerForm] = useState({
    name: '',
    image: '',
    ports: '',
    env: '',
    extra_args: ''
  });
  const [containerFormSubmitting, setContainerFormSubmitting] = useState(false);
  const [serverDeleteLoading, setServerDeleteLoading] = useState(false);
  const [containerDeleteLoading, setContainerDeleteLoading] = useState(false);

  // Состояния для модальных окон Info
  const [showInfoServerModal, setShowInfoServerModal] = useState(false);
  const [infoServer, setInfoServer] = useState(null);
  const [showInfoContainerModal, setShowInfoContainerModal] = useState(false);
  const [infoContainer, setInfoContainer] = useState(null);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Глобальные обработчики для закрытия меню
  useEffect(() => {
    const handleDocumentClick = () => {
      setContainerMenuOpen({});
      setServerMenuOpen({});
    };
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
    setServerMenuOpen((prev) => ({ ...prev, [serverId]: false }));
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

  // Переключение меню MoreVert для сервера
  const toggleServerMenu = (serverId, e) => {
    e.stopPropagation();
    setServerMenuOpen((prev) => ({
      ...prev,
      [serverId]: !prev[serverId]
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

  // Открытие модального окна редактирования сервера
  const openEditServerModal = (server) => {
    setEditServer(server);
    setEditServerForm({
      name: server.name,
      description: server.description || '',
      host: server.host,
      port: server.port,
      ssh_user: server.ssh_user,
      ssh_private_key: server.ssh_private_key
    });
    setShowEditServerModal(true);
    setServerMenuOpen((prev) => ({ ...prev, [server.id]: false }));
  };

  const closeEditServerModal = () => {
    setShowEditServerModal(false);
    setEditServer(null);
    setShowConfirmServer(false);
    setServerEditSubmitting(false);
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

  // Функция для обновления сервера (PUT запрос)
  const updateServer = async (serverId, updateData) => {
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Server update failed');
      }
      const updatedServer = await response.json();
      setServers(prev => prev.map(s => (s.id === updatedServer.id ? updatedServer : s)));
    } catch (error) {
      console.error(error);
    }
  };

  // Функция обработки отправки формы редактирования сервера
  const handleEditServerSubmit = async (e) => {
    e.preventDefault();
    setServerEditSubmitting(true);
    const fieldsChanged = (
      editServerForm.name !== editServer.name ||
      editServerForm.description !== (editServer.description || '') ||
      editServerForm.host !== editServer.host ||
      editServerForm.port !== editServer.port ||
      editServerForm.ssh_user !== editServer.ssh_user ||
      editServerForm.ssh_private_key !== editServer.ssh_private_key
    );
    if (!fieldsChanged) {
      closeEditServerModal();
      return;
    }
    setShowConfirmServer(true);
    setServerEditSubmitting(false);
  };

  // Функция подтверждения обновления сервера (из модального окна подтверждения)
  const confirmServerEditSubmit = async (serverId) => {
    setServerEditSubmitting(true);
    try {
      await updateServer(serverId, editServerForm);
      closeEditServerModal();
    } catch (err) {
      console.error(err);
      setServerEditSubmitting(false);
    }
  };

  // Функция для открытия модального окна удаления сервера
  const openServerDeleteModal = (server) => {
    setServerToDelete(server);
    setShowConfirmServerDelete(true);
    setServerMenuOpen((prev) => ({ ...prev, [server.id]: false }));
  };

  // Функция для открытия модального окна удаления контейнера
  const openContainerDeleteModal = (container, serverId) => {
    setContainerToDelete({ ...container, server_id: serverId });
    setShowConfirmContainerDelete(true);
    setContainerMenuOpen((prev) => ({ ...prev, [container.id]: false }));
  };

  // Функция удаления сервера с показом спиннера
  const confirmServerDelete = async () => {
    setServerDeleteLoading(true);
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${serverToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Server deletion failed');
      }
      setServers(prev => prev.filter(s => s.id !== serverToDelete.id));
      setShowConfirmServerDelete(false);
    } catch (err) {
      console.error(err);
    } finally {
      setServerDeleteLoading(false);
    }
  };

  // Функция удаления контейнера с показом спиннера
  const confirmContainerDelete = async () => {
    setContainerDeleteLoading(true);
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${containerToDelete.server_id}/containers/${containerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Container deletion failed');
      }
      await fetchContainersForServer(containerToDelete.server_id);
      setShowConfirmContainerDelete(false);
    } catch (err) {
      console.error(err);
    } finally {
      setContainerDeleteLoading(false);
    }
  };

  // Функция для открытия модального окна создания контейнера
  const openAddContainerModal = (serverId) => {
    setAddContainerServerId(serverId);
    setContainerForm({
      name: '',
      image: '',
      ports: '',
      env: '',
      extra_args: ''
    });
    setShowAddContainerModal(true);
  };

  // Функция обработки отправки формы создания контейнера
  const handleAddContainerSubmit = async (e) => {
    e.preventDefault();
    setContainerFormSubmitting(true);
    let envParsed = {};
    if (containerForm.env) {
      try {
        envParsed = JSON.parse(containerForm.env);
      } catch (error) {
        console.error("Invalid JSON in env field", error);
        alert("Invalid JSON format in environment variables.");
        setContainerFormSubmitting(false);
        return;
      }
    }
    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`http://127.0.0.1:8000/servers/${addContainerServerId}/containers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          ...containerForm,
          env: envParsed
        })
      });
      if (!response.ok) {
        throw new Error('Container creation failed.');
      }
      await fetchContainersForServer(addContainerServerId);
      setShowAddContainerModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setContainerFormSubmitting(false);
    }
  };

  // Функция для открытия модального окна отображения информации о сервере
  const openInfoServerModal = (server) => {
    setInfoServer(server);
    setShowInfoServerModal(true);
    setServerMenuOpen((prev) => ({ ...prev, [server.id]: false }));
  };

  // Функция для открытия модального окна отображения информации о контейнере
  const openInfoContainerModal = (container, serverId) => {
    setInfoContainer({ ...container, server_id: serverId });
    setShowInfoContainerModal(true);
    setContainerMenuOpen((prev) => ({ ...prev, [container.id]: false }));
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
            className="px-4 py-2 bg-white border border-gray-300 text-black rounded hover:bg-green-200 transition"
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
                  {/* Кнопка для открытия модального окна добавления контейнера */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddContainerModal(server.id);
                    }}
                    className="p-1"
                    title="Add Container"
                  >
                    <AddIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-700 transition" />
                  </button>
                  {/* Серверное меню */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setServerMenuOpen(prev => ({ ...prev, [server.id]: !prev[server.id] }));
                      }}
                      className="p-1"
                    >
                      <MoreVertIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-700 transition" />
                    </button>
                    {serverMenuOpen[server.id] && (
                      <div className="absolute -right-4 top-8 transform scale-90 bg-white border border-gray-300 rounded shadow-md z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInfoServerModal(server);
                          }}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                        >
                          <InfoIcon className="h-5 w-5 mr-2" /> Info
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditServerModal(server);
                          }}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                        >
                          <EditIcon className="h-5 w-5 mr-2" /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setServerToDelete(server);
                            setShowConfirmServerDelete(true);
                          }}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                        >
                          <DeleteIcon className="h-5 w-5 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
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
                                    <MoreVertIcon className="h-6 w-6 text-gray-800 cursor-pointer hover:text-gray-700 transition" />
                                  </button>
                                  {containerMenuOpen[container.id] && (
                                    <div className="absolute -right-4 top-8 transform scale-90 bg-white border border-gray-300 rounded shadow-md z-10" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openInfoContainerModal(container, server.id);
                                        }}
                                        className="flex items-center px-3 py-2 hover:bg-gray-100 w-full"
                                      >
                                        <InfoIcon className="h-5 w-5 mr-2" /> Info
                                      </button>
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
                                          openContainerDeleteModal(container, server.id);
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

      <AddServerModal
        showModal={showModal}
        setShowModal={setShowModal}
        formError={formError}
        serverForm={serverForm}
        setServerForm={setServerForm}
        handleServerFormSubmit={handleServerFormSubmit}
        serverSubmitting={serverSubmitting}
      />

      <EditContainerModal
        showEditModal={showEditModal}
        editContainer={editContainer}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditSubmit={handleEditSubmit}
        containerSubmitting={containerSubmitting}
        closeEditModal={closeEditModal}
      />

      <ConfirmModal
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        confirmEditSubmit={confirmEditSubmit}
        serverId={editContainer ? editContainer.server_id : null}
      />

      <EditServerModal
        showEditServerModal={showEditServerModal}
        editServerForm={editServerForm}
        setEditServerForm={setEditServerForm}
        handleEditServerSubmit={handleEditServerSubmit}
        serverEditSubmitting={serverEditSubmitting}
        closeEditServerModal={closeEditServerModal}
      />

      <ConfirmServerDeleteModal
        show={showConfirmServerDelete}
        onConfirm={confirmServerDelete}
        onCancel={() => setShowConfirmServerDelete(false)}
        loading={serverDeleteLoading}
      />

      <ConfirmContainerDeleteModal
        show={showConfirmContainerDelete}
        onConfirm={confirmContainerDelete}
        onCancel={() => setShowConfirmContainerDelete(false)}
        loading={containerDeleteLoading}
      />

      <AddContainerModal
        show={showAddContainerModal}
        onClose={() => setShowAddContainerModal(false)}
        containerForm={containerForm}
        setContainerForm={setContainerForm}
        handleSubmit={handleAddContainerSubmit}
        submitting={containerFormSubmitting}
      />

      <InfoServerModal
        show={showInfoServerModal}
        server={infoServer}
        onClose={() => setShowInfoServerModal(false)}
      />

      <InfoContainerModal
        show={showInfoContainerModal}
        container={infoContainer}
        onClose={() => setShowInfoContainerModal(false)}
      />
    </div>
  );
};

export default Dashboard;
