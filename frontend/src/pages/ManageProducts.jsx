// src/pages/ManageProducts.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tokos, setTokos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    id_toko: '',
    id_kategori: '',
    nama_produk: '',
    harga: '',
    stok: '',
    deskripsi: '',
    gambar_utama: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setUserRole(user.role);
    if (!token) {
      navigate('/login');
      return;
    }
    // Super Admin dan Admin bisa akses
    if (!['super_admin', 'admin'].includes(user.role)) {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, tokosRes] = await Promise.all([
        fetch('http://localhost:5555/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()),
        fetch('http://localhost:5555/api/categories').then(r => r.json()),
        fetch('http://localhost:5555/api/toko', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
      ]);
      setProducts(productsRes.products || []);
      setCategories(categoriesRes.categories || []);
      setTokos(tokosRes.toko || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5555/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Produk berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Gagal menambah produk');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menambah produk');
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5555/api/products/${editingProduct.id_produk}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Produk berhasil diupdate');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert(data.message || 'Gagal update produk');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal update produk');
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (window.confirm(`Yakin ingin menghapus produk "${productName}"?`)) {
      try {
        const res = await fetch(`http://localhost:5555/api/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          alert('Produk berhasil dihapus');
          fetchData();
        } else {
          alert(data.message || 'Gagal menghapus produk');
        }
      } catch (error) {
        console.error(error);
        alert('Gagal menghapus produk');
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      id_toko: product.id_toko,
      id_kategori: product.id_kategori,
      nama_produk: product.nama_produk,
      harga: product.harga,
      stok: product.stok,
      deskripsi: product.deskripsi,
      gambar_utama: product.gambar_utama
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_toko: '',
      id_kategori: '',
      nama_produk: '',
      harga: '',
      stok: '',
      deskripsi: '',
      gambar_utama: ''
    });
    setEditingProduct(null);
  };

  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin';

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1>Manajemen Produk</h1>
          <p style={{ fontSize: 14, color: '#888' }}>
            Role: <strong style={{ color: isSuperAdmin ? '#f44336' : '#ff9800' }}>{isSuperAdmin ? 'Super Admin (Full Access)' : 'Admin (Full Access)'}</strong>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          + Tambah Produk
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', background: '#1e1e2a' }}>
              <th style={{ padding: 12 }}>ID</th>
              <th style={{ padding: 12 }}>Nama Produk</th>
              <th style={{ padding: 12 }}>Harga</th>
              <th style={{ padding: 12 }}>Stok</th>
              <th style={{ padding: 12 }}>Kategori</th>
              <th style={{ padding: 12 }}>Toko</th>
              <th style={{ padding: 12 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id_produk} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: 12 }}>{product.id_produk}</td>
                <td style={{ padding: 12 }}>{product.nama_produk}</td>
                <td style={{ padding: 12 }}>Rp {parseInt(product.harga).toLocaleString()}</td>
                <td style={{ padding: 12 }}>{product.stok}</td>
                <td style={{ padding: 12 }}>{product.nama_kategori || '-'}</td>
                <td style={{ padding: 12 }}>{product.nama_toko || '-'}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditModal(product)} style={{ background: '#ff9800', color: 'white', padding: '5px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteProduct(product.id_produk, product.nama_produk)} style={{ background: '#f44336', color: 'white', padding: '5px 12px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e1e2a', padding: 24, borderRadius: 12, width: '90%', maxWidth: 500, border: '1px solid #00d4ff' }}>
            <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <form onSubmit={editingProduct ? updateProduct : createProduct}>
              <div style={{ marginBottom: 15 }}>
                <label>Nama Produk *</label>
                <input type="text" value={formData.nama_produk} onChange={(e) => setFormData({...formData, nama_produk: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} required />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>Toko *</label>
                <select value={formData.id_toko} onChange={(e) => setFormData({...formData, id_toko: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} required>
                  <option value="">Pilih Toko</option>
                  {tokos.map(toko => <option key={toko.id_toko} value={toko.id_toko}>{toko.nama_toko}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>Kategori *</label>
                <select value={formData.id_kategori} onChange={(e) => setFormData({...formData, id_kategori: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} required>
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>Harga *</label>
                <input type="number" value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} required />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>Stok *</label>
                <input type="number" value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} required />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>Deskripsi</label>
                <textarea value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} rows="3" style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label>URL Gambar</label>
                <input type="text" value={formData.gambar_utama} onChange={(e) => setFormData({...formData, gambar_utama: e.target.value})} style={{ width: '100%', padding: 8, background: '#2a2a3a', border: '1px solid #333', borderRadius: 4, color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ background: '#666', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ background: '#4caf50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{editingProduct ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
