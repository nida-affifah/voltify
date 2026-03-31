import React from 'react'
import { useParams } from 'react-router-dom'

function OrderDetail() {
  const { id } = useParams()
  return <div style={{ padding: '20px' }}><h1>Detail Pesanan #{id}</h1></div>
}
export default OrderDetail