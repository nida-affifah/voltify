import React, { useState, useEffect } from 'react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading users...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>👥 Manajemen Pengguna</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Nama</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Status</th>
             </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id_user} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px', color: 'white' }}>{user.id_user}</td>
                <td style={{ padding: '12px', color: 'white' }}>{user.name}</td>
                <td style={{ padding: '12px', color: 'white' }}>{user.email}</td>
                <td style={{ padding: '12px', color: '#00d4ff' }}>{user.role}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: user.is_active ? '#4caf50' : '#f44336',
                    color: 'white'
                  }}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
