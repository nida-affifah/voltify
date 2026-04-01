const pool = require('../config/database');

// Get delivery list for kurir
const getDeliveryList = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, t.invoice_number, t.grand_total,
                    a.penerima, a.alamat_lengkap, a.kota, a.provinsi, a.no_hp,
                    u.name as customer_name, u.phone as customer_phone
             FROM pengiriman p
             JOIN transaksi t ON p.id_transaksi = t.id_transaksi
             JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
             JOIN users u ON t.id_user = u.id_user
             WHERE p.status_pengiriman != 'delivered'
             ORDER BY p.id_pengiriman DESC`
        );
        res.json({ success: true, deliveries: result.rows });
    } catch (error) {
        console.error('Get delivery list error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get today's delivery
const getTodayDelivery = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, t.invoice_number, t.grand_total,
                    a.penerima, a.alamat_lengkap, a.kota, a.provinsi, a.no_hp,
                    u.name as customer_name
             FROM pengiriman p
             JOIN transaksi t ON p.id_transaksi = t.id_transaksi
             JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
             JOIN users u ON t.id_user = u.id_user
             WHERE DATE(p.tanggal_kirim) = CURRENT_DATE
             ORDER BY p.id_pengiriman DESC`
        );
        res.json({ success: true, deliveries: result.rows });
    } catch (error) {
        console.error('Get today delivery error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get delivery history
const getDeliveryHistory = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, t.invoice_number, t.grand_total,
                    a.penerima, a.alamat_lengkap, a.kota
             FROM pengiriman p
             JOIN transaksi t ON p.id_transaksi = t.id_transaksi
             JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
             WHERE p.status_pengiriman = 'delivered'
             ORDER BY p.tanggal_sampai DESC
             LIMIT 50`
        );
        res.json({ success: true, deliveries: result.rows });
    } catch (error) {
        console.error('Get delivery history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get delivery detail by ID
const getDeliveryDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, t.invoice_number, t.grand_total, t.created_at as order_date,
                    a.penerima, a.alamat_lengkap, a.kota, a.provinsi, a.kode_pos, a.no_hp,
                    u.name as customer_name, u.email as customer_email
             FROM pengiriman p
             JOIN transaksi t ON p.id_transaksi = t.id_transaksi
             JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
             JOIN users u ON t.id_user = u.id_user
             WHERE p.id_pengiriman = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Delivery not found' });
        }
        res.json({ success: true, delivery: result.rows[0] });
    } catch (error) {
        console.error('Get delivery detail error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['menunggu_pickup', 'dipickup', 'dalam_perjalanan', 'sampai_tujuan', 'delivered'];
    if (!validStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }

    try {
        const result = await pool.query(
            `UPDATE pengiriman
             SET status_pengiriman = $1,
                 tanggal_pickup = CASE WHEN $1 = 'dipickup' AND tanggal_pickup IS NULL THEN CURRENT_TIMESTAMP ELSE tanggal_pickup END,
                 tanggal_kirim = CASE WHEN $1 = 'dalam_perjalanan' AND tanggal_kirim IS NULL THEN CURRENT_TIMESTAMP ELSE tanggal_kirim END,
                 tanggal_sampai = CASE WHEN $1 = 'delivered' THEN CURRENT_TIMESTAMP ELSE tanggal_sampai END
             WHERE id_pengiriman = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Delivery not found' });
        }

        // If status is delivered, update transaction status
        if (status === 'delivered') {
            await pool.query(
                `UPDATE transaksi SET status_pengiriman = 'delivered', delivered_at = CURRENT_TIMESTAMP
                 WHERE id_transaksi = (SELECT id_transaksi FROM pengiriman WHERE id_pengiriman = $1)`,
                [id]
            );
        }

        res.json({ success: true, message: 'Status updated', delivery: result.rows[0] });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getDeliveryList,
    getTodayDelivery,
    getDeliveryHistory,
    getDeliveryDetail,
    updateDeliveryStatus
};
