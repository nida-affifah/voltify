import React from 'react'
import { useParams } from 'react-router-dom'

function ProductDetail() {
  const { id } = useParams()
  return <div style={{ padding: '20px' }}><h1>Detail Produk #{id}</h1></div>
}
export default ProductDetail