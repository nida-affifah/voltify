import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5555/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal update status');
    }
  };

  const inputResi = async (id) => {
    const resi = prompt('Masukkan nomor resi pengiriman:');
    if (!resi) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5555/api/admin/orders/${id}/resi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resi })
      });
      fetchOrders();
      alert('Resi berhasil ditambahkan!');
    } catch (error) {
      console.error('Error input resi:', error);
      alert('Gagal input resi');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Menunggu Pembayaran', color: '#ff9800' },
    { value: 'processing', label: 'Diproses', color: '#2196f3' },
    { value: 'shipped', label: 'Dikirim', color: '#4caf50' },
    { value: 'delivered', label: 'Selesai', color: '#8bc34a' },
    { value: 'cancelled', label: 'Dibatalkan', color: '#f44336' }
  ];

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status_order === filter;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
        Loading pesanan...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>📦 Manajemen Pesanan</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '8px 16px',
          background: filter === 'all' ? '#00d4ff' : '#2a2a3a',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          color: filter === 'all' ? '#1a1a2e' : 'white'
        }}>Semua</button>
        {statusOptions.map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
            padding: '8px 16px',
            background: filter === opt.value ? opt.color : '#2a2a3a',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            color: 'white'
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Pelanggan</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Resi</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#888' }}>Aksi</th>
               </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id_transaksi} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px', color: 'white' }}>#{order.id_transaksi}</td>
                  <td style={{ padding: '12px', color: 'white' }}>{order.customer_name}</td>
                  <td style={{ padding: '12px', color: '#00ffaa' }}>Rp{order.grand_total?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={order.status_order}
                      onChange={(e) => updateStatus(order.id_transaksi, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        background: '#2a2a3a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {order.resi_pengiriman || '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {order.status_order === 'shipped' && !order.resi_pengiriman && (
                      <button 
                        onClick={() => inputResi(order.id_transaksi)}
                        style={{
                          padding: '6px 12px',
                          background: '#00d4ff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        📦 Input Resi
                      </button>
                    )}
                    {order.status_order !== 'shipped' && (
                      <Link 
                        to={`/admin/orders/${order.id_transaksi}`} 
                        style={{ color: '#00d4ff', textDecoration: 'none' }}
                      >
                        Detail →
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', padding: '12px', background: '#1a1a2e', borderRadius: '8px', color: '#888', fontSize: '13px' }}>
        Total pesanan: {filteredOrders.length} dari {orders.length}
      </div>
    </div>
  );
}

export default AdminOrders;
