import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FlashSaleSection from '../components/FlashSaleSection';

// ProductCard component di dalam file yang sama (agar tidak perlu import)
function ProductCard({ product }) {
  const discount = product.harga_diskon && product.harga_diskon < product.harga 
    ? Math.round((1 - product.harga_diskon / product.harga) * 100) 
    : 0
  const finalPrice = product.harga_diskon || product.harga

  return (
    <Link to={`/product/${product.id_produk}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'rgba(17,24,39,0.6)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        border: '1px solid rgba(0,212,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#1a1a2e',
          padding: '20px',
          height: '160px'
        }}>
          <span style={{ fontSize: '50px' }}>📦</span>
        </div>
        {discount > 0 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: '#ff6b6b',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            -{discount}%
          </div>
        )}
        <div style={{ padding: '12px' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '6px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '36px',
            color: 'white'
          }}>
            {product.nama_produk}
          </h3>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#00ffaa', fontWeight: 'bold', fontSize: '15px' }}>
              Rp{Number(finalPrice).toLocaleString('id-ID')}
            </span>
            {product.harga_diskon && (
              <span style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginLeft: '6px' }}>
                Rp{Number(product.harga).toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
            ⭐ {product.rating_avg || 0} • Terjual {product.total_terjual || 0}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            {product.nama_toko}
          </div>
        </div>
      </div>
    </Link>
  )
}

function Home() {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSlide, setActiveSlide] = useState(0)

  const banners = [
    { id: 1, title: 'MEGA FLASH SALE', subtitle: 'Diskon hingga 70% + Cashback 10%', description: 'Terbatas! Hanya 24 jam ke depan', bg: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', icon: '⚡', button: 'Ambil Diskon →', badge: 'HOT DEAL' },
    { id: 2, title: 'FREE SHIPPING', subtitle: 'Gratis Ongkir Seluruh Indonesia', description: 'Minimal belanja Rp50.000', bg: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)', icon: '🚚', button: 'Klaim Voucher →', badge: 'PROMO TERBARU' },
    { id: 3, title: 'WELCOME BONUS', subtitle: 'Member Baru Dapat Voucher', description: 'Voucher Rp50.000 + Diskon 20%', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🎁', button: 'Daftar Sekarang →', badge: 'NEW MEMBER' }
  ]

  const services = [
    { icon: '🚚', title: 'Gratis Ongkir', desc: 'Min. Belanja Rp50rb' },
    { icon: '💰', title: 'Cashback 10%', desc: 'Setiap Pembelian' },
    { icon: '✅', title: 'Garansi Resmi', desc: 'Produk Original' },
    { icon: '🔄', title: 'Return 14 Hari', desc: 'Garansi Pengembalian' }
  ]

  const stats = [
    { number: '500+', label: 'Produk' },
    { number: '10K+', label: 'Pelanggan' },
    { number: '4.8', label: 'Rating' }
  ]

  {/* Services */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
  {/* ... services content ... */}
</div>

{/* Flash Sale Section - TAMBAHKAN INI */}
<FlashSaleSection />

{/* Stats */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
  {/* ... stats content ... */}
</div>

  const categoryIcons = {
    'Smartphone': '📱', 'Laptop & Komputer': '💻', 'Tablet': '📟',
    'TV & Home Theater': '📺', 'Audio': '🎧', 'Kulkas': '🧊',
    'Mesin Cuci': '🧺', 'AC': '❄️', 'Gaming': '🎮', 'Aksesoris': '🔌'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, featuredRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5555/api/products').then(r => r.json()),
          fetch('http://localhost:5555/api/produk?is_featured=true').then(r => r.json()),
          fetch('http://localhost:5555/api/categories').then(r => r.json())
        ])
        setProducts(productsRes.products || [])
        setFeaturedProducts(featuredRes.produk || [])
        setCategories(categoriesRes.categories || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,212,255,0.2)', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
      {/* Hero Banner */}
      <div style={{ background: banners[activeSlide].bg, borderRadius: '24px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '500px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', marginBottom: '12px' }}>🔥 {banners[activeSlide].badge}</div>
          <h2 style={{ fontSize: '32px', marginBottom: '12px', color: 'white' }}>{banners[activeSlide].icon} {banners[activeSlide].title}</h2>
          <p style={{ fontSize: '16px', marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>{banners[activeSlide].subtitle}</p>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>{banners[activeSlide].description}</p>
          <Link to={activeSlide === 2 ? "/register" : "/products"} style={{ background: 'white', color: '#ee4d2d', padding: '12px 28px', borderRadius: '40px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold' }}>{banners[activeSlide].button}</Link>
        </div>
        <div style={{ position: 'absolute', right: '20px', bottom: '20px', fontSize: '100px', opacity: 0.1 }}>{banners[activeSlide].icon}</div>
      </div>

      {/* Carousel Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
        {banners.map((_, idx) => (
          <button key={idx} onClick={() => setActiveSlide(idx)} style={{ width: activeSlide === idx ? '30px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: activeSlide === idx ? '#00d4ff' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Services */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {services.map((service, idx) => (
          <div key={idx} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{service.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{service.title}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{service.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: '20px', padding: '24px', textAlign: 'center', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #00d4ff, #00ffaa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{stat.number}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div style={{ background: 'rgba(17,24,39,0.4)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>📱 Kategori Populer</h3>
          <Link to="/categories" style={{ color: '#00d4ff', fontSize: '13px', textDecoration: 'none' }}>Lihat Semua →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '16px' }}>
          {categories.slice(0, 8).map(cat => (
            <Link key={cat.id_kategori} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{categoryIcons[cat.nama_kategori] || '📦'}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>{cat.nama_kategori}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>🔥 Rekomendasi Untukmu</h3>
          <Link to="/products" style={{ color: '#00d4ff', fontSize: '13px', textDecoration: 'none' }}>Lihat Semua →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
          {featuredProducts.slice(0, 10).map(product => (
            <ProductCard key={product.id_produk} product={product} />
          ))}
        </div>
      </div>

      {/* Semua Produk */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>📦 Semua Produk</h3>
          <Link to="/products" style={{ color: '#00d4ff', fontSize: '13px', textDecoration: 'none' }}>Lihat Semua →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
          {products.slice(0, 15).map(product => (
            <ProductCard key={product.id_produk} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @media (max-width: 1024px) { 
          div[style*="grid-template-columns: repeat(5, 1fr)"] { 
            grid-template-columns: repeat(3, 1fr) !important; 
          } 
        }
        @media (max-width: 768px) { 
          div[style*="grid-template-columns: repeat(5, 1fr)"] { 
            grid-template-columns: repeat(2, 1fr) !important; 
          } 
        }
        @media (max-width: 480px) { 
          div[style*="grid-template-columns: repeat(5, 1fr)"] { 
            grid-template-columns: repeat(1, 1fr) !important; 
          } 
        }
        div:hover { 
          transform: translateY(-5px); 
        }
      `}</style>
    </div>
  )
}

export default Home