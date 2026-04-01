// backend/controllers/cartController.js
const pool = require('../config/database');

// Add to cart (mengurangi stok sementara - reserved)
const addToCart = async (req, res) => {
  const { id_produk, jumlah } = req.body;
  const userId = req.user.id_user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Cek stok produk
    const productCheck = await client.query(
      'SELECT stok FROM produk WHERE id_produk = $1 FOR UPDATE',
      [id_produk]
    );
    
    if (productCheck.rows.length === 0) {
      throw new Error('Produk tidak ditemukan');
    }
    
    const currentStock = productCheck.rows[0].stok;
    if (currentStock < jumlah) {
      throw new Error('Stok tidak mencukupi');
    }
    
    // Cek apakah produk sudah ada di keranjang
    const existingCart = await client.query(
      'SELECT * FROM keranjang WHERE id_user = $1 AND id_produk = $2',
      [userId, id_produk]
    );
    
    if (existingCart.rows.length > 0) {
      // Update jumlah di keranjang
      await client.query(
        'UPDATE keranjang SET jumlah = jumlah + $1, updated_at = NOW() WHERE id_user = $2 AND id_produk = $3',
        [jumlah, userId, id_produk]
      );
    } else {
      // Tambah ke keranjang
      await client.query(
        'INSERT INTO keranjang (id_user, id_produk, jumlah, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [userId, id_produk, jumlah]
      );
    }
    
    // Kurangi stok produk (reserved)
    await client.query(
      'UPDATE produk SET stok = stok - $1 WHERE id_produk = $2',
      [jumlah, id_produk]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Produk ditambahkan ke keranjang' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// Get cart
const getCart = async (req, res) => {
  const userId = req.user.id_user;
  try {
    const result = await pool.query(
      `SELECT k.*, p.nama_produk, p.harga, p.harga_diskon, p.gambar_utama,
              p.stok as available_stock,
              CASE WHEN p.harga_diskon > 0 THEN p.harga_diskon ELSE p.harga END as harga_satuan
       FROM keranjang k
       JOIN produk p ON k.id_produk = p.id_produk
       WHERE k.id_user = $1
       ORDER BY k.created_at DESC`,
      [userId]
    );
    
    const items = result.rows.map(item => ({
      id_keranjang: item.id_keranjang,
      id_produk: item.id_produk,
      nama_produk: item.nama_produk,
      jumlah: item.jumlah,
      harga_satuan: parseFloat(item.harga_satuan),
      subtotal: item.jumlah * parseFloat(item.harga_satuan),
      gambar_utama: item.gambar_utama,
      available_stock: item.available_stock,
      harga: item.harga,
      harga_diskon: item.harga_diskon
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    res.json({ success: true, items, subtotal });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update cart quantity
const updateCart = async (req, res) => {
  const { id } = req.params;
  const { jumlah } = req.body;
  const userId = req.user.id_user;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Ambil data keranjang
    const cartItem = await client.query(
      'SELECT * FROM keranjang WHERE id_keranjang = $1 AND id_user = $2',
      [id, userId]
    );
    
    if (cartItem.rows.length === 0) {
      throw new Error('Item tidak ditemukan');
    }
    
    const oldJumlah = cartItem.rows[0].jumlah;
    const productId = cartItem.rows[0].id_produk;
    const selisih = jumlah - oldJumlah;
    
    if (selisih !== 0) {
      // Cek stok jika menambah jumlah
      if (selisih > 0) {
        const productCheck = await client.query(
          'SELECT stok FROM produk WHERE id_produk = $1 FOR UPDATE',
          [productId]
        );
        if (productCheck.rows[0].stok < selisih) {
          throw new Error('Stok tidak mencukupi');
        }
      }
      
      // Update stok produk
      await client.query(
        'UPDATE produk SET stok = stok - $1 WHERE id_produk = $2',
        [selisih, productId]
      );
      
      // Update keranjang
      if (jumlah <= 0) {
        await client.query(
          'DELETE FROM keranjang WHERE id_keranjang = $1',
          [id]
        );
      } else {
        await client.query(
          'UPDATE keranjang SET jumlah = $1, updated_at = NOW() WHERE id_keranjang = $2',
          [jumlah, id]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Keranjang diupdate' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// Remove from cart (kembalikan stok)
const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Ambil data keranjang
    const cartItem = await client.query(
      'SELECT * FROM keranjang WHERE id_keranjang = $1 AND id_user = $2',
      [id, userId]
    );
    
    if (cartItem.rows.length === 0) {
      throw new Error('Item tidak ditemukan');
    }
    
    const jumlah = cartItem.rows[0].jumlah;
    const productId = cartItem.rows[0].id_produk;
    
    // Kembalikan stok
    await client.query(
      'UPDATE produk SET stok = stok + $1 WHERE id_produk = $2',
      [jumlah, productId]
    );
    
    // Hapus dari keranjang
    await client.query(
      'DELETE FROM keranjang WHERE id_keranjang = $1',
      [id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Produk dihapus dari keranjang' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
};