const pool = require('../config/database');

// Get user wishlist
const getWishlist = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT w.id_wishlist, w.id_produk, w.created_at,
                    p.nama_produk, p.slug, p.harga, p.harga_diskon, p.gambar_utama,
                    p.rating_avg, p.total_terjual,
                    t.nama_toko, t.slug as toko_slug
             FROM wishlist w
             JOIN produk p ON w.id_produk = p.id_produk
             JOIN toko t ON p.id_toko = t.id_toko
             WHERE w.id_user = $1
             ORDER BY w.created_at DESC`,
            [req.user.id_user]
        );
        
        res.json({ success: true, wishlist: result.rows });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
    const { id_produk } = req.body;
    
    try {
        const existing = await pool.query(
            `SELECT id_wishlist FROM wishlist WHERE id_user = $1 AND id_produk = $2`,
            [req.user.id_user, id_produk]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Produk sudah ada di wishlist' });
        }
        
        const result = await pool.query(
            `INSERT INTO wishlist (id_user, id_produk) VALUES ($1, $2) RETURNING *`,
            [req.user.id_user, id_produk]
        );
        
        res.json({ success: true, message: 'Produk ditambahkan ke wishlist', wishlist: result.rows[0] });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `DELETE FROM wishlist WHERE id_wishlist = $1 AND id_user = $2 RETURNING *`,
            [id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item wishlist tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Produk dihapus dari wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Check if product in wishlist
const checkWishlist = async (req, res) => {
    const { id_produk } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT id_wishlist FROM wishlist WHERE id_user = $1 AND id_produk = $2`,
            [req.user.id_user, id_produk]
        );
        
        res.json({ success: true, is_in_wishlist: result.rows.length > 0 });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, checkWishlist };
