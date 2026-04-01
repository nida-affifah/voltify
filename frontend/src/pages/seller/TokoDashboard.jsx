import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function TokoDashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    total_customers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/toko/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>🏪 Dashboard Toko</h1>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#888' }}>Total Produk</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_products}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#888' }}>Total Pesanan</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_orders}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#888' }}>Pendapatan</h3>
          <p style={{ fontSize: '24px', color: '#00ffaa' }}>Rp{stats.total_revenue?.toLocaleString()}</p>
        </div>
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#888' }}>Pelanggan</h3>
          <p style={{ fontSize: '32px', color: '#00d4ff' }}>{stats.total_customers}</p>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', marginBottom: '20px' }}>🏆 Produk Terlaris</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Produk</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Terjual</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Total</th>
                 </tr>
              </thead>
              <tbody>
                {topProducts.map((prod, index) => (
                  <tr key={prod.id_produk || `prod-${index}`} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px', color: 'white' }}>{prod.nama_produk}</td>
                    <td style={{ padding: '12px', color: '#ffaa00' }}>{prod.total_terjual || 0} pcs</td>
                    <td style={{ padding: '12px', color: '#00ffaa' }}>Rp{prod.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>📋 Pesanan Terbaru</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Pelanggan</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={order.id_transaksi || `order-${index}`} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px', color: 'white' }}>#{order.id_transaksi}</td>
                  <td style={{ padding: '12px', color: 'white' }}>{order.customer_name || '-'}</td>
                  <td style={{ padding: '12px', color: '#00ffaa' }}>Rp{order.grand_total?.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background: order.status_order === 'pending' ? '#ff9800' : '#4caf50',
                      color: 'white'
                    }}>
                      {order.status_order === 'pending' ? 'Menunggu' : 'Diproses'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                    Belum ada pesanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <Link to="/toko/products">
          <button style={{ padding: '12px 24px', background: '#00d4ff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📦 Kelola Produk
          </button>
        </Link>
        <Link to="/toko/orders">
          <button style={{ padding: '12px 24px', background: '#2a2a3a', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
            📋 Kelola Pesanan
          </button>
        </Link>
        <Link to="/toko/reports">
          <button style={{ padding: '12px 24px', background: '#2a2a3a', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
            📊 Laporan
          </button>
        </Link>
      </div>
    </div>
  );
}

export default TokoDashboard;
