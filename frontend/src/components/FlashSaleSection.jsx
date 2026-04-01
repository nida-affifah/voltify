import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FlashSaleSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [startTime, setStartTime] = useState(null);
  const [status, setStatus] = useState('upcoming');
  const [notificationSent, setNotificationSent] = useState(false);
  const [audio] = useState(new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'));

  useEffect(() => {
    fetchFlashSale();
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const playAlarm = () => {
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const sendNotification = () => {
    if (!notificationSent && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⚡ FLASH SALE DIMULAI!', {
        body: 'Flash sale sudah dimulai! Buruan beli sebelum kehabisan!',
        icon: 'https://img.icons8.com/color/96/flash.png',
        badge: 'https://img.icons8.com/color/48/flash.png',
        vibrate: [200, 100, 200],
        silent: false
      });
      setNotificationSent(true);
    }
  };

  const fetchFlashSale = async () => {
    try {
      const response = await fetch('http://localhost:5555/api/produk/flash-sale');
      const data = await response.json();
      console.log('Flash sale data:', data);

      if (data.success && data.produk && data.produk.length > 0) {
        setProducts(data.produk);
        
        if (data.start_time) {
          const start = new Date(data.start_time);
          setStartTime(start);
          startTimer(start);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching flash sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (start) => {
    const updateTimer = () => {
      const now = new Date();
      const distance = start.getTime() - now.getTime();
      
      if (distance <= 0) {
        if (status !== 'active') {
          setStatus('active');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          playAlarm();
          sendNotification();
          fetchFlashSale();
        }
        return;
      }
      
      setStatus('upcoming');
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      console.log(`Sisa: ${days} hari ${hours} jam ${minutes} menit ${seconds} detik`);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        background: '#1a1a2e',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ color: '#888' }}>⏳ Memuat Flash Sale...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 6);

  return (
    <div style={{
      background: status === 'active' 
        ? 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)'
        : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
      border: status === 'active' 
        ? '2px solid #ffaa00'
        : '1px solid rgba(255,68,68,0.3)',
      animation: status === 'active' ? 'pulse 1s infinite' : 'none'
    }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,68,68,0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,68,68,0); }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: status === 'active' ? '#ffaa00' : '#ff4444',
            width: '8px',
            height: '40px',
            borderRadius: '4px'
          }} />
          <div>
            <h2 style={{
              color: status === 'active' ? '#ffaa00' : '#ff4444',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0
            }}>
              ⚡ FLASH SALE {status === 'active' && '🔥 SEDANG BERLANGSUNG! 🔥'}
            </h2>
            <p style={{
              color: status === 'active' ? '#fff' : '#888',
              fontSize: '11px',
              margin: '4px 0 0 0'
            }}>
              {status === 'upcoming' && startTime && `Dimulai ${formatDate(startTime)}`}
              {status === 'active' && '🚀 Buruan! Stok terbatas! 🚀'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.6)',
          padding: '8px 20px',
          borderRadius: '50px'
        }}>
          <span style={{ color: '#fff', fontSize: '13px' }}>
            {status === 'active' ? '🔥 BERAKHIR DALAM:' : '🎯 DIMULAI DALAM:'}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {status === 'upcoming' && timeLeft.days > 0 && (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: '#ff4444',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    minWidth: '70px',
                    fontFamily: 'monospace'
                  }}>
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <span style={{ fontSize: '10px', color: 'white' }}>Hari</span>
                </div>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4444' }}>:</span>
              </>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#2a2a3a',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: status === 'active' ? '#ffaa00' : '#ff4444',
                minWidth: '60px',
                fontFamily: 'monospace'
              }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '10px', color: '#888' }}>Jam</span>
            </div>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4444' }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#2a2a3a',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: status === 'active' ? '#ffaa00' : '#ff4444',
                minWidth: '60px',
                fontFamily: 'monospace'
              }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '10px', color: '#888' }}>Menit</span>
            </div>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4444' }}>:</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: '#2a2a3a',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '28px',
                fontWeight: 'bold',
                color: status === 'active' ? '#ffaa00' : '#ff4444',
                minWidth: '60px',
                fontFamily: 'monospace'
              }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '10px', color: '#888' }}>Detik</span>
            </div>
          </div>
        </div>

        <Link to="/flash-sale" style={{
          background: status === 'active' ? '#ffaa00' : '#ff4444',
          color: 'white',
          padding: '10px 24px',
          borderRadius: '30px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {status === 'active' ? '🔥 Beli Sekarang 🔥' : 'Lihat Semua →'}
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {displayProducts.map(product => {
          const originalPrice = parseFloat(product.harga) || 0;
          const flashPrice = parseFloat(product.harga_flash_sale) || 0;
          const discount = originalPrice > 0 ? Math.round((1 - flashPrice / originalPrice) * 100) : 0;

          return (
            <Link key={product.id_produk} to={`/product/${product.id_produk}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#1a1a2e',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.3s',
                border: status === 'active' ? '2px solid #ffaa00' : '1px solid rgba(255,68,68,0.3)',
                cursor: 'pointer'
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: status === 'active' ? '#ffaa00' : '#ff4444',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}>
                    ⚡ -{discount}%
                  </div>
                  <div style={{
                    background: '#0f0f1a',
                    padding: '20px',
                    textAlign: 'center',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={product.gambar_utama || 'https://placehold.co/200x200/1a1a2e/ff4444?text=FLASH'}
                      alt={product.nama_produk}
                      style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    minHeight: '36px'
                  }}>
                    {product.nama_produk}
                  </h3>
                  <div>
                    <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '16px' }}>
                      Rp{Math.round(flashPrice).toLocaleString('id-ID')}
                    </span>
                    <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '11px', marginLeft: '8px' }}>
                      Rp{Math.round(originalPrice).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#888', marginTop: '8px' }}>
                    🏪 {product.nama_toko}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default FlashSaleSection;
