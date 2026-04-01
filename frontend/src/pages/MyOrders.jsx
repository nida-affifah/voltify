import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [notification, setNotification] = useState(null);

  const paymentMethods = [
    { id: 'bca', name: 'Bank BCA', icon: '🏦', account: '1234567890', holder: 'Voltify Indonesia' },
    { id: 'mandiri', name: 'Bank Mandiri', icon: '🏦', account: '9876543210', holder: 'Voltify Indonesia' },
    { id: 'bri', name: 'Bank BRI', icon: '🏦', account: '1122334455', holder: 'Voltify Indonesia' },
    { id: 'qris', name: 'QRIS', icon: '📱', instruction: 'Scan QRIS menggunakan e-wallet' },
    { id: 'cod', name: 'COD (Bayar di Tempat)', icon: '💵', fee: 5000 }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5555/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      alert('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5555/api/orders/${selectedOrder.id_transaksi}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          metode_pembayaran: selectedPayment.name,
          payment_method_id: selectedPayment.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        showNotification(`✅ Pesanan #${selectedOrder.id_transaksi} berhasil dibayar! Tunggu paket Anda datang. 🚚`);
        fetchOrders();
      } else {
        alert(data.message || 'Gagal memproses pembayaran');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
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
          id_produk: selectedProduct.id_produk,
          rating: rating,
          komentar: komentar,
          id_transaksi: selectedOrder.id_transaksi
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowReviewModal(false);
        setRating(0);
        setKomentar('');
        showNotification(`⭐ Ulasan untuk ${selectedProduct.nama_produk} berhasil dikirim! Terima kasih!`);
        fetchOrders();
      } else {
        alert(data.message || 'Gagal mengirim ulasan');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const StarRating = ({ rating, setRating, size = 24 }) => (
    <div style={{ display: 'flex', gap: '5px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => setRating && setRating(star)}
          style={{
            cursor: setRating ? 'pointer' : 'default',
            fontSize: `${size}px`,
            color: star <= rating ? '#ffaa00' : '#555'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const OrderReceipt = ({ order }) => {
  const total = parseFloat(order.grand_total) || 0;
  const shippingCost = parseFloat(order.biaya_pengiriman) || 15000;
  const subtotal = total - shippingCost;

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '15px',
      fontFamily: 'monospace',
      fontSize: '13px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '15px', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>⚡ VOLTIFY ⚡</h2>
        <p style={{ margin: '5px 0', fontSize: '11px', color: '#666' }}>Electronics Hub</p>
        <p style={{ margin: '5px 0', fontSize: '10px', color: '#888' }}>Jl. Electronics No.123, Jakarta</p>
        <p style={{ margin: '5px 0', fontSize: '10px', color: '#888' }}>Telp: (021) 1234-5678</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span><strong>STRUK PEMBELIAN</strong></span>
          <span>No: #{order.id_transaksi}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Tanggal</span>
          <span>{new Date(order.created_at).toLocaleString('id-ID')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Kasir</span>
          <span>System</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Status</span>
          <span style={{ color: order.status_pembayaran === 'paid' ? '#2e7d32' : '#ed6c02', fontWeight: 'bold' }}>
            {order.status_pembayaran === 'paid' ? '✅ LUNAS' : '⏳ MENUNGGU PEMBAYARAN'}
          </span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px', marginTop: '10px' }}>
        <p><strong>Detail Pesanan:</strong></p>
        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '5px 0' }}>Produk</th>
              <th style={{ textAlign: 'center', padding: '5px 0' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '5px 0' }}>Harga</th>
              <th style={{ textAlign: 'right', padding: '5px 0' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 0' }}>{item.nama_produk}</td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.jumlah}</td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>Rp{item.harga_satuan_saat_transaksi?.toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>Rp{item.subtotal?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Subtotal</span>
          <span>Rp{subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Ongkos Kirim ({order.kurir || 'JNE Reguler'})</span>
          <span>Rp{shippingCost.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Biaya Admin</span>
          <span>Rp0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
          <span>TOTAL</span>
          <span style={{ color: '#d32f2f' }}>Rp{total.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '8px', fontSize: '11px' }}>
        <p><strong>📍 Alamat Pengiriman:</strong></p>
        <p>{order.alamat_pengiriman || 'Jl. Contoh Alamat No.123, Jakarta'}</p>
        <p><strong>📞 Penerima:</strong> {order.penerima || 'Customer'}</p>
        <p><strong>💳 Metode Pembayaran:</strong> {order.metode_pembayaran || 'Belum dipilih'}</p>
        <p><strong>🚚 Kurir:</strong> {order.kurir || 'JNE Reguler'} (Estimasi 2-3 hari)</p>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '15px', marginTop: '15px', fontSize: '10px', color: '#888' }}>
        <p>Terima kasih telah berbelanja di Voltify!</p>
        <p>Barang akan diproses dalam 1x24 jam setelah pembayaran dikonfirmasi</p>
        <p style={{ marginTop: '5px' }}>✨ Simpan struk ini sebagai bukti pembelian ✨</p>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div>📦 Loading pesanan...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>📦</div>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>Belum Ada Pesanan</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>Yuk, mulai belanja sekarang!</p>
        <Link to="/products">
          <button style={{
            padding: '12px 32px',
            background: '#00d4ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Mulai Belanja
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
      {/* Notifikasi */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#4caf50' : '#ff9800',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      <h1 style={{ color: 'white', marginBottom: '30px' }}>📦 Pesanan Saya</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map(order => (
          <div key={order.id_transaksi} style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(0,212,255,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '12px' }}>Order ID</p>
                <p style={{ color: 'white', fontWeight: 'bold' }}>#{order.id_transaksi}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px' }}>Tanggal</p>
                <p style={{ color: 'white' }}>{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px' }}>Total</p>
                <p style={{ color: '#00ffaa', fontWeight: 'bold', fontSize: '18px' }}>
                  Rp{parseInt(order.grand_total).toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '12px' }}>Status</p>
                <p style={{
                  color: order.status_pembayaran === 'paid' ? '#4caf50' : '#ff9800',
                  fontWeight: 'bold'
                }}>
                  {order.status_pembayaran === 'paid' ? '✅ Lunas' : '⏳ Menunggu Pembayaran'}
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {order.status_pembayaran !== 'paid' && (
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPaymentModal(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#00d4ff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  💳 Bayar Sekarang
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowReviewModal(true);
                  setSelectedProduct(null);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#ffaa00',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ⭐ Beri Ulasan
              </button>
              <button
                onClick={() => setSelectedOrder(selectedOrder === order ? null : order)}
                style={{
                  padding: '8px 16px',
                  background: '#2a2a3a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                {selectedOrder === order ? '📄 Tutup Struk' : '📄 Lihat Struk'}
              </button>
            </div>

            {/* Struk Detail */}
            {selectedOrder === order && (
              <OrderReceipt order={order} />
            )}
          </div>
        ))}
      </div>

      {/* Modal Pembayaran */}
      {showPaymentModal && selectedOrder && (
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
            <h2 style={{ color: '#00d4ff', marginBottom: '20px' }}>💳 Pilih Metode Pembayaran</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>Total: <strong style={{ color: '#00ffaa' }}>Rp{parseInt(selectedOrder.grand_total).toLocaleString()}</strong></p>
            
            {paymentMethods.map(method => (
              <label key={method.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: selectedPayment?.id === method.id ? '#2a2a3a' : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '10px',
                border: selectedPayment?.id === method.id ? '1px solid #00d4ff' : '1px solid #333'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment?.id === method.id}
                    onChange={() => setSelectedPayment(method)}
                  />
                  <span style={{ fontSize: '24px' }}>{method.icon}</span>
                  <div>
                    <strong style={{ color: 'white' }}>{method.name}</strong>
                    {method.account && (
                      <p style={{ color: '#888', fontSize: '11px' }}>No. Rek: {method.account}</p>
                    )}
                    {method.instruction && (
                      <p style={{ color: '#888', fontSize: '11px' }}>{method.instruction}</p>
                    )}
                  </div>
                </div>
                {method.fee > 0 && <span style={{ color: '#ff4444', fontSize: '12px' }}>+Rp{method.fee.toLocaleString()}</span>}
              </label>
            ))}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handlePayment}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#00d4ff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✅ Konfirmasi Pembayaran
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2a2a3a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ulasan */}
      {showReviewModal && selectedOrder && (
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
            <h2 style={{ color: '#ffaa00', marginBottom: '20px' }}>⭐ Beri Ulasan</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>Bagikan pengalaman Anda untuk produk ini</p>
            
            {!selectedProduct ? (
              <div>
                <p style={{ color: 'white', marginBottom: '15px' }}>Pilih produk yang ingin diulas:</p>
                {selectedOrder.items?.map(item => (
                  <button
                    key={item.id_produk}
                    onClick={() => setSelectedProduct(item)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px',
                      marginBottom: '10px',
                      background: '#2a2a3a',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {item.nama_produk} - {item.jumlah}x
                  </button>
                ))}
                <button
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '10px',
                    background: '#2a2a3a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  Batal
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <img
                    src={selectedProduct.gambar_utama || 'https://placehold.co/60x60/1a1a2e/ffaa00'}
                    alt=""
                    style={{ width: '60px', height: '60px', borderRadius: '8px' }}
                  />
                  <div>
                    <p style={{ color: 'white', fontWeight: 'bold' }}>{selectedProduct.nama_produk}</p>
                    <p style={{ color: '#888', fontSize: '12px' }}>Qty: {selectedProduct.jumlah}</p>
                  </div>
                </div>
                
                <StarRating rating={rating} setRating={setRating} size={32} />
                
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  placeholder="Tulis ulasan Anda di sini..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '15px',
                    background: '#0f0f1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    minHeight: '80px'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={submitReview}
                    disabled={rating === 0}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: rating === 0 ? '#555' : '#ffaa00',
                      color: rating === 0 ? '#999' : '#1a1a2e',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: rating === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {rating === 0 ? '⭐ Beri Bintang' : '📝 Kirim Ulasan'}
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#2a2a3a',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'white'
                    }}
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default MyOrders;
