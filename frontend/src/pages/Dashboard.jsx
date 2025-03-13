import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const [servers, setServers] = useState([]);
  const [error, setError] = useState('');

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

        console.log("Response status:", response.status);
        console.log("Redirected to:", response.url);

        const data = await response.json();
        setServers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchServers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {servers.length > 0 ? (
        <ul className="space-y-4">
          {servers.map((server) => (
            <li key={server.id} className="p-4 border rounded hover:shadow-lg transition">
              <strong className="text-xl">{server.name}</strong> - {server.host}:{server.port}
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
