const pool = require('../config/database');

// Get seller dashboard stats
const getSellerDashboard = async (req, res) => {
    try {
        // Get seller's store
        const tokoResult = await pool.query(
            `SELECT id_toko, nama_toko, slug, rating, total_produk, total_penjualan, is_official
             FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.json({ success: true, hasStore: false, message: 'Anda belum memiliki toko' });
        }
        
        const toko = tokoResult.rows[0];
        const id_toko = toko.id_toko;
        
        // Get stats
        const [
            productCount,
            orderCount,
            revenue,
            pendingOrders,
            recentOrders,
            topProducts
        ] = await Promise.all([
            pool.query(`SELECT COUNT(*) as count FROM produk WHERE id_toko = $1 AND is_active = true`, [id_toko]),
            pool.query(`
                SELECT COUNT(DISTINCT t.id_transaksi) as count 
                FROM detail_transaksi dt
                JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                WHERE dt.id_toko = $1`, [id_toko]),
            pool.query(`
                SELECT COALESCE(SUM(dt.subtotal), 0) as total 
                FROM detail_transaksi dt
                JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                WHERE dt.id_toko = $1 AND t.status_order = 'selesai'`, [id_toko]),
            pool.query(`
                SELECT COUNT(DISTINCT t.id_transaksi) as count 
                FROM detail_transaksi dt
                JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                WHERE dt.id_toko = $1 AND t.status_order = 'pending'`, [id_toko]),
            pool.query(`
                SELECT t.*, u.name as customer_name, dt.nama_produk_saat_transaksi as product_name, dt.jumlah
                FROM transaksi t
                JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
                JOIN users u ON t.id_user = u.id_user
                WHERE dt.id_toko = $1
                ORDER BY t.created_at DESC
                LIMIT 10`, [id_toko]),
            pool.query(`
                SELECT p.id_produk, p.nama_produk, p.harga, p.stok, p.total_terjual,
                       COALESCE(SUM(dt.jumlah), 0) as sold_this_month
                FROM produk p
                LEFT JOIN detail_transaksi dt ON p.id_produk = dt.id_produk
                LEFT JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                WHERE p.id_toko = $1 AND p.is_active = true
                GROUP BY p.id_produk
                ORDER BY p.total_terjual DESC
                LIMIT 5`, [id_toko])
        ]);
        
        res.json({
            success: true,
            hasStore: true,
            toko: {
                ...toko,
                total_produk: parseInt(productCount.rows[0].count),
                total_penjualan: parseInt(orderCount.rows[0].count),
                total_revenue: parseFloat(revenue.rows[0].total),
                pending_orders: parseInt(pendingOrders.rows[0].count)
            },
            recent_orders: recentOrders.rows,
            top_products: topProducts.rows
        });
    } catch (error) {
        console.error('Get seller dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get store produk
const getStoreProducts = async (req, res) => {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const tokoResult = await pool.query(
            `SELECT id_toko FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
        }
        
        const id_toko = tokoResult.rows[0].id_toko;
        
        let query = `
            SELECT p.*, k.nama_kategori
            FROM produk p
            JOIN kategori k ON p.id_kategori = k.id_kategori
            WHERE p.id_toko = $1
        `;
        const values = [id_toko];
        let idx = 2;
        
        if (search) {
            query += ` AND p.nama_produk ILIKE $${idx}`;
            values.push(`%${search}%`);
            idx++;
        }
        
        if (status === 'active') {
            query += ` AND p.is_active = true`;
        } else if (status === 'inactive') {
            query += ` AND p.is_active = false`;
        }
        
        query += ` ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
        values.push(limit, offset);
        
        const result = await pool.query(query, values);
        
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM produk WHERE id_toko = $1`,
            [id_toko]
        );
        
        res.json({
            success: true,
            produk: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
            }
        });
    } catch (error) {
        console.error('Get store produk error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get store orders
const getStoreOrders = async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const tokoResult = await pool.query(
            `SELECT id_toko FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
        }
        
        const id_toko = tokoResult.rows[0].id_toko;
        
        let query = `
            SELECT DISTINCT t.*, u.name as customer_name, u.phone as customer_phone,
                   a.alamat_lengkap, a.kota, a.provinsi
            FROM transaksi t
            JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
            JOIN users u ON t.id_user = u.id_user
            JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
            WHERE dt.id_toko = $1
        `;
        const values = [id_toko];
        let idx = 2;
        
        if (status) {
            query += ` AND t.status_order = $${idx}`;
            values.push(status);
            idx++;
        }
        
        query += ` ORDER BY t.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
        values.push(limit, offset);
        
        const result = await pool.query(query, values);
        
        const countResult = await pool.query(
            `SELECT COUNT(DISTINCT t.id_transaksi) as total
             FROM transaksi t
             JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
             WHERE dt.id_toko = $1`,
            [id_toko]
        );
        
        res.json({
            success: true,
            orders: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
            }
        });
    } catch (error) {
        console.error('Get store orders error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update order status (seller)
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatus = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
    if (!validStatus.includes(status)) {
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    
    try {
        const result = await pool.query(
            `UPDATE transaksi 
             SET status_order = $1, updated_at = CURRENT_TIMESTAMP,
                 shipped_at = CASE WHEN $1 = 'dikirim' AND shipped_at IS NULL THEN CURRENT_TIMESTAMP ELSE shipped_at END,
                 delivered_at = CASE WHEN $1 = 'selesai' THEN CURRENT_TIMESTAMP ELSE delivered_at END
             WHERE id_transaksi = $2
             RETURNING *`,
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, message: 'Order status updated', order: result.rows[0] });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get store stats
const getStoreStats = async (req, res) => {
    try {
        const tokoResult = await pool.query(
            `SELECT id_toko FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
        }
        
        const id_toko = tokoResult.rows[0].id_toko;
        
        // Get daily sales for last 7 days
        const dailySales = await pool.query(`
            SELECT DATE(t.created_at) as date, COALESCE(SUM(dt.subtotal), 0) as total
            FROM transaksi t
            JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
            WHERE dt.id_toko = $1 AND t.status_order = 'selesai'
            AND t.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(t.created_at)
            ORDER BY date ASC
        `, [id_toko]);
        
        // Get top categories
        const topCategories = await pool.query(`
            SELECT k.nama_kategori, COUNT(*) as total_sold, SUM(dt.subtotal) as revenue
            FROM detail_transaksi dt
            JOIN produk p ON dt.id_produk = p.id_produk
            JOIN kategori k ON p.id_kategori = k.id_kategori
            WHERE dt.id_toko = $1
            GROUP BY k.id_kategori
            ORDER BY revenue DESC
            LIMIT 5
        `, [id_toko]);
        
        res.json({
            success: true,
            daily_sales: dailySales.rows,
            top_categories: topCategories.rows
        });
    } catch (error) {
        console.error('Get store stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get store reviews
const getStoreReviews = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        const tokoResult = await pool.query(
            `SELECT id_toko FROM toko WHERE id_seller = $1`,
            [req.user.id_user]
        );
        
        if (tokoResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
        }
        
        const id_toko = tokoResult.rows[0].id_toko;
        
        const result = await pool.query(`
            SELECT r.*, u.name as user_name, u.avatar, p.nama_produk
            FROM review_produk r
            JOIN produk p ON r.id_produk = p.id_produk
            JOIN users u ON r.id_user = u.id_user
            WHERE p.id_toko = $1
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
        `, [id_toko, limit, offset]);
        
        const countResult = await pool.query(`
            SELECT COUNT(*) as total
            FROM review_produk r
            JOIN produk p ON r.id_produk = p.id_produk
            WHERE p.id_toko = $1
        `, [id_toko]);
        
        res.json({
            success: true,
            reviews: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
            }
        });
    } catch (error) {
        console.error('Get store reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getSellerDashboard,
    getStoreProducts,
    getStoreOrders,
    updateOrderStatus,
    getStoreStats,
    getStoreReviews
};
