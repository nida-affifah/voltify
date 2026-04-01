const pool = require('../config/database');

// Get live streams
const getLiveStreams = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ls.*, t.nama_toko, t.logo as toko_logo
             FROM live_stream ls
             JOIN toko t ON ls.id_toko = t.id_toko
             WHERE ls.status IN ('live', 'scheduled')
             ORDER BY 
                 CASE WHEN ls.status = 'live' THEN 1 ELSE 2 END,
                 ls.start_time ASC`
        );
        
        res.json({ success: true, live_streams: result.rows });
    } catch (error) {
        console.error('Get live streams error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get live stream by ID
const getLiveStreamById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const streamResult = await pool.query(
            `SELECT ls.*, t.nama_toko, t.logo as toko_logo, t.id_seller
             FROM live_stream ls
             JOIN toko t ON ls.id_toko = t.id_toko
             WHERE ls.id_live = $1`,
            [id]
        );
        
        if (streamResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Live stream tidak ditemukan' });
        }
        
        const stream = streamResult.rows[0];
        
        const productsResult = await pool.query(
            `SELECT lp.*, p.nama_produk, p.harga, p.harga_diskon, p.gambar_utama
             FROM live_product lp
             JOIN produk p ON lp.id_produk = p.id_produk
             WHERE lp.id_live = $1
             ORDER BY lp.urutan ASC`,
            [id]
        );
        
        res.json({ 
            success: true, 
            stream: { ...stream, produk: productsResult.rows }
        });
    } catch (error) {
        console.error('Get live stream error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Create live stream (seller only)
const createLiveStream = async (req, res) => {
    const { id_toko, judul, deskripsi, start_time } = req.body;
    
    try {
        // Check if seller owns the toko
        const tokoCheck = await pool.query(
            `SELECT id_toko FROM toko WHERE id_toko = $1 AND id_seller = $2`,
            [id_toko, req.user.id_user]
        );
        
        if (tokoCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke toko ini' });
        }
        
        const result = await pool.query(
            `INSERT INTO live_stream (id_toko, id_host, judul, deskripsi, start_time, status)
             VALUES ($1, $2, $3, $4, $5, 'scheduled')
             RETURNING *`,
            [id_toko, req.user.id_user, judul, deskripsi, start_time]
        );
        
        res.json({ success: true, message: 'Live stream berhasil dijadwalkan', stream: result.rows[0] });
    } catch (error) {
        console.error('Create live stream error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getLiveStreams, getLiveStreamById, createLiveStream };
