import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function FlashSale() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    fetch('http://localhost:5555/api/products/flash-sale')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
        
        // Set timer jika ada produk flash sale
        if (data.products && data.products.length > 0 && data.products[0].end_time) {
          updateTimer(data.products[0].end_time)
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
    return <div style={{ textAlign: 'center', padding: '50px' }}>Memuat produk flash sale...</div>
  }

  if (products.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <h1>⚡ Flash Sale</h1>
        <p>Belum ada produk flash sale saat ini.</p>
        <Link to="/products" style={{ color: '#ee4d2d' }}>Lihat produk lainnya →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>⚡ Flash Sale</h1>
        <div style={{ background: 'black', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => {
          const originalPrice = parseFloat(product.harga_normal) || 0
          const flashPrice = parseFloat(product.harga_flash_sale) || 0
          const discount = Math.round((1 - flashPrice / originalPrice) * 100)
          
          return (
            <Link key={product.id_produk} to={`/product/${product.id_produk}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white', transition: 'transform 0.2s' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={product.gambar_utama || 'https://via.placeholder.com/300'} 
                    alt={product.nama_produk}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff4d4f', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    ⚡ -{discount}%
                  </span>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>{product.nama_produk}</h3>
                  <div>
                    <span style={{ color: '#ee4d2d', fontWeight: 'bold', fontSize: '16px' }}>
                      Rp{flashPrice.toLocaleString('id-ID')}
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', marginLeft: '8px' }}>
                      Rp{originalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{product.nama_toko}</p>
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