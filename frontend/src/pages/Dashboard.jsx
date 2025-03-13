import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Если пользователь не залогинен, редирект на /login
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
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
      }
    };

    fetchServers();
  }, []);

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
      {servers.length > 0 ? (
        <ul className="space-y-4">
          {servers.map(server => (
            <li key={server.id} className="p-4 border rounded hover:shadow-lg transition">
              <h3 className="text-xl font-semibold">{server.name}</h3>
              <p>{server.host}:{server.port}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No servers found.</p>
      )}
    </div>
  );
};

export default Dashboard;
