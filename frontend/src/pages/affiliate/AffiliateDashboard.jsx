import React, { useState, useEffect } from 'react';

function AffiliateDashboard() {
  const [stats, setStats] = useState({ totalClicks: 0, totalConversions: 0, totalCommission: 0 });
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const [statsRes, linksRes] = await Promise.all([
      fetch('http://localhost:5555/api/affiliate/stats', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:5555/api/affiliate/links', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    const statsData = await statsRes.json();
    const linksData = await linksRes.json();
    setStats(statsData);
    setLinks(linksData.links || []);
  };

  const createLink = async (productId) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5555/api/affiliate/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id_produk: productId })
    });
    fetchData();
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Dashboard Afiliasi</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#1e1e2f', padding: '20px', borderRadius: '12px' }}>
          <h3>Total Klik</h3>
          <p style={{ fontSize: '28px', color: '#00ffaa' }}>{stats.totalClicks || 0}</p>
        </div>
        <div style={{ background: '#1e1e2f', padding: '20px', borderRadius: '12px' }}>
          <h3>Total Konversi</h3>
          <p style={{ fontSize: '28px', color: '#00ffaa' }}>{stats.totalConversions || 0}</p>
        </div>
        <div style={{ background: '#1e1e2f', padding: '20px', borderRadius: '12px' }}>
          <h3>Total Komisi</h3>
          <p style={{ fontSize: '28px', color: '#ffc107' }}>Rp{stats.totalCommission?.toLocaleString() || 0}</p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Link Afiliasi Saya</h3>
        {links.map(link => (
          <div key={link.id_link} style={{ background: '#2a2a3a', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
            <p><strong>{link.nama_produk}</strong></p>
            <code>{`${window.location.origin}/product/${link.id_produk}?ref=${link.link_code}`}</code>
            <p>Klik: {link.total_klik} | Konversi: {link.total_konversi}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AffiliateDashboard;