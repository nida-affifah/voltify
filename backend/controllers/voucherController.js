const pool = require('../config/database');

// Get available vouchers
const getVouchers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM voucher_marketplace 
             WHERE is_active = true 
             AND CURRENT_TIMESTAMP BETWEEN berlaku_mulai AND berlaku_sampai
             AND sisa_kuota > 0
             ORDER BY created_at DESC`
        );
        
        res.json({ success: true, vouchers: result.rows });
    } catch (error) {
        console.error('Get vouchers error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Apply voucher
const applyVoucher = async (req, res) => {
    const { code, subtotal } = req.body;
    
    try {
        const result = await pool.query(
            `SELECT * FROM voucher_marketplace 
             WHERE kode_voucher = $1 AND is_active = true 
             AND CURRENT_TIMESTAMP BETWEEN berlaku_mulai AND berlaku_sampai
             AND sisa_kuota > 0`,
            [code]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Voucher tidak valid atau sudah habis masa berlaku' });
        }
        
        const voucher = result.rows[0];
        
        if (subtotal < voucher.minimal_belanja) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimal belanja ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(voucher.minimal_belanja)} untuk menggunakan voucher ini` 
            });
        }
        
        let discount = 0;
        
        if (voucher.tipe === 'potongan_harga') {
            discount = Math.min(voucher.nilai, voucher.maksimal_potongan || voucher.nilai);
        } else if (voucher.tipe === 'persen') {
            discount = (subtotal * voucher.nilai / 100);
            if (voucher.maksimal_potongan) {
                discount = Math.min(discount, voucher.maksimal_potongan);
            }
        } else if (voucher.tipe === 'gratis_ongkir') {
            discount = voucher.nilai;
        }
        
        res.json({ 
            success: true, 
            message: 'Voucher berhasil diterapkan',
            voucher: voucher,
            discount: discount
        });
    } catch (error) {
        console.error('Apply voucher error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get user vouchers
const getUserVouchers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT v.*, vu.is_used, vu.created_at as obtained_at
             FROM voucher_user vu
             JOIN voucher_marketplace v ON vu.id_voucher = v.id_voucher
             WHERE vu.id_user = $1 AND vu.is_used = false
             AND CURRENT_TIMESTAMP BETWEEN v.berlaku_mulai AND v.berlaku_sampai
             ORDER BY v.created_at DESC`,
            [req.user.id_user]
        );
        
        res.json({ success: true, vouchers: result.rows });
    } catch (error) {
        console.error('Get user vouchers error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getVouchers, applyVoucher, getUserVouchers };