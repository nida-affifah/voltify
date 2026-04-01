import React, { useState, useEffect } from 'react';

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading transaksi...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>💰 Manajemen Transaksi</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID Transaksi</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Pelanggan</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Total</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Tanggal</th>
             </tr>
          </thead>
          <tbody>
            {transactions.map(trx => (
              <tr key={trx.id_transaksi} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px', color: 'white' }}>#{trx.id_transaksi}</td>
                <td style={{ padding: '12px', color: 'white' }}>{trx.customer_name || '-'}</td>
                <td style={{ padding: '12px', color: '#00ffaa' }}>Rp{trx.grand_total?.toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: trx.status_pembayaran === 'paid' ? '#4caf50' : '#ff9800',
                    color: 'white'
                  }}>
                    {trx.status_pembayaran === 'paid' ? 'Lunas' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px', color: 'white' }}>
                  {new Date(trx.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTransactions;
