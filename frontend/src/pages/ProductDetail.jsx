// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchProduct()
    if (token) checkWishlist()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5555/api/products/${id}`)
      const data = await res.json()
      if (data.success) {
        setProduct(data.product)
        setActiveImage(data.product.gambar_utama || '')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:5555/api/wishlist/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setIsInWishlist(data.inWishlist || false)
    } catch (error) {
      console.error(error)
    }
  }

  const addToCart = async () => {
    if (!token) {
      if (window.confirm('Silakan login terlebih dahulu. Login sekarang?')) {
        navigate('/login')
      }
      return
    }
    
    setAdding(true)
    try {
      const res = await fetch('http://localhost:5555/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_produk: parseInt(id),
          jumlah: quantity
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${product?.nama_produk} (${quantity} item) ditambahkan ke keranjang!`)
      } else {
        alert(data.message || 'Gagal menambahkan ke keranjang')
      }
    } catch (error) {
      console.error(error)
      alert('Gagal menambahkan ke keranjang')
    } finally {
      setAdding(false)
    }
  }

  const buyNow = async () => {
    if (!token) {
      if (window.confirm('Silakan login terlebih dahulu. Login sekarang?')) {
        navigate('/login')
      }
      return
    }
    
    // Tambahkan ke keranjang dulu, lalu redirect ke checkout
    try {
      const res = await fetch('http://localhost:5555/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_produk: parseInt(id),
          jumlah: quantity
        })
      })
      const data = await res.json()
      if (data.success) {
        navigate('/checkout')
      } else {
        alert(data.message || 'Gagal melanjutkan ke checkout')
      }
    } catch (error) {
      console.error(error)
      alert('Gagal melanjutkan ke checkout')
    }
  }

  const toggleWishlist = async () => {
    if (!token) {
      if (window.confirm('Silakan login terlebih dahulu. Login sekarang?')) {
        navigate('/login')
      }
      return
    }
    
    try {
      const res = await fetch('http://localhost:5555/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id_produk: parseInt(id) })
      })
      const data = await res.json()
      if (data.success) {
        setIsInWishlist(!isInWishlist)
        alert(isInWishlist ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist')
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Loading...</div>
  if (!product) return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Produk tidak ditemukan</div>

  const isSeller = user.role === 'seller' && product.id_toko === user.store_id
  const finalPrice = product.harga_diskon || product.harga
  const discount = product.harga_diskon ? Math.round((1 - product.harga_diskon / product.harga) * 100) : 0

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', color: 'white' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#888' }}>
        <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Beranda</Link> {'>'}
        <Link to="/products" style={{ color: '#888', textDecoration: 'none', marginLeft: '5px' }}>Produk</Link> {'>'}
        <span style={{ color: '#00d4ff', marginLeft: '5px' }}>{product.nama_produk}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        {/* Gambar Produk */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(0,212,255,0.2)'
          }}>
            <img
              src={activeImage || product.gambar_utama || 'https://placehold.co/400x400/1a1a2e/00d4ff?text=No+Image'}
              alt={product.nama_produk}
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Info Produk */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>{product.nama_produk}</h1>
          
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ background: '#ff9800', padding: '4px 8px', borderRadius: '8px', fontSize: '14px' }}>
              ⭐ {product.rating_avg || 0}/5
            </span>
            <span style={{ color: '#888' }}>| Terjual {product.total_terjual || 0}</span>
            <span style={{ color: '#888' }}>| Stok: {product.stok > 0 ? `${product.stok} pcs` : 'Habis'}</span>
          </div>

          {/* Harga */}
          <div style={{ marginBottom: '20px' }}>
            {discount > 0 && (
              <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '18px', marginRight: '12px' }}>
                Rp{Number(product.harga).toLocaleString('id-ID')}
              </span>
            )}
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#00ffaa' }}>
              Rp{Number(finalPrice).toLocaleString('id-ID')}
            </span>
            {discount > 0 && (
              <span style={{ background: '#ff6b6b', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', marginLeft: '12px' }}>
                Hemat {discount}%
              </span>
            )}
          </div>

          {/* Pilih Jumlah */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Jumlah:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{
                  background: '#2a2a3a',
                  border: '1px solid #333',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                }}
              >-</button>
              <span style={{ fontSize: '18px', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stok, quantity + 1))}
                disabled={quantity >= product.stok}
                style={{
                  background: '#2a2a3a',
                  border: '1px solid #333',
                  color: 'white',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  cursor: quantity >= product.stok ? 'not-allowed' : 'pointer'
                }}
              >+</button>
              <span style={{ color: '#888', fontSize: '14px' }}>Tersisa {product.stok} pcs</span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <button
              onClick={addToCart}
              disabled={adding || product.stok <= 0}
              style={{
                flex: 1,
                background: product.stok <= 0 ? '#555' : '#00d4ff',
                color: product.stok <= 0 ? '#999' : '#1a1a2e',
                border: 'none',
                padding: '14px 24px',
                borderRadius: '12px',
                cursor: product.stok <= 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {adding ? '⏳ Menambah...' : product.stok <= 0 ? '❌ Stok Habis' : '🛒 Tambah ke Keranjang'}
            </button>
            
            {product.stok > 0 && (
              <button 
  onClick={async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login terlebih dahulu');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch('http://localhost:5555/api/orders/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_produk: product.id_produk,
          jumlah: quantity || 1,
          alamat_pengiriman: "Jl. Contoh Alamat No.123",
          metode_pembayaran: "transfer"
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Pesanan berhasil dibuat!');
        window.location.href = '/orders';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal membuat pesanan');
    }
  }}
  className="btn-buy"
>
  💰 Beli Sekarang
</button>
            )}
            
            <button
              onClick={toggleWishlist}
              style={{
                background: isInWishlist ? '#f44336' : '#2a2a3a',
                color: 'white',
                border: '1px solid #333',
                padding: '14px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              {isInWishlist ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Deskripsi */}
          <div style={{
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '20px',
            border: '1px solid rgba(0,212,255,0.1)'
          }}>
            <h3>Deskripsi Produk</h3>
            <p style={{ color: '#ccc', lineHeight: 1.6, marginTop: '10px' }}>
              {product.deskripsi || 'Tidak ada deskripsi untuk produk ini.'}
            </p>
          </div>

          {/* Info Toko */}
          <div style={{
            background: '#1a1a2e',
            padding: '20px',
            borderRadius: '12px',
            marginTop: '20px',
            border: '1px solid rgba(0,212,255,0.1)'
          }}>
            <h3>Informasi Toko</h3>
            <p><strong>{product.nama_toko || 'Toko Official'}</strong></p>
            <Link to={`/toko/${product.id_toko}`} style={{ color: '#00d4ff', textDecoration: 'none' }}>
              Kunjungi Toko →
            </Link>
          </div>

          {/* Edit Product (khusus seller) */}
          {isSeller && (
            <Link to={`/toko/products/edit/${product.id_produk}`}>
              <button style={{
                marginTop: '20px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                ✏️ Edit Produk
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
