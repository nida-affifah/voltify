const pool = require('../config/database');

// Get user addresses
const getAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM alamat_pengiriman WHERE id_user = $1 ORDER BY is_primary DESC, created_at DESC`,
            [req.user.id_user]
        );
        
        res.json({ success: true, addresses: result.rows });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Add address
const addAddress = async (req, res) => {
    const { label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary } = req.body;
    
    try {
        if (is_primary) {
            await pool.query(
                `UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`,
                [req.user.id_user]
            );
        }
        
        const result = await pool.query(
            `INSERT INTO alamat_pengiriman (id_user, label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [req.user.id_user, label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary || false]
        );
        
        res.json({ success: true, message: 'Alamat berhasil ditambahkan', address: result.rows[0] });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary } = req.body;
    
    try {
        if (is_primary) {
            await pool.query(
                `UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`,
                [req.user.id_user]
            );
        }
        
        const result = await pool.query(
            `UPDATE alamat_pengiriman 
             SET label = COALESCE($1, label),
                 penerima = COALESCE($2, penerima),
                 no_hp = COALESCE($3, no_hp),
                 alamat_lengkap = COALESCE($4, alamat_lengkap),
                 provinsi = COALESCE($5, provinsi),
                 kota = COALESCE($6, kota),
                 kecamatan = COALESCE($7, kecamatan),
                 kode_pos = COALESCE($8, kode_pos),
                 is_primary = COALESCE($9, is_primary)
             WHERE id_alamat = $10 AND id_user = $11
             RETURNING *`,
            [label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary, id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Alamat berhasil diperbarui', address: result.rows[0] });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `DELETE FROM alamat_pengiriman WHERE id_alamat = $1 AND id_user = $2 RETURNING *`,
            [id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Alamat berhasil dihapus' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Set primary address
const setPrimaryAddress = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        const result = await pool.query(
            `UPDATE alamat_pengiriman SET is_primary = true WHERE id_alamat = $1 AND id_user = $2 RETURNING *`,
            [id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Alamat tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Alamat utama berhasil diubah', address: result.rows[0] });
    } catch (error) {
        console.error('Set primary address error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get user notifications
const getNotifications = async (req, res) => {
    const { limit = 20 } = req.query;
    
    try {
        const result = await pool.query(
            `SELECT * FROM notifikasi 
             WHERE id_user = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [req.user.id_user, limit]
        );
        
        const unreadCount = await pool.query(
            `SELECT COUNT(*) as count FROM notifikasi WHERE id_user = $1 AND is_read = false`,
            [req.user.id_user]
        );
        
        res.json({ 
            success: true, 
            notifications: result.rows,
            unread_count: parseInt(unreadCount.rows[0].count)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            `UPDATE notifikasi SET is_read = true WHERE id_notifikasi = $1 AND id_user = $2`,
            [id, req.user.id_user]
        );
        
        res.json({ success: true, message: 'Notifikasi ditandai sebagai sudah dibaca' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifikasi SET is_read = true WHERE id_user = $1 AND is_read = false`,
            [req.user.id_user]
        );
        
        res.json({ success: true, message: 'Semua notifikasi ditandai sebagai sudah dibaca' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setPrimaryAddress,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
};