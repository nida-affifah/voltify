import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5555/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Cart data:', data);
      if (data.success) {
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5555/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ jumlah: newQuantity })
      });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm('Hapus item dari keranjang?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5555/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
      setSelectedItems(selectedItems.filter(item => item !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id_keranjang));
    }
    setSelectAll(!selectAll);
  };

  const selectedProducts = cartItems.filter(item => selectedItems.includes(item.id_keranjang));
  const subtotal = selectedProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalItems = selectedProducts.reduce((sum, item) => sum + item.jumlah, 0);

  const handleCheckout = () => {
    console.log('=== HANDLE CHECKOUT CLICKED ===');
    console.log('selectedItems:', selectedItems);
    console.log('selectedProducts:', selectedProducts);
    console.log('subtotal:', subtotal);
    
    if (selectedItems.length === 0) {
      alert('Pilih produk terlebih dahulu');
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedItems, 
        selectedProducts: selectedProducts, 
        subtotal: subtotal 
      } 
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div>🛒 Loading keranjang...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>Keranjang Belanja Kosong</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>Yuk, belanja sekarang!</p>
        <Link to="/products">
          <button style={{
            padding: '12px 32px',
            background: '#00d4ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            Mulai Belanja
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', marginBottom: '30px', fontSize: '28px' }}>🛒 Keranjang Belanja</h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Daftar Produk */}
        <div style={{ flex: 2 }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #333',
              marginBottom: '10px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Pilih Semua ({cartItems.length})</span>
              </label>
            </div>

            {cartItems.map(item => {
              const isFlashSale = item.harga_diskon && item.harga_diskon < item.harga;
              const discount = isFlashSale ? Math.round((1 - item.harga_diskon / item.harga) * 100) : 0;
              
              return (
                <div key={item.id_keranjang} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px 0',
                  borderBottom: '1px solid #333'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id_keranjang)}
                    onChange={() => toggleSelectItem(item.id_keranjang)}
                    style={{ width: '18px', height: '18px', marginTop: '30px', cursor: 'pointer' }}
                  />
                  
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.gambar_utama || 'https://placehold.co/100x100/1a1a2e/00d4ff?text=Produk'}
                      alt={item.nama_produk}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                    {isFlashSale && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        left: '-5px',
                        background: '#ff4444',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        🔥 -{discount}%
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '16px' }}>{item.nama_produk}</h3>
                    <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                      Stok: {item.available_stock}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.id_keranjang, item.jumlah - 1)}
                          disabled={item.jumlah <= 1}
                          style={{
                            padding: '8px 16px',
                            background: '#2a2a3a',
                            border: 'none',
                            color: 'white',
                            cursor: item.jumlah <= 1 ? 'not-allowed' : 'pointer'
                          }}
                        >-</button>
                        <span style={{ padding: '8px 20px', color: 'white' }}>{item.jumlah}</span>
                        <button
                          onClick={() => updateQuantity(item.id_keranjang, item.jumlah + 1)}
                          disabled={item.jumlah >= item.available_stock}
                          style={{
                            padding: '8px 16px',
                            background: '#2a2a3a',
                            border: 'none',
                            color: 'white',
                            cursor: item.jumlah >= item.available_stock ? 'not-allowed' : 'pointer'
                          }}
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id_keranjang)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6666',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    {isFlashSale ? (
                      <>
                        <span style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '18px' }}>
                          Rp{item.subtotal.toLocaleString()}
                        </span>
                        <p style={{ color: '#888', fontSize: '12px', textDecoration: 'line-through' }}>
                          Rp{(item.harga * item.jumlah).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <span style={{ color: '#00ffaa', fontWeight: 'bold', fontSize: '18px' }}>
                        Rp{item.subtotal.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <Link to="/products">
            <button style={{
              padding: '12px 24px',
              background: '#2a2a3a',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}>
              ← Lanjut Belanja
            </button>
          </Link>
        </div>

        {/* Ringkasan Belanja */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '24px',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>Ringkasan Belanja</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#888' }}>
                <span>Total Produk ({totalItems} item)</span>
                <span>Rp{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#888' }}>
                <span>Diskon</span>
                <span style={{ color: '#ff4444' }}>-Rp0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#888' }}>
                <span>Ongkos Kirim</span>
                <span>Akan dihitung saat checkout</span>
              </div>
            </div>
            
            <div style={{
              borderTop: '1px solid #333',
              paddingTop: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span style={{ color: 'white' }}>Total Tagihan</span>
                <span style={{ color: '#00ffaa' }}>Rp{subtotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              style={{
                width: '100%',
                padding: '16px',
                background: selectedItems.length === 0 ? '#555' : '#00d4ff',
                color: selectedItems.length === 0 ? '#999' : '#1a1a2e',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {selectedItems.length === 0 ? 'Pilih Produk Terlebih Dahulu' : `🛒 Checkout (${selectedItems.length} item)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
