import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Products data:', data);
      if (data.success) {
        setProducts(data.products);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`⚠️ Yakin ingin menghapus produk "${name}"?\n\nData tidak dapat dikembalikan setelah dihapus!`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5555/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Produk "${name}" berhasil dihapus!`);
        // Refresh daftar produk
        fetchProducts();
      } else {
        alert(`❌ Gagal menghapus produk: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Terjadi kesalahan saat menghapus produk');
    }
  };

  const filteredProducts = products.filter(p => 
    p.nama_produk?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'white' }}>
        <div>📦 Loading produk...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'white', margin: 0 }}>🛍️ Manajemen Produk</h1>
          <p style={{ color: '#888', marginTop: '5px', fontSize: '14px' }}>Kelola produk toko Anda</p>
        </div>
        <Link to="/admin/products/add">
          <button style={{
            padding: '12px 24px',
            background: '#00d4ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ➕ Tambah Produk Baru
          </button>
        </Link>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Cari produk berdasarkan nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1a1a2e', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ color: '#888', marginBottom: '20px' }}>Belum ada produk. Klik "Tambah Produk Baru" untuk mulai menambahkan produk.</p>
          <Link to="/admin/products/add">
            <button style={{
              padding: '10px 20px',
              background: '#00d4ff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              + Tambah Produk Pertama
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Nama Produk</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Harga</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Stok</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Terjual</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#888' }}>Aksi</th>
                 </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id_produk} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px', color: '#888' }}>#{product.id_produk}</td>
                    <td style={{ padding: '12px', color: 'white' }}>
                      <div style={{ fontWeight: '500' }}>{product.nama_produk}</div>
                      {product.harga_diskon && (
                        <div style={{ fontSize: '11px', color: '#ff4444', marginTop: '4px' }}>
                          🔥 Diskon {Math.round((1 - product.harga_diskon / product.harga) * 100)}%
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ color: '#00ffaa', fontWeight: 'bold' }}>
                        Rp{product.harga?.toLocaleString()}
                      </div>
                      {product.harga_diskon && (
                        <div style={{ fontSize: '11px', color: '#888', textDecoration: 'line-through' }}>
                          Rp{product.harga_diskon?.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        color: product.stok < 10 ? '#ff4444' : 'white',
                        fontWeight: product.stok < 10 ? 'bold' : 'normal',
                        background: product.stok < 10 ? 'rgba(255,68,68,0.1)' : 'transparent',
                        padding: '4px 8px',
                        borderRadius: '20px'
                      }}>
                        {product.stok} pcs
                      </span>
                      {product.stok < 10 && product.stok > 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#ffaa00' }}>⚠️ Stok Menipis</span>
                      )}
                      {product.stok === 0 && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', color: '#ff4444' }}>❌ Habis</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: 'white' }}>
                      {product.total_terjual || 0} pcs
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Link 
                        to={`/admin/products/edit/${product.id_produk}`} 
                        style={{ 
                          color: '#00d4ff', 
                          textDecoration: 'none',
                          marginRight: '15px',
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0,212,255,0.1)'
                        }}
                      >
                        ✏️ Edit
                      </Link>
                      <button 
                        onClick={() => deleteProduct(product.id_produk, product.nama_produk)}
                        style={{
                          background: 'rgba(255,68,68,0.1)',
                          border: 'none',
                          color: '#ff6666',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          marginLeft: '5px'
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '20px', padding: '12px', background: '#1a1a2e', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
            <span>Total produk: {filteredProducts.length} dari {products.length}</span>
            <span>Menampilkan {filteredProducts.length} produk</span>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProducts;
