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
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get affiliate stats
const getAffiliateStats = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, 
                    COUNT(DISTINCT al.id_link) as total_links,
                    COALESCE(SUM(al.total_klik), 0) as total_clicks,
                    COALESCE(SUM(al.total_konversi), 0) as total_conversions,
                    COALESCE(SUM(k.jumlah_komisi), 0) as total_commission,
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
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
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
             VALUES ($1, $2, $3) RETURNING *`,
            [id_affiliate, id_produk, link_code]
        );
        res.json({ success: true, link: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get commission history
const getCommissionHistory = async (req, res) => {
    try {
        const affiliateResult = await pool.query(
            `SELECT id_affiliate FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        if (affiliateResult.rows.length === 0) {
            return res.json({ success: true, commissions: [] });
        }
        const result = await pool.query(
            `SELECT k.*, t.invoice_number, t.grand_total
             FROM komisi_affiliate k
             LEFT JOIN transaksi t ON k.id_transaksi = t.id_transaksi
             WHERE k.id_affiliate = $1
             ORDER BY k.created_at DESC`,
            [affiliateResult.rows[0].id_affiliate]
        );
        res.json({ success: true, commissions: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Withdraw commission
const withdrawCommission = async (req, res) => {
    const { amount, bank_name, account_number, account_name } = req.body;
    try {
        const affiliateResult = await pool.query(
            `SELECT id_affiliate, total_komisi FROM affiliate WHERE id_user = $1`,
            [req.user.id_user]
        );
        if (affiliateResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Anda belum terdaftar sebagai affiliate' });
        }
        const affiliate = affiliateResult.rows[0];
        if (affiliate.total_komisi < amount) {
            return res.status(400).json({ success: false, message: 'Komisi tidak mencukupi' });
        }
        // Proses withdraw (simpan ke tabel withdraw)
        await pool.query(
            `UPDATE affiliate SET total_komisi = total_komisi - $1 WHERE id_affiliate = $2`,
            [amount, affiliate.id_affiliate]
        );
        res.json({ success: true, message: 'Withdraw berhasil diproses' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAffiliateInfo,
    getAffiliateStats,
    getAffiliateLinks,
    createAffiliateLink,
    getCommissionHistory,
    withdrawCommission
};
