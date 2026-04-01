import React from 'react';
import { Link } from 'react-router-dom';

function AdminNav() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin_toko' || user.role === 'super_admin';
  
  if (!isAdmin) return null;
  
  return (
    <div style={{
      background: '#1a1a2e',
      padding: '10px 20px',
      borderBottom: '1px solid #00d4ff',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Link to="/admin/dashboard" style={{ color: '#00d4ff', textDecoration: 'none' }}>📊 Dashboard</Link>
        <Link to="/admin/products" style={{ color: '#fff', textDecoration: 'none' }}>🛍️ Produk</Link>
        <Link to="/admin/orders" style={{ color: '#fff', textDecoration: 'none' }}>📦 Pesanan</Link>
        <Link to="/admin/users" style={{ color: '#fff', textDecoration: 'none' }}>👥 Users</Link>
        <Link to="/admin/stores" style={{ color: '#fff', textDecoration: 'none' }}>🏪 Toko</Link>
        <Link to="/admin/transactions" style={{ color: '#fff', textDecoration: 'none' }}>💰 Transaksi</Link>
        <Link to="/admin/reports" style={{ color: '#fff', textDecoration: 'none' }}>📈 Laporan</Link>
      </div>
    </div>
  );
}

export default AdminNav;
