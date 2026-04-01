import React, { useState, useEffect } from 'react';

function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5555/api/admin/reports?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Loading laporan...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>📊 Laporan Penjualan</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setPeriod('daily')} 
          style={{
            padding: '10px 24px',
            background: period === 'daily' ? '#00d4ff' : '#2a2a3a',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: period === 'daily' ? '#1a1a2e' : 'white',
            fontWeight: period === 'daily' ? 'bold' : 'normal'
          }}
        >
          📅 Harian
        </button>
        <button 
          onClick={() => setPeriod('weekly')} 
          style={{
            padding: '10px 24px',
            background: period === 'weekly' ? '#00d4ff' : '#2a2a3a',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: period === 'weekly' ? '#1a1a2e' : 'white',
            fontWeight: period === 'weekly' ? 'bold' : 'normal'
          }}
        >
          📆 Mingguan
        </button>
        <button 
          onClick={() => setPeriod('monthly')} 
          style={{
            padding: '10px 24px',
            background: period === 'monthly' ? '#00d4ff' : '#2a2a3a',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: period === 'monthly' ? '#1a1a2e' : 'white',
            fontWeight: period === 'monthly' ? 'bold' : 'normal'
          }}
        >
          📅 Bulanan
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: '10px' }}>Total Penjualan</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ffaa' }}>
            Rp{reports?.total_sales?.toLocaleString() || 0}
          </p>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: '10px' }}>Jumlah Pesanan</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>
            {reports?.total_orders || 0}
          </p>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#888', marginBottom: '10px' }}>Produk Terjual</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffaa00' }}>
            {reports?.total_items_sold || 0}
          </p>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🏆 Produk Terlaris</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Produk</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Terjual</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#888' }}>Total</th>
               </tr>
            </thead>
            <tbody>
              {reports?.top_products?.map((product, idx) => (
                <tr key={product.id_produk || idx} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px', color: 'white' }}>{product.nama_produk}</td>
                  <td style={{ padding: '12px', color: '#ffaa00' }}>{product.total_terjual || 0} pcs</td>
                  <td style={{ padding: '12px', color: '#00ffaa', textAlign: 'right' }}>
                    Rp{product.total?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!reports?.top_products || reports.top_products.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                    Belum ada data penjualan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
