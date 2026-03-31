const pool = require('../config/database');

// Get user cart
const getCart = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT k.id_keranjang, k.id_produk, k.id_varian, k.jumlah, 
                    k.harga_saat_ditambahkan, k.catatan, k.created_at,
                    p.nama_produk, p.gambar_utama, p.stok as produk_stok,
                    p.harga, p.harga_diskon,
                    v.nama_varian, v.stok as varian_stok,
                    t.nama_toko, t.id_toko
             FROM keranjang k
             JOIN produk p ON k.id_produk = p.id_produk
             JOIN toko t ON p.id_toko = t.id_toko
             LEFT JOIN varian_produk v ON k.id_varian = v.id_varian
             WHERE k.id_user = $1
             ORDER BY k.created_at DESC`,
            [req.user.id_user]
        );
        
        let subtotal = 0;
        const items = result.rows.map(item => {
            const price = item.harga_diskon || item.harga;
            const itemTotal = price * item.jumlah;
            subtotal += itemTotal;
            return {
                ...item,
                harga_satuan: price,
                subtotal: itemTotal
            };
        });
        
        res.json({
            success: true,
            items,
            summary: {
                total_items: items.reduce((sum, item) => sum + item.jumlah, 0),
                subtotal,
                shipping_fee: 0,
                total: subtotal
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Add to cart
const addToCart = async (req, res) => {
    const { id_produk, id_varian, jumlah, catatan } = req.body;
    
    if (!id_produk || !jumlah || jumlah < 1) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    try {
        let harga;
        
        if (id_varian) {
            const varianResult = await pool.query(
                `SELECT v.*, p.harga, p.harga_diskon
                 FROM varian_produk v
                 JOIN produk p ON v.id_produk = p.id_produk
                 WHERE v.id_varian = $1`,
                [id_varian]
            );
            
            if (varianResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Varian produk tidak ditemukan' });
            }
            
            const varian = varianResult.rows[0];
            if (varian.stok < jumlah) {
                return res.status(400).json({ success: false, message: `Stok varian ${varian.nama_varian} tidak mencukupi` });
            }
            
            const basePrice = varian.harga_diskon || varian.harga;
            harga = basePrice + (varian.harga_extra || 0);
        } else {
            const productResult = await pool.query(
                `SELECT p.* FROM produk p WHERE p.id_produk = $1 AND p.is_active = true`,
                [id_produk]
            );
            
            if (productResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
            }
            
            const product = productResult.rows[0];
            if (product.stok < jumlah) {
                return res.status(400).json({ success: false, message: 'Stok produk tidak mencukupi' });
            }
            
            harga = product.harga_diskon || product.harga;
        }
        
        const existingCart = await pool.query(
            `SELECT id_keranjang, jumlah FROM keranjang 
             WHERE id_user = $1 AND id_produk = $2 AND 
             (id_varian = $3 OR (id_varian IS NULL AND $3 IS NULL))`,
            [req.user.id_user, id_produk, id_varian || null]
        );
        
        if (existingCart.rows.length > 0) {
            const newJumlah = existingCart.rows[0].jumlah + jumlah;
            await pool.query(
                `UPDATE keranjang 
                 SET jumlah = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id_keranjang = $2`,
                [newJumlah, existingCart.rows[0].id_keranjang]
            );
        } else {
            await pool.query(
                `INSERT INTO keranjang (id_user, id_produk, id_varian, jumlah, harga_saat_ditambahkan, catatan)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.user.id_user, id_produk, id_varian || null, jumlah, harga, catatan]
            );
        }
        
        const cartCount = await pool.query(
            `SELECT COUNT(*) as total FROM keranjang WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        res.json({ 
            success: true, 
            message: 'Produk berhasil ditambahkan ke keranjang',
            cart_count: parseInt(cartCount.rows[0].total)
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Update cart quantity
const updateCart = async (req, res) => {
    const { id } = req.params;
    const { jumlah } = req.body;
    
    if (!jumlah || jumlah < 1) {
        return res.status(400).json({ success: false, message: 'Jumlah tidak valid' });
    }
    
    try {
        const result = await pool.query(
            `UPDATE keranjang 
             SET jumlah = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id_keranjang = $2 AND id_user = $3
             RETURNING *`,
            [jumlah, id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item keranjang tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Keranjang berhasil diperbarui' });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `DELETE FROM keranjang 
             WHERE id_keranjang = $1 AND id_user = $2
             RETURNING *`,
            [id, req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item keranjang tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Item berhasil dihapus dari keranjang' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM keranjang WHERE id_user = $1',
            [req.user.id_user]
        );
        
        res.json({ success: true, message: 'Keranjang berhasil dikosongkan' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get cart count
const getCartCount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT SUM(jumlah) as total FROM keranjang WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        res.json({ success: true, count: parseInt(result.rows[0].total) || 0 });
    } catch (error) {
        console.error('Get cart count error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart, getCartCount };