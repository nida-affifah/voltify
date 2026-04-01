// src/pages/Products.jsx
import React, { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ search: '', category: '' })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

const fetchProducts = async () => {
  try {
    let url = 'http://localhost:5555/api/produk'  // ← Changed from /products to /produk
    const res = await fetch(url)
    const data = await res.json()
    if (data.success) {
      setProducts(data.produk || [])  // ← Changed from data.products to data.produk
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5555/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchSearch = filter.search === '' || 
      product.nama_produk.toLowerCase().includes(filter.search.toLowerCase())
    const matchCategory = filter.category === '' || 
      product.id_kategori === parseInt(filter.category)
    return matchSearch && matchCategory
  })

  if (loading) {
    return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>Loading produk...</div>
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>Produk Elektronik</h1>
      
      {/* Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari produk..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            background: '#1a1a2e',
            border: '1px solid #00d4ff',
            color: 'white',
            width: '250px'
          }}
        />
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            background: '#1a1a2e',
            border: '1px solid #00d4ff',
            color: 'white'
          }}
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
          ))}
        </select>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>
          Tidak ada produk ditemukan
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id_produk} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products
