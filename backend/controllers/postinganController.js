const pool = require('../config/database');

// Get all postingan
const getPostingan = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const result = await pool.query(
            `SELECT p.*, u.username, u.name, u.avatar as user_avatar,
                    pr.id_produk, pr.nama_produk as produk_nama, pr.gambar_utama as produk_gambar, pr.harga as produk_harga,
                    CASE WHEN pl.id_like IS NOT NULL THEN true ELSE false END as is_liked
             FROM postingan p
             JOIN users u ON p.id_user = u.id_user
             LEFT JOIN produk pr ON p.id_produk = pr.id_produk
             LEFT JOIN postingan_like pl ON p.id_postingan = pl.id_postingan AND pl.id_user = $1
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user?.id_user || null, limit, offset]
        );
        
        const countResult = await pool.query(`SELECT COUNT(*) as total FROM postingan`);
        
        res.json({
            success: true,
            postingan: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
            }
        });
    } catch (error) {
        console.error('Get postingan error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Create postingan
const createPostingan = async (req, res) => {
    const { konten, id_produk, gambar } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO postingan (id_user, id_produk, konten, gambar)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id_user, id_produk || null, konten, gambar || null]
        );
        
        res.json({ success: true, message: 'Postingan berhasil dibuat', postingan: result.rows[0] });
    } catch (error) {
        console.error('Create postingan error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Like postingan
const likePostingan = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `INSERT INTO postingan_like (id_postingan, id_user) VALUES ($1, $2)`,
            [id, req.user.id_user]
        );
        
        await pool.query(
            `UPDATE postingan SET total_likes = total_likes + 1 WHERE id_postingan = $1`,
            [id]
        );
        
        res.json({ success: true, message: 'Berhasil menyukai postingan' });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Anda sudah menyukai postingan ini' });
        }
        console.error('Like postingan error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Unlike postingan
const unlikePostingan = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `DELETE FROM postingan_like WHERE id_postingan = $1 AND id_user = $2`,
            [id, req.user.id_user]
        );
        
        await pool.query(
            `UPDATE postingan SET total_likes = total_likes - 1 WHERE id_postingan = $1`,
            [id]
        );
        
        res.json({ success: true, message: 'Berhasil membatalkan like' });
    } catch (error) {
        console.error('Unlike postingan error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get comments
const getComments = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT c.*, u.username, u.name, u.avatar as user_avatar
             FROM postingan_comment c
             JOIN users u ON c.id_user = u.id_user
             WHERE c.id_postingan = $1
             ORDER BY c.created_at ASC`,
            [id]
        );
        
        res.json({ success: true, comments: result.rows });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Add comment
const addComment = async (req, res) => {
    const { id } = req.params;
    const { komentar } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO postingan_comment (id_postingan, id_user, komentar)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, req.user.id_user, komentar]
        );
        
        await pool.query(
            `UPDATE postingan SET total_comments = total_comments + 1 WHERE id_postingan = $1`,
            [id]
        );
        
        res.json({ success: true, message: 'Komentar berhasil ditambahkan', comment: result.rows[0] });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getPostingan, createPostingan, likePostingan, unlikePostingan, getComments, addComment };