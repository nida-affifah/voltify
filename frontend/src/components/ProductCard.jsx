// src/components/ProductCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'

// Mapping gambar berdasarkan ID produk ke nama file yang tersedia
const productImages = {
  22: '/images/products/xiaomi_redmi_note13_pro.jpg',
  // Tambahkan mapping lainnya jika punya gambar
  // 1: '/images/products/samsung_s24.jpg',
  // 5: '/images/products/iphone_15.jpg',
  // dst...
}

// Gambar default jika tidak ada mapping
const defaultImage = (productName) => {
  return `https://placehold.co/400x400/1a1a2e/00d4ff?text=${encodeURIComponent(productName?.substring(0, 15) || 'Product')}`
}

function ProductCard({ product }) {
  const discount = product.harga_diskon && product.harga_diskon < product.harga 
    ? Math.round((1 - product.harga_diskon / product.harga) * 100) 
    : 0
  const finalPrice = product.harga_diskon || product.harga
  
  // Ambil gambar dari mapping, jika tidak ada pakai default
  const imageUrl = productImages[product.id_produk] || defaultImage(product.nama_produk)

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
          height: '180px'
        }}>
          <img
            src={imageUrl}
            alt={product.nama_produk}
            style={{
              maxWidth: '100%',
              maxHeight: '140px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.src = defaultImage(product.nama_produk)
            }}
          />
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

export default ProductCard