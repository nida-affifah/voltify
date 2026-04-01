import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TokoOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5555/api/seller/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`http://localhost:5555/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <h1>Pesanan Toko</h1>
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Invoice</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Pembeli</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id_transaksi} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{order.invoice_number}</td>
                <td style={{ padding: '12px' }}>{order.customer_name}</td>
                <td style={{ padding: '12px' }}>Rp{Number(order.grand_total).toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <select
                    value={order.status_order}
                    onChange={(e) => updateStatus(order.id_transaksi, e.target.value)}
                    style={{ background: '#2a2a3a', color: 'white', padding: '6px', borderRadius: '4px', border: '1px solid #00d4ff' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="diproses">Diproses</option>
                    <option value="dikirim">Dikirim</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </td>
                <td style={{ padding: '12px' }}>
                  <Link to={`/order/${order.id_transaksi}`} style={{ color: '#00d4ff' }}>Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TokoOrders;