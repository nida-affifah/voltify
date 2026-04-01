const pool = require('../config/database');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM kategori WHERE is_active = true ORDER BY level, nama_kategori`
        );
        
        res.json({ success: true, categories: result.rows });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT * FROM kategori WHERE id_kategori = $1 AND is_active = true`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        }
        
        res.json({ success: true, category: result.rows[0] });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get produk by category
const getProductsByCategory = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const result = await pool.query(
            `SELECT p.*, t.nama_toko
             FROM produk p
             JOIN toko t ON p.id_toko = t.id_toko
             WHERE p.id_kategori = $1 AND p.is_active = true
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );
        
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM produk WHERE id_kategori = $1 AND is_active = true`,
            [id]
        );
        
        res.json({
            success: true,
            produk: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total)
            }
        });
    } catch (error) {
        console.error('Get produk by category error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getCategories, getCategoryById, getProductsByCategory };
