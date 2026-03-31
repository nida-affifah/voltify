import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5555/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
      } else {
        setError(data.message || 'Registrasi gagal')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Daftar Voltify</h1>
      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="text" name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="tel" name="phone" placeholder="Nomor HP" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#ee4d2d', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Memuat...' : 'Daftar'}
        </button>
      </form>
    </div>
  )
}

export default Register