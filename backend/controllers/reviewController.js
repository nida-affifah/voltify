const pool = require('../config/database');

// Create review
const createReview = async (req, res) => {
  const { id_produk, rating, komentar, id_transaksi } = req.body;
  const userId = req.user.id_user;
  
  console.log('Creating review:', { id_produk, rating, komentar, id_transaksi, userId });
  
  try {
    // Cek apakah user sudah membeli produk ini
    const checkPurchase = await pool.query(
      `SELECT * FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE dt.id_produk = $1 AND t.id_user = $2 AND t.status_order = 'completed'`,
      [id_produk, userId]
    );
    
    // Cek apakah sudah pernah review
    const existingReview = await pool.query(
      'SELECT * FROM review_produk WHERE id_produk = $1 AND id_user = $2',
      [id_produk, userId]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Anda sudah pernah mereview produk ini' });
    }
    
    // Insert review
    const result = await pool.query(
      `INSERT INTO review_produk (id_produk, id_user, rating, komentar, id_transaksi, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_produk, userId, rating, komentar, id_transaksi, checkPurchase.rows.length > 0]
    );
    
    // Update rating rata-rata produk
    await pool.query(
      `UPDATE produk 
       SET rating_avg = (
         SELECT AVG(rating) FROM review_produk WHERE id_produk = $1
       )
       WHERE id_produk = $1`,
      [id_produk]
    );
    
    res.json({ success: true, review: result.rows[0], message: 'Ulasan berhasil dikirim' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT r.*, u.name, u.avatar 
       FROM review_produk r
       JOIN users u ON r.id_user = u.id_user
       WHERE r.id_produk = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user reviews
const getUserReviews = async (req, res) => {
  const userId = req.user.id_user;
  
  try {
    const result = await pool.query(
      `SELECT r.*, p.nama_produk, p.gambar_utama
       FROM review_produk r
       JOIN produk p ON r.id_produk = p.id_produk
       WHERE r.id_user = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews
};
