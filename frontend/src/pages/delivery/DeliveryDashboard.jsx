import React, { useState, useEffect } from 'react';

function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5555/api/delivery', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setDeliveries(data.deliveries || []);
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5555/api/delivery/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchDeliveries();
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Dashboard Kurir</h1>
      <div style={{ marginTop: '20px' }}>
        {deliveries.map(delivery => (
          <div key={delivery.id_pengiriman} style={{ background: '#1e1e2f', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
            <p><strong>Invoice:</strong> {delivery.invoice_number}</p>
            <p><strong>Alamat:</strong> {delivery.alamat_lengkap}</p>
            <p><strong>Status:</strong> {delivery.status_pengiriman}</p>
            <select onChange={(e) => updateStatus(delivery.id_pengiriman, e.target.value)} value={delivery.status_pengiriman}>
              <option value="menunggu_pickup">Menunggu Pickup</option>
              <option value="dipickup">Dipickup</option>
              <option value="dalam_perjalanan">Dalam Perjalanan</option>
              <option value="sampai_tujuan">Sampai Tujuan</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryDashboard;