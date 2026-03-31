import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

function Products() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 20,
          ...(filter.search && { search: filter.search }),
          ...(filter.category && { category: filter.category }),
          sortBy: filter.sortBy,
          sortOrder: filter.sortOrder
        })
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`http://localhost:5555/api/products?${params}`).then(r => r.json()),
          fetch('http://localhost:5555/api/categories').then(r => r.json())
        ])
        setProducts(productsRes.products || [])
        setTotalPages(productsRes.pagination?.totalPages || 1)
        setCategories(categoriesRes.categories || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [currentPage, filter])

  const handleFilterChange = (newFilter) => {
    setFilter({ ...filter, ...newFilter })
    setCurrentPage(1)
  }

  const sortOptions = [
    { label: 'Terbaru', value: 'created_at', order: 'DESC' },
    { label: 'Terlaris', value: 'total_terjual', order: 'DESC' },
    { label: 'Rating Tertinggi', value: 'rating_avg', order: 'DESC' },
    { label: 'Harga Terendah', value: 'harga_diskon', order: 'ASC' },
    { label: 'Harga Tertinggi', value: 'harga_diskon', order: 'DESC' }
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid rgba(0,212,255,0.2)', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>📦 Semua Produk</h1>
      
      {/* Filter Bar */}
      <div style={{ background: 'rgba(17,24,39,0.4)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cari produk..."
            value={filter.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', padding: '10px 16px', color: 'white', minWidth: '200px' }}
          />
          <select
            value={filter.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', padding: '10px 16px', color: 'white' }}
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id_kategori} value={cat.slug}>{cat.nama_kategori}</option>
            ))}
          </select>
          <select
            value={`${filter.sortBy}_${filter.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_')
              handleFilterChange({ sortBy, sortOrder })
            }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', padding: '10px 16px', color: 'white' }}
          >
            {sortOptions.map(opt => (
              <option key={opt.label} value={`${opt.value}_${opt.order}`}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'white' }}>
          <p>Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
            {products.map(product => (
              <ProductCard key={product.id_produk} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
              >
                ← Sebelumnya
              </button>
              <span style={{ padding: '8px 16px', color: 'white' }}>Halaman {currentPage} dari {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 1024px) { div[style*="grid-template-columns: repeat(5, 1fr)"] { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { div[style*="grid-template-columns: repeat(5, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { div[style*="grid-template-columns: repeat(5, 1fr)"] { grid-template-columns: repeat(1, 1fr) !important; } }
      `}</style>
    </div>
  )
}

export default Products
