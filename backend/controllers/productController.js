// backend/controllers/productController.js
const pool = require('../config/database');

// ================= GET ALL PRODUK =================
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, t.nama_toko, t.is_official, t.rating AS toko_rating, c.nama_kategori
      FROM produk p
      JOIN toko t ON p.id_toko = t.id_toko
      JOIN kategori c ON p.id_kategori = c.id_kategori
      WHERE p.is_active = true
    `;

    const params = [];
    let i = 1;

    if (search) {
      query += ` AND p.nama_produk ILIKE $${i}`;
      params.push(`%${search}%`);
      i++;
    }

    if (category) {
      query += ` AND p.id_kategori = $${i}`;
      params.push(category);
      i++;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${i} OFFSET $${i + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // COUNT
    let countQuery = `SELECT COUNT(*) FROM produk p WHERE p.is_active = true`;
    const countParams = [];
    let j = 1;

    if (search) {
      countQuery += ` AND p.nama_produk ILIKE $${j}`;
      countParams.push(`%${search}%`);
      j++;
    }

    if (category) {
      countQuery += ` AND p.id_kategori = $${j}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      produk: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get produk error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= GET BY ID =================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, t.nama_toko, c.nama_kategori
       FROM produk p
       JOIN toko t ON p.id_toko = t.id_toko
       JOIN kategori c ON p.id_kategori = c.id_kategori
       WHERE p.id_produk = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    res.json({ success: true, product: result.rows[0] });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= FEATURED =================
const getFeaturedProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM produk 
       WHERE is_active = true 
       ORDER BY rating DESC 
       LIMIT 10`
    );

    res.json({ success: true, produk: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= FLASH SALE =================
const getFlashSaleProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, t.nama_toko, f.end_time, f.start_time,
              p.harga_diskon as harga_flash_sale
       FROM produk p
       JOIN toko t ON p.id_toko = t.id_toko
       JOIN flash_sale_produk fp ON p.id_produk = fp.id_produk
       JOIN flash_sale f ON fp.id_flash_sale = f.id_flash_sale
       WHERE p.is_active = true 
         AND f.is_active = true 
         AND f.end_time > NOW()
       ORDER BY f.end_time ASC
       LIMIT 10`,
      []
    );

    // Ambil start_time dan end_time dari produk pertama (semua sama)
    const start_time = result.rows.length > 0 ? result.rows[0].start_time : null;
    const end_time = result.rows.length > 0 ? result.rows[0].end_time : null;
    
    console.log('Flash sale products found:', result.rows.length);
    console.log('Start time:', start_time);
    console.log('End time:', end_time);
    
    res.json({ 
      success: true, 
      produk: result.rows,
      start_time: start_time,
      end_time: end_time
    });
  } catch (error) {
    console.error('Flash sale error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= SEARCH =================
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `SELECT * FROM produk WHERE nama_produk ILIKE $1`,
      [`%${q}%`]
    );

    res.json({ success: true, produk: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= RECOMMENDATION =================
const getRecommendations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM produk ORDER BY RANDOM() LIMIT 5`
    );

    res.json({ success: true, produk: result.rows });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= CREATE =================
const createProduct = async (req, res) => {
  try {
    const { id_toko, id_kategori, nama_produk, harga, stok, deskripsi, gambar_utama } = req.body;
    const userId = req.user.id_user;

    const tokoCheck = await pool.query(
      `SELECT id_toko FROM toko WHERE id_toko = $1 AND id_user = $2`,
      [id_toko, userId]
    );

    if (tokoCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses' });
    }

    const result = await pool.query(
      `INSERT INTO produk 
       (id_toko, id_kategori, nama_produk, harga, stok, deskripsi, gambar_utama, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)
       RETURNING *`,
      [id_toko, id_kategori, nama_produk, harga, stok, deskripsi, gambar_utama]
    );

    res.json({ success: true, product: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambah produk' });
  }
};

// ================= UPDATE =================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, harga, stok, deskripsi, gambar_utama, is_active } = req.body;

    const result = await pool.query(
      `UPDATE produk SET
        nama_produk = COALESCE($1, nama_produk),
        harga = COALESCE($2, harga),
        stok = COALESCE($3, stok),
        deskripsi = COALESCE($4, deskripsi),
        gambar_utama = COALESCE($5, gambar_utama),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE id_produk = $7
      RETURNING *`,
      [nama_produk, harga, stok, deskripsi, gambar_utama, is_active, id]
    );

    res.json({ success: true, product: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal update produk' });
  }
};

// ================= DELETE =================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM produk WHERE id_produk = $1`,
      [id]
    );

    res.json({ success: true, message: 'Produk berhasil dihapus' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal hapus produk' });
  }
};

// ================= EXPORT (SATU SAJA!) =================
module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getFlashSaleProducts,
  searchProducts,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct
};