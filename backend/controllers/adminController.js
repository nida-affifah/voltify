const pool = require('../config/database');

// ================= DASHBOARD =================
const getAdminDashboard = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const userRole = req.user.role;
    
    // Ambil data toko milik user
    let storeId = null;
    if (userRole === 'seller' || userRole === 'admin_toko') {
      const store = await pool.query(
        'SELECT id_toko FROM toko WHERE id_seller = $1',
        [userId]
      );
      storeId = store.rows[0]?.id_toko;
      
      if (!storeId && userRole !== 'super_admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Anda belum memiliki toko. Silakan buat toko terlebih dahulu.' 
        });
      }
    }
    
    // Total produk
    let productsQuery, productsParams;
    if (userRole === 'super_admin') {
      productsQuery = 'SELECT COUNT(*) FROM produk';
      productsParams = [];
    } else {
      productsQuery = 'SELECT COUNT(*) FROM produk WHERE id_toko = $1';
      productsParams = [storeId];
    }
    const totalProducts = await pool.query(productsQuery, productsParams);
    
    // Total pesanan
    let ordersQuery, ordersParams;
    if (userRole === 'super_admin') {
      ordersQuery = 'SELECT COUNT(*) FROM transaksi';
      ordersParams = [];
    } else {
      ordersQuery = `
        SELECT COUNT(DISTINCT t.id_transaksi) 
        FROM transaksi t
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        WHERE dt.id_toko = $1
      `;
      ordersParams = [storeId];
    }
    const totalOrders = await pool.query(ordersQuery, ordersParams);
    
    // Total pendapatan
    let revenueQuery, revenueParams;
    if (userRole === 'super_admin') {
      revenueQuery = 'SELECT COALESCE(SUM(grand_total), 0) FROM transaksi WHERE status_pembayaran = $1';
      revenueParams = ['paid'];
    } else {
      revenueQuery = `
        SELECT COALESCE(SUM(dt.subtotal), 0) 
        FROM transaksi t
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        WHERE dt.id_toko = $1 AND t.status_pembayaran = $2
      `;
      revenueParams = [storeId, 'paid'];
    }
    const totalRevenue = await pool.query(revenueQuery, revenueParams);
    
    // Total pelanggan
    let customersQuery, customersParams;
    if (userRole === 'super_admin') {
      customersQuery = 'SELECT COUNT(*) FROM users WHERE role = $1';
      customersParams = ['pelanggan'];
    } else {
      customersQuery = `
        SELECT COUNT(DISTINCT t.id_user) 
        FROM transaksi t
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        WHERE dt.id_toko = $1
      `;
      customersParams = [storeId];
    }
    const totalCustomers = await pool.query(customersQuery, customersParams);
    
    // Pesanan terbaru
    let recentQuery, recentParams;
    if (userRole === 'super_admin') {
      recentQuery = `
        SELECT t.*, u.name as customer_name 
        FROM transaksi t
        JOIN users u ON t.id_user = u.id_user
        ORDER BY t.created_at DESC
        LIMIT 10
      `;
      recentParams = [];
    } else {
      recentQuery = `
        SELECT DISTINCT t.*, u.name as customer_name 
        FROM transaksi t
        JOIN users u ON t.id_user = u.id_user
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        WHERE dt.id_toko = $1
        ORDER BY t.created_at DESC
        LIMIT 10
      `;
      recentParams = [storeId];
    }
    const recentOrders = await pool.query(recentQuery, recentParams);
    
    // Stok menipis
    let lowStockQuery, lowStockParams;
    if (userRole === 'super_admin') {
      lowStockQuery = 'SELECT * FROM produk WHERE stok < 10 ORDER BY stok ASC LIMIT 10';
      lowStockParams = [];
    } else {
      lowStockQuery = 'SELECT * FROM produk WHERE id_toko = $1 AND stok < 10 ORDER BY stok ASC LIMIT 10';
      lowStockParams = [storeId];
    }
    const lowStockProducts = await pool.query(lowStockQuery, lowStockParams);
    
    res.json({
      success: true,
      stats: {
        total_products: parseInt(totalProducts.rows[0].count) || 0,
        total_orders: parseInt(totalOrders.rows[0].count) || 0,
        total_revenue: parseFloat(totalRevenue.rows[0].sum) || 0,
        total_customers: parseInt(totalCustomers.rows[0].count) || 0
      },
      recentOrders: recentOrders.rows,
      lowStockProducts: lowStockProducts.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CRUD PRODUK =================
// Get all products
const getProducts = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const userRole = req.user.role;
    
    let query, params;
    if (userRole === 'super_admin') {
      query = `
        SELECT p.*, 
               COALESCE(SUM(dt.jumlah), 0) as total_terjual
        FROM produk p
        LEFT JOIN detail_transaksi dt ON p.id_produk = dt.id_produk
        GROUP BY p.id_produk
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      const store = await pool.query('SELECT id_toko FROM toko WHERE id_seller = $1', [userId]);
      const storeId = store.rows[0]?.id_toko;
      
      if (!storeId) {
        return res.status(403).json({ success: false, message: 'Anda belum memiliki toko' });
      }
      
      query = `
        SELECT p.*, 
               COALESCE(SUM(dt.jumlah), 0) as total_terjual
        FROM produk p
        LEFT JOIN detail_transaksi dt ON p.id_produk = dt.id_produk
        WHERE p.id_toko = $1
        GROUP BY p.id_produk
        ORDER BY p.created_at DESC
      `;
      params = [storeId];
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM produk WHERE id_produk = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { nama_produk, harga, harga_diskon, stok, deskripsi, id_kategori, gambar_utama } = req.body;
    
    // Ambil toko milik user
    const store = await pool.query('SELECT id_toko FROM toko WHERE id_seller = $1', [userId]);
    const storeId = store.rows[0]?.id_toko;
    
    if (!storeId) {
      return res.status(403).json({ success: false, message: 'Anda belum memiliki toko' });
    }
    
    // Buat slug
    const slug = nama_produk.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    const result = await pool.query(
      `INSERT INTO produk (id_toko, id_kategori, nama_produk, slug, harga, harga_diskon, stok, deskripsi, gambar_utama, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`,
      [storeId, id_kategori || null, nama_produk, slug, harga, harga_diskon || null, stok, deskripsi, gambar_utama]
    );
    
    res.json({ success: true, product: result.rows[0], message: 'Produk berhasil ditambahkan' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, harga, harga_diskon, stok, deskripsi, id_kategori, gambar_utama, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE produk 
       SET nama_produk = COALESCE($1, nama_produk),
           harga = COALESCE($2, harga),
           harga_diskon = COALESCE($3, harga_diskon),
           stok = COALESCE($4, stok),
           deskripsi = COALESCE($5, deskripsi),
           id_kategori = COALESCE($6, id_kategori),
           gambar_utama = COALESCE($7, gambar_utama),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id_produk = $9
       RETURNING *`,
      [nama_produk, harga, harga_diskon, stok, deskripsi, id_kategori, gambar_utama, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    
    res.json({ success: true, product: result.rows[0], message: 'Produk berhasil diupdate' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM produk WHERE id_produk = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CRUD PESANAN =================
// Get all orders
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const userRole = req.user.role;
    
    let query, params;
    if (userRole === 'super_admin') {
      query = `
        SELECT t.*, u.name as customer_name 
        FROM transaksi t
        JOIN users u ON t.id_user = u.id_user
        ORDER BY t.created_at DESC
      `;
      params = [];
    } else {
      const store = await pool.query('SELECT id_toko FROM toko WHERE id_seller = $1', [userId]);
      const storeId = store.rows[0]?.id_toko;
      
      if (!storeId) {
        return res.status(403).json({ success: false, message: 'Anda belum memiliki toko' });
      }
      
      query = `
        SELECT DISTINCT t.*, u.name as customer_name 
        FROM transaksi t
        JOIN users u ON t.id_user = u.id_user
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        WHERE dt.id_toko = $1
        ORDER BY t.created_at DESC
      `;
      params = [storeId];
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE transaksi SET status_order = $1, updated_at = NOW() WHERE id_transaksi = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    
    res.json({ success: true, order: result.rows[0], message: 'Status pesanan berhasil diupdate' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update resi pengiriman
const updateResi = async (req, res) => {
  try {
    const { id } = req.params;
    const { resi } = req.body;
    
    const result = await pool.query(
      'UPDATE transaksi SET resi_pengiriman = $1, updated_at = NOW() WHERE id_transaksi = $2 RETURNING *',
      [resi, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    
    res.json({ success: true, order: result.rows[0], message: 'Resi pengiriman berhasil ditambahkan' });
  } catch (error) {
    console.error('Update resi error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LAPORAN =================
const getReports = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const userId = req.user.id_user;
    const userRole = req.user.role;
    
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = "AND t.created_at >= CURRENT_DATE";
    } else if (period === 'weekly') {
      dateFilter = "AND t.created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'monthly') {
      dateFilter = "AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'";
    }
    
    let storeFilter = '';
    let params = [];
    
    if (userRole !== 'super_admin') {
      const store = await pool.query('SELECT id_toko FROM toko WHERE id_seller = $1', [userId]);
      const storeId = store.rows[0]?.id_toko;
      
      if (storeId) {
        storeFilter = 'AND dt.id_toko = $1';
        params.push(storeId);
      }
    }
    
    // Total penjualan
    const salesQuery = `
      SELECT COALESCE(SUM(t.grand_total), 0) as total_sales,
             COUNT(DISTINCT t.id_transaksi) as total_orders,
             COALESCE(SUM(dt.jumlah), 0) as total_items_sold
      FROM transaksi t
      LEFT JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
      WHERE t.status_pembayaran = 'paid' ${dateFilter} ${storeFilter}
    `;
    const salesResult = await pool.query(salesQuery, params);
    
    // Top produk
    const topProductsQuery = `
      SELECT p.id_produk, p.nama_produk, p.gambar_utama,
             COALESCE(SUM(dt.jumlah), 0) as total_terjual,
             COALESCE(SUM(dt.subtotal), 0) as total
      FROM produk p
      LEFT JOIN detail_transaksi dt ON p.id_produk = dt.id_produk
      LEFT JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
      WHERE t.status_pembayaran = 'paid' ${dateFilter} ${storeFilter.replace('dt.id_toko', 'p.id_toko')}
      GROUP BY p.id_produk
      ORDER BY total_terjual DESC
      LIMIT 10
    `;
    const topProductsResult = await pool.query(topProductsQuery, params);
    
    res.json({
      success: true,
      total_sales: parseFloat(salesResult.rows[0].total_sales) || 0,
      total_orders: parseInt(salesResult.rows[0].total_orders) || 0,
      total_items_sold: parseInt(salesResult.rows[0].total_items_sold) || 0,
      top_products: topProductsResult.rows
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  updateResi,
  getReports
};
