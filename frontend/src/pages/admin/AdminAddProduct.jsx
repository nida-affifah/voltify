import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function AdminAddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nama_produk: '',
    harga: '',
    harga_diskon: '',
    stok: '',
    deskripsi: '',
    id_kategori: '',
    gambar_utama: ''
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5555/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5555/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setForm({
          nama_produk: data.product.nama_produk,
          harga: data.product.harga,
          harga_diskon: data.product.harga_diskon || '',
          stok: data.product.stok,
          deskripsi: data.product.deskripsi || '',
          id_kategori: data.product.id_kategori,
          gambar_utama: data.product.gambar_utama || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = id 
        ? `http://localhost:5555/api/admin/products/${id}`
        : 'http://localhost:5555/api/admin/products';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          harga: parseFloat(form.harga),
          harga_diskon: form.harga_diskon ? parseFloat(form.harga_diskon) : null,
          stok: parseInt(form.stok)
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(id ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
        navigate('/admin/products');
      } else {
        alert(data.message || 'Gagal menyimpan produk');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>
        {id ? '✏️ Edit Produk' : '+ Tambah Produk Baru'}
      </h1>

      <form onSubmit={handleSubmit} style={{
        background: '#1a1a2e',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Nama Produk *</label>
          <input
            type="text"
            required
            value={form.nama_produk}
            onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0f0f1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Harga *</label>
            <input
              type="number"
              required
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Harga Diskon</label>
            <input
              type="number"
              value={form.harga_diskon}
              onChange={(e) => setForm({ ...form, harga_diskon: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Stok *</label>
            <input
              type="number"
              required
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Kategori</label>
            <select
              value={form.id_kategori}
              onChange={(e) => setForm({ ...form, id_kategori: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0f0f1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Deskripsi</label>
          <textarea
            rows="5"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              background: '#0f0f1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>URL Gambar</label>
          <input
            type="text"
            value={form.gambar_utama}
            onChange={(e) => setForm({ ...form, gambar_utama: e.target.value })}
            placeholder="https://..."
            style={{
              width: '100%',
              padding: '12px',
              background: '#0f0f1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? '#555' : '#00d4ff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? 'Menyimpan...' : (id ? '💾 Update Produk' : '💾 Simpan Produk')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            style={{
              padding: '14px 24px',
              background: '#2a2a3a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAddProduct;
