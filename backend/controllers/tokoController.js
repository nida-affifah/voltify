const pool = require('../config/database');

// Get toko by ID
const getTokoById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT t.*, u.name as pemilik_name, u.avatar as pemilik_avatar
             FROM toko t
             JOIN users u ON t.id_seller = u.id_user
             WHERE t.id_toko = $1 AND t.is_active = true`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
        }
        
        const toko = result.rows[0];
        
        // Get produk count
        const productsCount = await pool.query(
            `SELECT COUNT(*) as total FROM produk WHERE id_toko = $1 AND is_active = true`,
            [id]
        );
        
        // Get reviews
        const reviews = await pool.query(
            `SELECT r.*, u.name, u.avatar
             FROM review_produk r
             JOIN produk p ON r.id_produk = p.id_produk
             JOIN users u ON r.id_user = u.id_user
             WHERE p.id_toko = $1
             ORDER BY r.created_at DESC
             LIMIT 10`,
            [id]
        );
        
        res.json({ 
            success: true, 
            toko: { ...toko, total_produk: parseInt(productsCount.rows[0].total) },
            reviews: reviews.rows
        });
    } catch (error) {
        console.error('Get toko error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Follow toko
const followToko = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `INSERT INTO follow_toko (id_user, id_toko) VALUES ($1, $2)`,
            [req.user.id_user, id]
        );
        
        res.json({ success: true, message: 'Berhasil mengikuti toko' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Anda sudah mengikuti toko ini' });
        }
        console.error('Follow toko error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Unfollow toko
const unfollowToko = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `DELETE FROM follow_toko WHERE id_user = $1 AND id_toko = $2`,
            [req.user.id_user, id]
        );
        
        res.json({ success: true, message: 'Berhenti mengikuti toko' });
    } catch (error) {
        console.error('Unfollow toko error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Check if following
const checkFollow = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_follow FROM follow_toko WHERE id_user = $1 AND id_toko = $2`,
            [req.user.id_user, id]
        );
        
        res.json({ success: true, is_following: result.rows.length > 0 });
    } catch (error) {
        console.error('Check follow error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getTokoById, followToko, unfollowToko, checkFollow };
