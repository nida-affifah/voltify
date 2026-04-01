import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems, selectedProducts, subtotal } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // State untuk ulasan per produk (gunakan object)
  const [reviews, setReviews] = useState({});

  const shippingOptions = [
    { id: 'jne', name: 'JNE Reguler', price: 15000, estimate: '2-3 hari', icon: '🚚' },
    { id: 'jnt', name: 'J&T Express', price: 12000, estimate: '2-3 hari', icon: '📦' },
    { id: 'sicepat', name: 'SiCepat', price: 10000, estimate: '1-2 hari', icon: '⚡' }
  ];

  useEffect(() => {
    console.log('Checkout data:', { selectedItems, selectedProducts, subtotal });
    if (!selectedItems || selectedItems.length === 0) {
      alert('Tidak ada produk yang dipilih. Kembali ke keranjang.');
      navigate('/cart');
    }
  }, []);

  const total = (subtotal || 0) + shippingCost;

  const handlePlaceOrder = async () => {
    if (!selectedShipping) {
      alert('Pilih metode pengiriman terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cartIds: selectedItems,
          alamat_pengiriman: 'Jl. Contoh Alamat No.123',
          metode_pembayaran: 'Transfer Bank',
          shipping_cost: shippingCost,
          shipping_method: selectedShipping.name
        })
      });
      
      const data = await response.json();
      console.log('Order response:', data);
      
      if (data.success) {
        setOrderId(data.orderId);
        setOrderSuccess(true);
      } else {
        alert(data.message || 'Gagal membuat pesanan');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Update rating untuk produk tertentu
  const updateRating = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  // Update komentar untuk produk tertentu
  const updateKomentar = (productId, komentar) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], komentar }
    }));
  };

  // Submit ulasan
  const submitReview = async (productId) => {
    const review = reviews[productId];
    if (!review || !review.rating) {
      alert('Berikan rating bintang terlebih dahulu');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_produk: productId,
          rating: review.rating,
          komentar: review.komentar || '',
          id_transaksi: orderId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Ulasan berhasil dikirim! Terima kasih atas review Anda ⭐');
        // Hapus produk dari daftar ulasan yang belum dikirim
        setReviews(prev => {
          const newReviews = { ...prev };
          delete newReviews[productId];
          return newReviews;
        });
      } else {
        alert('Gagal mengirim ulasan');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  // Komponen Star Rating
  const StarRating = ({ rating, onRatingChange }) => (
    <div style={{ display: 'flex', gap: '5px', marginTop: '10px', marginBottom: '10px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onRatingChange(star)}
          style={{
            cursor: 'pointer',
            fontSize: '32px',
            color: star <= rating ? '#ffaa00' : '#555',
            transition: 'transform 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  // Tampilkan Struk Kasir dengan Form Ulasan
  if (orderSuccess) {
    // Hitung berapa produk yang belum di-review
    const pendingReviews = selectedProducts?.filter(p => !reviews[p.id_produk]?.submitted) || [];
    const allReviewed = pendingReviews.length === 0;

    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', margin: 0 }}>⚡ VOLTIFY ⚡</h1>
            <p style={{ fontSize: '12px', color: '#666' }}>Electronics Hub</p>
            <div style={{ borderTop: '1px dashed #ccc', margin: '15px 0', paddingTop: '10px' }}>
              <p><strong>STRUK PEMBELIAN</strong></p>
              <p>No. Order: #{orderId}</p>
              <p>Tanggal: {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>

          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Produk</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
               </tr>
            </thead>
            <tbody>
              {selectedProducts?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 0' }}>{item.nama_produk}</td>
                  <td style={{ textAlign: 'center' }}>{item.jumlah}</td>
                  <td style={{ textAlign: 'right' }}>Rp{item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: '1px solid #ccc', margin: '15px 0', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span>Rp{subtotal?.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Ongkos Kirim ({selectedShipping?.name})</span>
              <span>Rp{shippingCost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
              <span>TOTAL</span>
              <span>Rp{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Tombol Beri Ulasan - hanya tampil jika masih ada produk yang belum di-review */}
          {!allReviewed && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowReviewForm(true)}
                style={{
                  padding: '12px 24px',
                  background: '#ffaa00',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ⭐ Beri Ulasan & Bintang
              </button>
            </div>
          )}

          {allReviewed && (
            <div style={{ marginTop: '20px', textAlign: 'center', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
              <p style={{ color: '#2e7d32', margin: 0 }}>✅ Terima kasih! Semua produk sudah Anda review.</p>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', borderTop: '1px dashed #ccc', paddingTop: '15px', marginTop: '15px' }}>
            <p>Terima kasih telah berbelanja!</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                🖨️ Cetak Struk
              </button>
              <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#00d4ff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                🏠 Beranda
              </button>
              <button onClick={() => navigate('/orders')} style={{ padding: '10px 20px', background: '#2a2a3a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                📦 Pesanan Saya
              </button>
            </div>
          </div>
        </div>

        {/* Modal Form Ulasan */}
        {showReviewForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}>
            <div style={{
              background: '#1a1a2e',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ color: '#ffaa00', marginBottom: '20px', textAlign: 'center' }}>⭐ Beri Ulasan Produk</h2>
              <p style={{ color: '#888', marginBottom: '20px', textAlign: 'center' }}>Bagikan pengalaman Anda menggunakan produk ini</p>
              
              {selectedProducts?.map((item) => {
                const review = reviews[item.id_produk] || { rating: 0, komentar: '' };
                const isReviewed = review.submitted;
                
                if (isReviewed) return null;
                
                return (
                  <div key={item.id_produk} style={{
                    marginBottom: '30px',
                    padding: '20px',
                    background: '#0f0f1a',
                    borderRadius: '12px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <img
                        src={item.gambar_utama || 'https://placehold.co/60x60/1a1a2e/ffaa00?text=Product'}
                        alt={item.nama_produk}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>{item.nama_produk}</h3>
                        <p style={{ color: '#888', fontSize: '12px' }}>Qty: {item.jumlah}</p>
                      </div>
                    </div>
                    
                    <StarRating 
                      rating={review.rating} 
                      onRatingChange={(rating) => updateRating(item.id_produk, rating)} 
                    />
                    
                    <textarea
                      value={review.komentar || ''}
                      onChange={(e) => updateKomentar(item.id_produk, e.target.value)}
                      placeholder="Tulis ulasan Anda di sini..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1a1a2e',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'white',
                        marginTop: '10px',
                        minHeight: '80px',
                        fontFamily: 'inherit'
                      }}
                    />
                    
                    <button
                      onClick={() => submitReview(item.id_produk)}
                      disabled={!review.rating}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '15px',
                        background: !review.rating ? '#555' : '#ffaa00',
                        color: !review.rating ? '#999' : '#1a1a2e',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: !review.rating ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {!review.rating ? '⭐ Beri Bintang Terlebih Dahulu' : '📝 Kirim Ulasan'}
                    </button>
                  </div>
                );
              })}
              
              <button
                onClick={() => setShowReviewForm(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  background: '#2a2a3a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tampilan Checkout (sama seperti sebelumnya)
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button onClick={handleBackToCart} style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
        ← Kembali ke Keranjang
      </button>

      <h1 style={{ color: 'white', marginBottom: '30px' }}>📦 Checkout</h1>

      <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🛍️ Produk yang Dibeli ({selectedProducts?.length || 0} item)</h3>
        {selectedProducts?.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #333' }}>
            <div>
              <p style={{ color: 'white' }}>{item.nama_produk}</p>
              <p style={{ color: '#888', fontSize: '12px' }}>Jumlah: {item.jumlah}</p>
            </div>
            <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>Rp{item.subtotal.toLocaleString()}</span>
          </div>
        ))}
        <div style={{ marginTop: '15px', textAlign: 'right', paddingTop: '15px', borderTop: '1px solid #333' }}>
          <p style={{ color: 'white' }}>Subtotal: <span style={{ color: '#00ffaa' }}>Rp{subtotal?.toLocaleString()}</span></p>
        </div>
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>🚚 Metode Pengiriman</h3>
        {shippingOptions.map(opt => (
          <label key={opt.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: selectedShipping?.id === opt.id ? '#2a2a3a' : 'transparent',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '8px',
            border: selectedShipping?.id === opt.id ? '1px solid #00d4ff' : '1px solid #333'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="radio"
                name="shipping"
                checked={selectedShipping?.id === opt.id}
                onChange={() => {
                  setSelectedShipping(opt);
                  setShippingCost(opt.price);
                }}
              />
              <span style={{ fontSize: '20px' }}>{opt.icon}</span>
              <div>
                <strong style={{ color: 'white' }}>{opt.name}</strong>
                <p style={{ color: '#888', fontSize: '11px' }}>Estimasi {opt.estimate}</p>
              </div>
            </div>
            <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>Rp{opt.price.toLocaleString()}</span>
          </label>
        ))}
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: '#888' }}>Subtotal</span>
          <span style={{ color: 'white' }}>Rp{subtotal?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: '#888' }}>Ongkos Kirim</span>
          <span style={{ color: 'white' }}>Rp{shippingCost.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingTop: '15px', borderTop: '1px solid #333' }}>
          <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Total</span>
          <span style={{ color: '#00ffaa', fontSize: '18px', fontWeight: 'bold' }}>Rp{total.toLocaleString()}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !selectedShipping}
          style={{
            width: '100%',
            padding: '16px',
            background: (loading || !selectedShipping) ? '#555' : '#00d4ff',
            color: (loading || !selectedShipping) ? '#999' : '#1a1a2e',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: (loading || !selectedShipping) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Memproses...' : (selectedShipping ? '✅ Checkout Sekarang' : 'Pilih Metode Pengiriman Terlebih Dahulu')}
        </button>
      </div>
    </div>
  );
}

export default Checkout;
