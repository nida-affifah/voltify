import React, { useState, useEffect } from 'react';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/admin/stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading toko...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>🏪 Manajemen Toko</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Nama Toko</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Pemilik</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Kota</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Rating</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Status</th>
             </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id_toko} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px', color: 'white' }}>{store.id_toko}</td>
                <td style={{ padding: '12px', color: 'white' }}>{store.nama_toko}</td>
                <td style={{ padding: '12px', color: 'white' }}>{store.owner_name || '-'}</td>
                <td style={{ padding: '12px', color: 'white' }}>{store.kota}</td>
                <td style={{ padding: '12px', color: '#ffaa00' }}>{store.rating} ⭐</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: store.is_active ? '#4caf50' : '#f44336',
                    color: 'white'
                  }}>
                    {store.is_active ? 'Aktif' : 'Nonaktif'}
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

export default AdminStores;
