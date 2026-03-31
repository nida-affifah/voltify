import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }

    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 50)
    })

    return () => window.removeEventListener('scroll', () => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Beranda' },
    { path: '/products', icon: '📦', label: 'Produk' },
    { path: '/flash-sale', icon: '⚡', label: 'Flash Sale' },
    { path: '/live', icon: '📺', label: 'Live' },
    { path: '/feed', icon: '📰', label: 'Feed' },
    { path: '/seller', icon: '🏪', label: 'Jadi Penjual' }
  ]

  return (
    <header style={{
      background: scrolled ? 'rgba(10, 15, 26, 0.98)' : 'rgba(10, 15, 26, 0.85)',
      backdropFilter: 'blur(15px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s',
      borderBottom: '1px solid rgba(0,212,255,0.2)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo - Voltify Tampil Jelas */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,212,255,0.4)'
          }}>
            <span style={{ fontSize: '22px' }}>⚡</span>
          </div>
          <div>
            <span style={{
              fontSize: '26px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.5px'
            }}>Voltify</span>
            <span style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              marginLeft: '4px',
              display: 'block'
            }}>Electronics Hub</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '480px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '44px',
            padding: '4px 4px 4px 20px',
            border: '1px solid rgba(0,212,255,0.3)',
            transition: 'all 0.3s'
          }}>
            <input
              type="text"
              placeholder="Cari produk, toko, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '14px',
                padding: '11px 0'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
                color: '#0a0f1a',
                border: 'none',
                padding: '9px 28px',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              🔍 Cari
            </button>
          </div>
        </form>

        {/* User Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isLoggedIn ? (
            <>
              <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: '500' }}>
                👋 {user?.name?.split(' ')[0] || 'User'}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  setIsLoggedIn(false)
                  navigate('/')
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,212,255,0.5)',
                  color: '#00d4ff',
                  padding: '7px 18px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0,212,255,0.1)'
                  e.target.style.boxShadow = '0 0 10px rgba(0,212,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.boxShadow = 'none'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" style={{
                color: '#00d4ff',
                textDecoration: 'none',
                fontSize: '14px',
                padding: '7px 18px',
                borderRadius: '30px',
                border: '1px solid rgba(0,212,255,0.5)',
                transition: 'all 0.3s',
                fontWeight: '500'
              }}>
                Masuk
              </Link>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #00d4ff, #00ffaa)',
                color: '#0a0f1a',
                padding: '7px 18px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        borderTop: '1px solid rgba(0,212,255,0.15)',
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '12px 20px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#00ffaa' : 'rgba(255,255,255,0.7)',
                fontSize: '14px',
                fontWeight: location.pathname === item.path ? '600' : '400',
                borderBottom: location.pathname === item.path ? '2px solid #00ffaa' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header