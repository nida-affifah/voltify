const pool = require('../config/database');

// ================= CHECKOUT DARI KERANJANG =================
const checkout = async (req, res) => {
  const { cartIds, alamat_pengiriman, metode_pembayaran } = req.body;
  const userId = req.user.id_user;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const cartItems = await client.query(
      `SELECT c.*, p.harga, p.harga_diskon, p.nama_produk, p.id_toko
       FROM keranjang c
       JOIN produk p ON c.id_produk = p.id_produk
       WHERE c.id_keranjang = ANY($1::int[]) AND c.id_user = $2
       FOR UPDATE`,
      [cartIds, userId]
    );
    
    if (cartItems.rows.length === 0) {
      throw new Error('Keranjang kosong');
    }
    
    let total = 0;
    const items = cartItems.rows.map(item => {
      const harga = item.harga_diskon || item.harga;
      total += parseFloat(harga) * item.jumlah;
      return {
        id_produk: item.id_produk,
        nama_produk: item.nama_produk,
        jumlah: item.jumlah,
        harga_satuan: harga,
        id_toko: item.id_toko
      };
    });
    
    const orderResult = await client.query(
      `INSERT INTO transaksi (id_user, total_harga_produk, grand_total, status_order, status_pembayaran)
       VALUES ($1, $2, $3, 'pending', 'pending')
       RETURNING id_transaksi`,
      [userId, total, total]
    );
    
    const orderId = orderResult.rows[0].id_transaksi;
    
    for (const item of items) {
      await client.query(
        `INSERT INTO detail_transaksi (id_transaksi, id_produk, id_toko, nama_produk_saat_transaksi, harga_satuan_saat_transaksi, jumlah, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.id_produk, item.id_toko, item.nama_produk, item.harga_satuan, item.jumlah, item.harga_satuan * item.jumlah]
      );
    }
    
    await client.query(
      'DELETE FROM keranjang WHERE id_keranjang = ANY($1::int[]) AND id_user = $2',
      [cartIds, userId]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, orderId, message: 'Checkout berhasil' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ================= BUY NOW =================
const buyNow = async (req, res) => {
  const { id_produk, jumlah } = req.body;
  const userId = req.user.id_user;
  
  console.log('Buy now request:', { id_produk, jumlah, userId });
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const product = await client.query(
      'SELECT * FROM produk WHERE id_produk = $1 FOR UPDATE',
      [id_produk]
    );
    
    if (product.rows.length === 0) {
      throw new Error('Produk tidak ditemukan');
    }
    
    const productData = product.rows[0];
    const harga = productData.harga_diskon || productData.harga;
    const total = parseFloat(harga) * (jumlah || 1);
    
    const orderResult = await client.query(
      `INSERT INTO transaksi (id_user, total_harga_produk, grand_total, status_order, status_pembayaran)
       VALUES ($1, $2, $3, 'pending', 'pending')
       RETURNING id_transaksi`,
      [userId, total, total]
    );
    
    const orderId = orderResult.rows[0].id_transaksi;
    
    await client.query(
      `INSERT INTO detail_transaksi (id_transaksi, id_produk, id_toko, nama_produk_saat_transaksi, harga_satuan_saat_transaksi, jumlah, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, id_produk, productData.id_toko, productData.nama_produk, harga, jumlah || 1, total]
    );
    
    await client.query(
      'UPDATE produk SET stok = stok - $1 WHERE id_produk = $2',
      [jumlah || 1, id_produk]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      orderId, 
      message: 'Pesanan berhasil dibuat'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Buy now error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ================= GET ALL ORDERS =================
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const result = await pool.query(
      `SELECT t.*, 
              COALESCE(t.metode_pembayaran, 'Belum dipilih') as metode_pembayaran,
              COALESCE(t.biaya_pengiriman, 15000) as biaya_pengiriman,
              COALESCE(t.kurir, 'JNE Reguler') as kurir,
              COALESCE(t.alamat_pengiriman, 'Jl. Contoh Alamat No.123, Jakarta') as alamat_pengiriman
       FROM transaksi t
       WHERE t.id_user = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    
    const ordersWithItems = [];
    for (const order of result.rows) {
      const items = await pool.query(
        `SELECT dt.*, p.nama_produk, p.gambar_utama
         FROM detail_transaksi dt
         JOIN produk p ON dt.id_produk = p.id_produk
         WHERE dt.id_transaksi = $1`,
        [order.id_transaksi]
      );
      ordersWithItems.push({
        ...order,
        items: items.rows
      });
    }
    
    res.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= GET ORDER DETAIL =================
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const order = await pool.query(
      'SELECT * FROM transaksi WHERE id_transaksi = $1 AND id_user = $2',
      [id, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    const items = await pool.query(
      'SELECT * FROM detail_transaksi WHERE id_transaksi = $1',
      [id]
    );

    res.json({
      success: true,
      order: order.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= CANCEL ORDER =================
const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const orderCheck = await client.query(
      'SELECT * FROM transaksi WHERE id_transaksi = $1 AND id_user = $2 AND status_order = $3',
      [id, userId, 'pending']
    );
    
    if (orderCheck.rows.length === 0) {
      throw new Error('Order tidak ditemukan atau sudah diproses');
    }
    
    const orderItems = await client.query(
      'SELECT * FROM detail_transaksi WHERE id_transaksi = $1',
      [id]
    );
    
    for (const item of orderItems.rows) {
      await client.query(
        'UPDATE produk SET stok = stok + $1 WHERE id_produk = $2',
        [item.jumlah, item.id_produk]
      );
    }
    
    await client.query(
      'UPDATE transaksi SET status_order = $1 WHERE id_transaksi = $2',
      ['cancelled', id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Pesanan dibatalkan, stok dikembalikan' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// ================= UPDATE ORDER STATUS =================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE transaksi SET status_order = $1 WHERE id_transaksi = $2 RETURNING *',
      [status, id]
    );

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= PROCESS PAYMENT =================
const processPayment = async (req, res) => {
  const { id } = req.params;
  const { metode_pembayaran, alamat_pengiriman, kurir, biaya_pengiriman } = req.body;
  const userId = req.user.id_user;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const order = await client.query(
      'SELECT * FROM transaksi WHERE id_transaksi = $1 AND id_user = $2 AND status_pembayaran = $3',
      [id, userId, 'pending']
    );
    
    if (order.rows.length === 0) {
      throw new Error('Order tidak ditemukan atau sudah dibayar');
    }
    
    const result = await client.query(
      `UPDATE transaksi 
       SET status_pembayaran = 'paid', 
           status_order = 'processing',
           metode_pembayaran = COALESCE($1, metode_pembayaran),
           alamat_pengiriman = COALESCE($2, alamat_pengiriman),
           kurir = COALESCE($3, kurir),
           biaya_pengiriman = COALESCE($4, biaya_pengiriman),
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id_transaksi = $5 
       RETURNING *`,
      [metode_pembayaran, alamat_pengiriman, kurir, biaya_pengiriman, id]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      order: result.rows[0],
      message: '✅ Pembayaran berhasil! Pesanan akan segera diproses. Tunggu paket Anda datang! 🚚'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

// Alias untuk createOrder
const createOrder = checkout;

// ================= EXPORT =================
module.exports = {
  checkout,
  createOrder,
  buyNow,
  getOrders,
  getOrderDetail,
  cancelOrder,
  updateOrderStatus,
  processPayment
};
