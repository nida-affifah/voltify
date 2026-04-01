const pool = require('../config/database');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_user, username, name, email, phone, avatar, bio, gender, birth_date,
                    follower_count, following_count, is_verified, id_tier, saldo, coin
             FROM users WHERE id_user = $1`,
            [req.user.id_user]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    const { name, phone, bio, gender, birth_date } = req.body;
    try {
        const result = await pool.query(
            `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
             bio = COALESCE($3, bio), gender = COALESCE($4, gender),
             birth_date = COALESCE($5, birth_date), updated_at = CURRENT_TIMESTAMP
             WHERE id_user = $6 RETURNING id_user, username, name, email, phone, avatar, bio, gender, birth_date`,
            [name, phone, bio, gender, birth_date, req.user.id_user]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get addresses
const getAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM alamat_pengiriman WHERE id_user = $1 ORDER BY is_primary DESC, created_at DESC`,
            [req.user.id_user]
        );
        res.json({ success: true, addresses: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add address
const addAddress = async (req, res) => {
    const { label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary } = req.body;
    try {
        if (is_primary) {
            await pool.query(`UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`, [req.user.id_user]);
        }
        const result = await pool.query(
            `INSERT INTO alamat_pengiriman (id_user, label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.user.id_user, label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary || false]
        );
        res.json({ success: true, address: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary } = req.body;
    try {
        if (is_primary) {
            await pool.query(`UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`, [req.user.id_user]);
        }
        const result = await pool.query(
            `UPDATE alamat_pengiriman SET label = COALESCE($1, label), penerima = COALESCE($2, penerima),
             no_hp = COALESCE($3, no_hp), alamat_lengkap = COALESCE($4, alamat_lengkap),
             provinsi = COALESCE($5, provinsi), kota = COALESCE($6, kota),
             kecamatan = COALESCE($7, kecamatan), kode_pos = COALESCE($8, kode_pos),
             is_primary = COALESCE($9, is_primary)
             WHERE id_alamat = $10 AND id_user = $11 RETURNING *`,
            [label, penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos, is_primary, id, req.user.id_user]
        );
        res.json({ success: true, address: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM alamat_pengiriman WHERE id_alamat = $1 AND id_user = $2`, [id, req.user.id_user]);
        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Set primary address
const setPrimaryAddress = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`UPDATE alamat_pengiriman SET is_primary = false WHERE id_user = $1`, [req.user.id_user]);
        await pool.query(`UPDATE alamat_pengiriman SET is_primary = true WHERE id_alamat = $1 AND id_user = $2`, [id, req.user.id_user]);
        res.json({ success: true, message: 'Primary address set' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get notifications
const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM notifikasi WHERE id_user = $1 ORDER BY created_at DESC LIMIT 20`,
            [req.user.id_user]
        );
        const unreadCount = await pool.query(
            `SELECT COUNT(*) FROM notifikasi WHERE id_user = $1 AND is_read = false`,
            [req.user.id_user]
        );
        res.json({ success: true, notifications: result.rows, unread_count: parseInt(unreadCount.rows[0].count) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`UPDATE notifikasi SET is_read = true WHERE id_notifikasi = $1 AND id_user = $2`, [id, req.user.id_user]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    getNotifications,
    markNotificationRead
};
