import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    total_customers: 0,
    pending_orders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!token || (user.role !== 'admin_toko' && user.role !== 'seller' && user.role !== 'super_admin')) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5555/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3>Total Produk</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_products}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3>Total Pesanan</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_orders}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3>Pendapatan</h3>
          <p style={{ fontSize: '24px', color: '#00ffaa' }}>Rp{stats.total_revenue.toLocaleString()}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3>Pelanggan</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_customers}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
