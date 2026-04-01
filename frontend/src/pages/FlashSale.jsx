import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function FlashSale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Ganti endpoint dari /products/ menjadi /produk/
    fetch('http://localhost:5555/api/produk/flash-sale')
      .then(res => res.json())
      .then(data => {
        console.log('Flash sale data:', data)
        // Sesuaikan dengan struktur response backend
        setProducts(data.produk || [])
        setLoading(false)
        
        // Set timer jika ada produk flash sale
        if (data.produk && data.produk.length > 0 && data.produk[0].end_time) {
          updateTimer(data.produk[0].end_time)
        }
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  const updateTimer = (endTime) => {
    const end = new Date(endTime).getTime()
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = end - now
      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        color: 'white',
        background: '#0f0f1a',
        minHeight: '100vh'
      }}>
        Memuat produk flash sale...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px', 
        textAlign: 'center',
        background: '#0f0f1a',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h1>⚡ Flash Sale</h1>
        <p>Belum ada produk flash sale saat ini.</p>
        <Link to="/products" style={{ color: '#00d4ff' }}>Lihat produk lainnya →</Link>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      background: '#0f0f1a',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ color: 'white' }}>⚡ Flash Sale</h1>
        <div style={{ 
          background: '#1a1a2e', 
          color: '#00d4ff', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          display: 'flex', 
          gap: '8px', 
          fontSize: '20px', 
          fontWeight: 'bold',
          border: '1px solid #00d4ff'
        }}>
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map(product => {
          const originalPrice = parseFloat(product.harga_normal || product.harga) || 0
          const flashPrice = parseFloat(product.harga_flash_sale || product.harga_diskon) || 0
          const discount = originalPrice > 0 ? Math.round((1 - flashPrice / originalPrice) * 100) : 0
          
          return (
            <Link 
              key={product.id_produk} 
              to={`/product/${product.id_produk}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                border: '1px solid rgba(0,212,255,0.2)', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                background: '#1a1a2e', 
                transition: 'transform 0.2s',
                height: '100%'
              }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={product.gambar_utama || 'https://placehold.co/300x300/1a1a2e/00d4ff?text=No+Image'} 
                    alt={product.nama_produk}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <span style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    left: '10px', 
                    background: '#ff4444', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    ⚡ -{discount}%
                  </span>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    marginBottom: '8px',
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.nama_produk}
                  </h3>
                  <div>
                    <span style={{ color: '#00ffaa', fontWeight: 'bold', fontSize: '16px' }}>
                      Rp{Math.round(flashPrice).toLocaleString('id-ID')}
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '12px', marginLeft: '8px' }}>
                      Rp{Math.round(originalPrice).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                    {product.nama_toko || 'Official Store'}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default FlashSale
