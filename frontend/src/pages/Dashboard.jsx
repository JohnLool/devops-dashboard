import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // actionLoading: { [containerId]: actionString ('' | 'start' | 'stop' | 'restart') }
  const [actionLoading, setActionLoading] = useState({});
  // containers: { [serverId]: Array of container objects }
  const [containers, setContainers] = useState({});
  // expanded: { [serverId]: boolean }
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch list of servers on mount
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

  // Function to fetch containers for a given server
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

  // Toggle server expansion (load containers if not already loaded)
  const toggleServer = async (serverId) => {
    setExpanded((prev) => ({ ...prev, [serverId]: !prev[serverId] }));
    if (!expanded[serverId] && !containers[serverId]) {
      await fetchContainersForServer(serverId);
    }
  };

  // Handle control actions for a container
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
      // After action, refresh container list for server
      await fetchContainersForServer(serverId);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [containerId]: '' }));
    }
  };

  // Determine display text for a given action
  const getActionDisplay = (action) => {
    if (action === 'start') return 'Starting...';
    if (action === 'stop') return 'Stopping...';
    if (action === 'restart') return 'Restarting...';
    return '';
  };

  // Logout handler
  const handleLogout = () => {
    Cookies.remove('access_token', { path: '/' });
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
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
                    // Up arrow SVG
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    // Down arrow SVG
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
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
                                  disabled={!!actionLoading[container.id]}
                                  className="px-2 py-1 rounded text-sm bg-green-700 text-white hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Start
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'stop', server.id)}
                                  disabled={!!actionLoading[container.id]}
                                  className="px-2 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Stop
                                </button>
                                <button
                                  onClick={() => handleControl(container.id, 'restart', server.id)}
                                  disabled={!!actionLoading[container.id]}
                                  className="px-2 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Restart
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Status: {actionLoading[container.id]
                                ? getActionDisplay(actionLoading[container.id])
                                : container.status}
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
    </div>
  );
};

export default Dashboard;
