const pool = require('../config/database');

// Admin dashboard stats
const getAdminStats = async (req, res) => {
    try {
        const [
            userCount,
            productCount,
            orderCount,
            revenue,
            recentOrders
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'pelanggan'`),
            pool.query(`SELECT COUNT(*) as count FROM produk WHERE is_active = true`),
            pool.query(`SELECT COUNT(*) as count FROM transaksi`),
            pool.query(`SELECT COALESCE(SUM(grand_total), 0) as total FROM transaksi WHERE status_order = 'selesai'`),
            pool.query(`
                SELECT t.*, u.name as user_name, u.avatar
                FROM transaksi t
                JOIN users u ON t.id_user = u.id_user
                ORDER BY t.created_at DESC
                LIMIT 10
            `)
        ]);
        
        res.json({
            success: true,
            stats: {
                total_users: parseInt(userCount.rows[0].count),
                total_products: parseInt(productCount.rows[0].count),
                total_orders: parseInt(orderCount.rows[0].count),
                total_revenue: parseFloat(revenue.rows[0].total)
            },
            recent_orders: recentOrders.rows
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Seller dashboard stats
const getSellerStats = async (req, res) => {
    try {
        // Get seller's toko
        const tokoResult = await pool.query(
            `SELECT id_toko FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.json({ success: true, stats: null, message: 'Anda belum memiliki toko' });
        }
        
        const id_toko = tokoResult.rows[0].id_toko;
        
        const [
            productCount,
            orderCount,
            revenue,
            pendingOrders,
            recentOrders
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) as count FROM produk WHERE id_toko = $1 AND is_active = true`, [id_toko]),
            pool.query(`
                SELECT COUNT(*) as count FROM detail_transaksi dt 
                WHERE dt.id_toko = $1`, [id_toko]),
            pool.query(`
                SELECT COALESCE(SUM(dt.subtotal), 0) as total 
                FROM detail_transaksi dt
                JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                WHERE dt.id_toko = $1 AND t.status_order = 'selesai'`, [id_toko]),
            pool.query(`
                SELECT COUNT(*) as count FROM transaksi t
                JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                WHERE dt.id_toko = $1 AND t.status_order = 'pending'`, [id_toko]),
            pool.query(`
                SELECT t.*, u.name as user_name, u.avatar, dt.nama_produk_saat_transaksi as product_name, dt.jumlah
                FROM transaksi t
                JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                JOIN users u ON t.id_user = u.id_user
                WHERE dt.id_toko = $1
                ORDER BY t.created_at DESC
                LIMIT 10`, [id_toko])
        ]);
        
        res.json({
            success: true,
            stats: {
                total_products: parseInt(productCount.rows[0].count),
                total_orders: parseInt(orderCount.rows[0].count),
                total_revenue: parseFloat(revenue.rows[0].total),
                pending_orders: parseInt(pendingOrders.rows[0].count)
            },
            recent_orders: recentOrders.rows
        });
    } catch (error) {
        console.error('Get seller stats error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// User dashboard stats
const getUserStats = async (req, res) => {
    try {
        const [
            orderCount,
            totalSpent,
            wishlistCount,
            recentOrders
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) as count FROM transaksi WHERE id_user = $1`, [req.user.id_user]),
            pool.query(`SELECT COALESCE(SUM(grand_total), 0) as total FROM transaksi WHERE id_user = $1 AND status_order = 'selesai'`, [req.user.id_user]),
            pool.query(`SELECT COUNT(*) as count FROM wishlist WHERE id_user = $1`, [req.user.id_user]),
            pool.query(`
                SELECT t.*, COUNT(dt.id_detail) as item_count
                FROM transaksi t
                LEFT JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                WHERE t.id_user = $1
                GROUP BY t.id_transaksi
                ORDER BY t.created_at DESC
                LIMIT 5`, [req.user.id_user])
        ]);
        
        res.json({
            success: true,
            stats: {
                total_orders: parseInt(orderCount.rows[0].count),
                total_spent: parseFloat(totalSpent.rows[0].total),
                wishlist_count: parseInt(wishlistCount.rows[0].count)
            },
            recent_orders: recentOrders.rows
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getAdminStats, getSellerStats, getUserStats };