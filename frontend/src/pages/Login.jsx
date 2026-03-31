import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5555/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
      } else {
        setError(data.message || 'Login gagal')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Pastikan backend berjalan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Masuk ke Voltify</h1>
      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px' }} />
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#ee4d2d', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Memuat...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}

export default Login