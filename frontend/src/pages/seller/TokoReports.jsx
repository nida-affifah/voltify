import React, { useState, useEffect } from 'react';

function TokoReports() {
  const [stats, setStats] = useState({ daily_sales: [], top_categories: [] });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5555/api/seller/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <h1>Laporan Toko</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '24px' }}>
        {/* Daily Sales Chart */}
        <div style={{ background: '#1e1e2f', borderRadius: '16px', padding: '20px' }}>
          <h3>Penjualan 7 Hari Terakhir</h3>
          <div style={{ marginTop: '20px' }}>
            {stats.daily_sales.map((day, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{new Date(day.date).toLocaleDateString('id-ID')}</span>
                  <span>Rp{Number(day.total).toLocaleString()}</span>
                </div>
                <div style={{ background: '#2a2a3a', borderRadius: '4px', height: '30px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (day.total / Math.max(...stats.daily_sales.map(d => d.total), 1)) * 100)}%`,
                    background: 'linear-gradient(90deg, #00d4ff, #00ffaa)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '8px',
                    fontSize: '12px'
                  }}>
                    {Math.round((day.total / Math.max(...stats.daily_sales.map(d => d.total), 1)) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div style={{ background: '#1e1e2f', borderRadius: '16px', padding: '20px' }}>
          <h3>Kategori Terlaris</h3>
          <div style={{ marginTop: '20px' }}>
            {stats.top_categories.map((cat, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{cat.nama_kategori}</span>
                  <span>Rp{Number(cat.revenue).toLocaleString()}</span>
                </div>
                <div style={{ background: '#2a2a3a', borderRadius: '4px', height: '8px' }}>
                  <div style={{
                    width: `${Math.min(100, (cat.revenue / Math.max(...stats.top_categories.map(c => c.revenue), 1)) * 100)}%`,
                    background: '#00d4ff',
                    height: '100%',
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Terjual: {cat.total_sold} unit</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokoReports;