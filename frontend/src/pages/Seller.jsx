import React from 'react'
import { Link } from 'react-router-dom'

function Seller() {
  const isLoggedIn = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Jika sudah login sebagai seller
  if (isLoggedIn && user.role === 'seller') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1>Dashboard Penjual</h1>
        <p>Selamat datang, {user.name}!</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📦 Kelola Produk</h3>
            <p>Tambah, edit, atau hapus produk Anda</p>
            <Link to="/seller/products" style={{ color: '#ee4d2d' }}>Kelola →</Link>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📋 Pesanan</h3>
            <p>Lihat dan kelola pesanan masuk</p>
            <Link to="/seller/orders" style={{ color: '#ee4d2d' }}>Lihat →</Link>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h3>📊 Statistik Toko</h3>
            <p>Lihat performa toko Anda</p>
            <Link to="/seller/stats" style={{ color: '#ee4d2d' }}>Lihat →</Link>
          </div>
        </div>
      </div>
    )
  }

  // Jika sudah login tapi bukan seller
  if (isLoggedIn && user.role !== 'seller') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h1>Jadi Penjual di Voltify</h1>
        <p>Akun Anda saat ini adalah pembeli. Ingin menjadi penjual?</p>
        <button 
          onClick={() => alert('Fitur upgrade akun sedang dalam pengembangan')}
          style={{ background: '#ee4d2d', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}
        >
          Upgrade ke Akun Penjual
        </button>
      </div>
    )
  }

  // Belum login
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
      <h1>Jadi Penjual di Voltify</h1>
      <p>Daftar sekarang untuk membuka toko dan jualan di Voltify!</p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '30px' }}>
        <Link to="/login" style={{ background: '#ee4d2d', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
          Masuk
        </Link>
        <Link to="/register" style={{ border: '1px solid #ee4d2d', color: '#ee4d2d', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
          Daftar
        </Link>
      </div>
      <div style={{ marginTop: '40px', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h3>Keuntungan Jadi Penjual:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>💰 Jangkau jutaan pembeli</li>
          <li>📦 Fitur manajemen produk lengkap</li>
          <li>📊 Statistik penjualan real-time</li>
          <li>💬 Fitur chat dengan pembeli</li>
          <li>📺 Live streaming untuk promosi</li>
        </ul>
      </div>
    </div>
  )
}

export default Seller