const pool = require('../config/database');

// Get affiliate info
const getAffiliateInfo = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.json({ success: true, affiliate: null });
        }
        
        res.json({ success: true, affiliate: result.rows[0] });
    } catch (error) {
        console.error('Get affiliate info error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Register as affiliate
const registerAffiliate = async (req, res) => {
    const { kode_affiliate } = req.body;
    
    try {
        const existing = await pool.query(
            `SELECT id_affiliate FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Anda sudah terdaftar sebagai affiliate' });
        }
        
        const result = await pool.query(
            `INSERT INTO affiliate (id_user, kode_affiliate)
             VALUES ($1, $2)
             RETURNING *`,
            [req.user.id_user, kode_affiliate]
        );
        
        res.json({ success: true, message: 'Berhasil mendaftar sebagai affiliate', affiliate: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Kode affiliate sudah digunakan' });
        }
        console.error('Register affiliate error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get affiliate stats
const getAffiliateStats = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, 
                    COUNT(DISTINCT al.id_link) as total_links,
                    SUM(al.total_klik) as total_clicks,
                    SUM(al.total_konversi) as total_conversions,
                    SUM(k.jumlah_komisi) as total_commission,
                    COUNT(CASE WHEN k.status = 'pending' THEN 1 END) as pending_commission
             FROM affiliate a
             LEFT JOIN affiliate_link al ON a.id_affiliate = al.id_affiliate
             LEFT JOIN komisi_affiliate k ON a.id_affiliate = k.id_affiliate
             WHERE a.id_user = $1
             GROUP BY a.id_affiliate`,
            [req.user.id_user]
        );
        
        res.json({ success: true, stats: result.rows[0] || null });
    } catch (error) {
        console.error('Get affiliate stats error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Create affiliate link
const createAffiliateLink = async (req, res) => {
    const { id_produk } = req.body;
    
    try {
        const affiliateResult = await pool.query(
            `SELECT id_affiliate FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        if (affiliateResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Anda belum terdaftar sebagai affiliate' });
        }
        
        const id_affiliate = affiliateResult.rows[0].id_affiliate;
        const link_code = `AFF-${req.user.id_user}-${id_produk}-${Date.now()}`;
        
        const result = await pool.query(
            `INSERT INTO affiliate_link (id_affiliate, id_produk, link_code)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id_affiliate, id_produk, link_code]
        );
        
        res.json({ success: true, link: result.rows[0] });
    } catch (error) {
        console.error('Create affiliate link error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get affiliate links
const getAffiliateLinks = async (req, res) => {
    try {
        const affiliateResult = await pool.query(
            `SELECT id_affiliate FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        if (affiliateResult.rows.length === 0) {
            return res.json({ success: true, links: [] });
        }
        
        const result = await pool.query(
            `SELECT al.*, p.nama_produk, p.harga, p.gambar_utama
             FROM affiliate_link al
             JOIN produk p ON al.id_produk = p.id_produk
             WHERE al.id_affiliate = $1
             ORDER BY al.created_at DESC`,
            [affiliateResult.rows[0].id_affiliate]
        );
        
        res.json({ success: true, links: result.rows });
    } catch (error) {
        console.error('Get affiliate links error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getAffiliateInfo, registerAffiliate, getAffiliateStats, createAffiliateLink, getAffiliateLinks };