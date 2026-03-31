import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      marginTop: '60px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(238,77,45,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'rotateSlow 20s linear infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(0,178,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'rotateSlow 15s linear infinite reverse'
      }} />
      
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '48px 20px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Tentang Voltify */}
          <div className="slide-left" style={{ animationDelay: '0.1s' }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '20px',
              position: 'relative',
              display: 'inline-block'
            }}>
              Tentang Voltify
              <span style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: '#ee4d2d',
                borderRadius: '2px'
              }} />
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/about" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Tentang Kami
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/careers" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Karir
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/blog" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Blog
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/press" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan */}
          <div className="slide-left" style={{ animationDelay: '0.2s' }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '20px',
              position: 'relative',
              display: 'inline-block'
            }}>
              Bantuan
              <span style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: '#ee4d2d',
                borderRadius: '2px'
              }} />
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/help" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Pusat Bantuan
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/how-to-shop" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Cara Belanja
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/returns" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Pengembalian Barang
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/contact" style={{ color: '#ccc', textDecoration: 'none', fontSize: '14px', transition: 'color 0.3s' }}>
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Metode Pembayaran */}
          <div className="slide-right" style={{ animationDelay: '0.2s' }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '20px',
              position: 'relative',
              display: 'inline-block'
            }}>
              Metode Pembayaran
              <span style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: '#ee4d2d',
                borderRadius: '2px'
              }} />
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ fontSize: '32px', color: '#ccc', transition: 'transform 0.3s' }} className="payment-icon">💳</div>
              <div style={{ fontSize: '32px', color: '#ccc', transition: 'transform 0.3s' }} className="payment-icon">🏦</div>
              <div style={{ fontSize: '32px', color: '#ccc', transition: 'transform 0.3s' }} className="payment-icon">📱</div>
              <div style={{ fontSize: '32px', color: '#ccc', transition: 'transform 0.3s' }} className="payment-icon">💵</div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <img src="https://via.placeholder.com/200x40?text=Payment+Methods" alt="Payment" style={{ maxWidth: '100%', opacity: 0.7 }} />
            </div>
          </div>

          {/* Ikuti Kami */}
          <div className="slide-right" style={{ animationDelay: '0.3s' }}>
            <h3 style={{
              fontSize: '18px',
              marginBottom: '20px',
              position: 'relative',
              display: 'inline-block'
            }}>
              Ikuti Kami
              <span style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '40px',
                height: '3px',
                background: '#ee4d2d',
                borderRadius: '2px'
              }} />
            </h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#" style={{ color: '#ccc', fontSize: '28px', transition: 'all 0.3s' }} className="social-icon">📷</a>
              <a href="#" style={{ color: '#ccc', fontSize: '28px', transition: 'all 0.3s' }} className="social-icon">🎵</a>
              <a href="#" style={{ color: '#ccc', fontSize: '28px', transition: 'all 0.3s' }} className="social-icon">📘</a>
              <a href="#" style={{ color: '#ccc', fontSize: '28px', transition: 'all 0.3s' }} className="social-icon">▶️</a>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '12px', color: '#888' }}>Download Aplikasi Voltify</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <img src="https://via.placeholder.com/100x30?text=App+Store" alt="App Store" style={{ height: '30px' }} />
                <img src="https://via.placeholder.com/100x30?text=Play+Store" alt="Play Store" style={{ height: '30px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#888'
        }}>
          <p>© 2026 Voltify. Hak Cipta Dilindungi.</p>
          <p style={{ marginTop: '8px' }}>Jl. Teknologi No. 123, Jakarta Selatan | cs@voltify.com | 0804-1-555-555</p>
        </div>
      </div>

      <style>{`
        .payment-icon:hover, .social-icon:hover {
          transform: translateY(-5px) scale(1.1);
          color: #ee4d2d !important;
        }
        
        footer a:hover {
          color: #ee4d2d !important;
        }
        
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  )
}

export default Footer