const pool = require('../config/database');

// Get all products
const getProducts = async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        category, 
        search, 
        minPrice, 
        maxPrice,
        sortBy = 'created_at',
        sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `
        SELECT p.*, t.nama_toko, t.rating as toko_rating, t.is_official, t.logo as toko_logo,
               k.nama_kategori, k.slug as kategori_slug
        FROM produk p
        JOIN toko t ON p.id_toko = t.id_toko
        JOIN kategori k ON p.id_kategori = k.id_kategori
        WHERE p.is_active = true AND t.is_active = true
    `;
    const values = [];
    let valueIndex = 1;
    
    if (category) {
        query += ` AND k.slug = $${valueIndex}`;
        values.push(category);
        valueIndex++;
    }
    
    if (search) {
        query += ` AND p.nama_produk ILIKE $${valueIndex}`;
        values.push(`%${search}%`);
        valueIndex++;
    }
    
    if (minPrice) {
        query += ` AND p.harga_diskon >= $${valueIndex}`;
        values.push(minPrice);
        valueIndex++;
    }
    
    if (maxPrice) {
        query += ` AND p.harga_diskon <= $${valueIndex}`;
        values.push(maxPrice);
        valueIndex++;
    }
    
    const allowedSortFields = ['created_at', 'harga', 'harga_diskon', 'total_terjual', 'rating_avg'];
    const allowedSortOrders = ['ASC', 'DESC'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    query += ` ORDER BY p.${finalSortBy} ${finalSortOrder} LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);
    
    try {
        const result = await pool.query(query, values);
        
        let countQuery = `
            SELECT COUNT(*) as total
            FROM produk p
            JOIN kategori k ON p.id_kategori = k.id_kategori
            WHERE p.is_active = true
        `;
        const countValues = [];
        let countIndex = 1;
        
        if (category) {
            countQuery += ` AND k.slug = $${countIndex}`;
            countValues.push(category);
            countIndex++;
        }
        
        if (search) {
            countQuery += ` AND p.nama_produk ILIKE $${countIndex}`;
            countValues.push(`%${search}%`);
            countIndex++;
        }
        
        const countResult = await pool.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].total);
        
        res.json({
            success: true,
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: parseInt(page) * parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query(
            'UPDATE produk SET total_dilihat = total_dilihat + 1 WHERE id_produk = $1',
            [id]
        );
        
        const result = await pool.query(
            `SELECT p.*, t.id_toko, t.nama_toko, t.rating as toko_rating, t.total_penjualan as toko_penjualan,
                    t.total_pengikut as toko_pengikut, t.response_rate, t.response_time, t.is_official, t.level_toko,
                    t.jam_buka, t.jam_tutup,
                    k.nama_kategori, k.slug as kategori_slug,
                    COALESCE(
                        (SELECT json_agg(json_build_object(
                            'id_varian', v.id_varian,
                            'nama_varian', v.nama_varian,
                            'harga_extra', v.harga_extra,
                            'stok', v.stok,
                            'sku', v.sku
                        )) FROM varian_produk v WHERE v.id_produk = p.id_produk),
                        '[]'::json
                    ) as varian
             FROM produk p
             JOIN toko t ON p.id_toko = t.id_toko
             JOIN kategori k ON p.id_kategori = k.id_kategori
             WHERE p.id_produk = $1 AND p.is_active = true`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }
        
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, t.nama_toko, t.slug as toko_slug
             FROM produk p
             JOIN toko t ON p.id_toko = t.id_toko
             WHERE p.is_featured = true AND p.is_active = true AND t.is_active = true
             ORDER BY p.total_terjual DESC
             LIMIT 10`
        );
        
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get flash sale products
const getFlashSaleProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                fp.id_flash_sale_produk,
                p.id_produk,
                p.nama_produk,
                p.slug,
                p.harga as harga_normal,
                fp.harga_flash_sale,
                p.gambar_utama,
                t.nama_toko,
                t.slug as toko_slug,
                fp.kuota,
                fp.terjual,
                (fp.kuota - fp.terjual) as sisa,
                f.end_time,
                EXTRACT(EPOCH FROM (f.end_time - NOW())) as seconds_remaining
            FROM flash_sale_produk fp
            JOIN produk p ON fp.id_produk = p.id_produk
            JOIN toko t ON p.id_toko = t.id_toko
            JOIN flash_sale f ON fp.id_flash_sale = f.id_flash_sale
            WHERE f.is_active = true AND f.end_time > NOW()
            ORDER BY f.end_time ASC
        `);
        
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Get flash sale products error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Search products
const searchProducts = async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
        return res.json({ success: true, products: [] });
    }
    
    try {
        const result = await pool.query(
            `SELECT p.id_produk, p.nama_produk, p.slug, p.harga, p.harga_diskon, p.gambar_utama,
                    t.nama_toko
             FROM produk p
             JOIN toko t ON p.id_toko = t.id_toko
             WHERE p.nama_produk ILIKE $1 AND p.is_active = true
             ORDER BY p.total_terjual DESC
             LIMIT 10`,
            [`%${q}%`]
        );
        
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get recommendations
const getRecommendations = async (req, res) => {
    const { limit = 10 } = req.query;
    
    try {
        let query;
        let values = [];
        
        if (req.user) {
            query = `
                WITH user_categories AS (
                    SELECT DISTINCT p.id_kategori
                    FROM detail_transaksi dt
                    JOIN produk p ON dt.id_produk = p.id_produk
                    JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
                    WHERE t.id_user = $1 AND t.status_order = 'selesai'
                    LIMIT 5
                )
                SELECT p.*, t.nama_toko
                FROM produk p
                JOIN toko t ON p.id_toko = t.id_toko
                WHERE p.is_active = true
                AND (p.id_kategori IN (SELECT id_kategori FROM user_categories) OR p.is_featured = true)
                ORDER BY p.total_terjual DESC, p.rating_avg DESC
                LIMIT $2
            `;
            values = [req.user.id_user, limit];
        } else {
            query = `
                SELECT p.*, t.nama_toko
                FROM produk p
                JOIN toko t ON p.id_toko = t.id_toko
                WHERE p.is_active = true
                ORDER BY p.total_terjual DESC, p.rating_avg DESC
                LIMIT $1
            `;
            values = [limit];
        }
        
        const result = await pool.query(query, values);
        res.json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { 
    getProducts, 
    getProductById, 
    getFeaturedProducts, 
    getFlashSaleProducts,
    searchProducts,
    getRecommendations
};