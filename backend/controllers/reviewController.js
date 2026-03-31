const pool = require('../config/database');

// Get product reviews
const getProductReviews = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        let orderBy = '';
        if (sort === 'newest') orderBy = 'r.created_at DESC';
        else if (sort === 'oldest') orderBy = 'r.created_at ASC';
        else if (sort === 'highest') orderBy = 'r.rating DESC';
        else if (sort === 'lowest') orderBy = 'r.rating ASC';
        
        const result = await pool.query(
            `SELECT r.*, u.username, u.name, u.avatar
             FROM review_produk r
             JOIN users u ON r.id_user = u.id_user
             WHERE r.id_produk = $1
             ORDER BY ${orderBy}
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );
        
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM review_produk WHERE id_produk = $1`,
            [id]
        );
        
        const ratingStats = await pool.query(
            `SELECT 
                AVG(rating) as avg_rating,
                COUNT(*) as total_reviews,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1
             FROM review_produk
             WHERE id_produk = $1`,
            [id]
        );
        
        res.json({
            success: true,
            reviews: result.rows,
            stats: ratingStats.rows[0],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Add review
const addReview = async (req, res) => {
    const { id } = req.params;
    const { rating, komentar, gambar } = req.body;
    
    try {
        // Check if user has purchased this product
        const purchaseCheck = await pool.query(
            `SELECT dt.id_detail FROM detail_transaksi dt
             JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
             WHERE dt.id_produk = $1 AND t.id_user = $2 AND t.status_order = 'selesai'
             LIMIT 1`,
            [id, req.user.id_user]
        );
        
        if (purchaseCheck.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Anda hanya dapat memberikan review untuk produk yang sudah dibeli' });
        }
        
        // Check if already reviewed
        const existingReview = await pool.query(
            `SELECT id_review FROM review_produk WHERE id_produk = $1 AND id_user = $2`,
            [id, req.user.id_user]
        );
        
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Anda sudah memberikan review untuk produk ini' });
        }
        
        const result = await pool.query(
            `INSERT INTO review_produk (id_produk, id_user, rating, komentar, gambar, is_verified_purchase)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING *`,
            [id, req.user.id_user, rating, komentar, gambar ? [gambar] : null]
        );
        
        // Update product rating
        await pool.query(
            `UPDATE produk 
             SET rating_avg = (SELECT AVG(rating) FROM review_produk WHERE id_produk = $1),
                 total_review = (SELECT COUNT(*) FROM review_produk WHERE id_produk = $1)
             WHERE id_produk = $1`,
            [id]
        );
        
        res.json({ success: true, message: 'Review berhasil ditambahkan', review: result.rows[0] });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Seller reply to review
const replyReview = async (req, res) => {
    const { id } = req.params;
    const { balasan } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE review_produk 
             SET balasan_toko = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_review = $2
             RETURNING *`,
            [balasan, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Balasan berhasil ditambahkan', review: result.rows[0] });
    } catch (error) {
        console.error('Reply review error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getProductReviews, addReview, replyReview };