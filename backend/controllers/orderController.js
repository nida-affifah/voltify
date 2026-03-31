const pool = require('../config/database');

// Create order
const createOrder = async (req, res) => {
    const { id_alamat, id_metode_pembayaran, id_voucher, catatan } = req.body;
    
    if (!id_alamat || !id_metode_pembayaran) {
        return res.status(400).json({ success: false, message: 'Alamat dan metode pembayaran harus dipilih' });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const cartResult = await client.query(
            `SELECT k.id_produk, k.id_varian, k.jumlah, k.harga_saat_ditambahkan,
                    p.nama_produk, p.harga, p.harga_diskon, p.id_toko,
                    v.nama_varian
             FROM keranjang k
             JOIN produk p ON k.id_produk = p.id_produk
             LEFT JOIN varian_produk v ON k.id_varian = v.id_varian
             WHERE k.id_user = $1`,
            [req.user.id_user]
        );
        
        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Keranjang belanja kosong' });
        }
        
        let total_harga_produk = 0;
        
        for (const item of cartResult.rows) {
            const price = item.harga_diskon || item.harga;
            const subtotal = price * item.jumlah;
            total_harga_produk += subtotal;
        }
        
        let voucher_potongan = 0;
        let voucher_info = null;
        
        if (id_voucher) {
            const voucherResult = await client.query(
                `SELECT * FROM voucher_marketplace 
                 WHERE id_voucher = $1 AND is_active = true 
                 AND CURRENT_TIMESTAMP BETWEEN berlaku_mulai AND berlaku_sampai
                 AND sisa_kuota > 0`,
                [id_voucher]
            );
            
            if (voucherResult.rows.length > 0) {
                voucher_info = voucherResult.rows[0];
                
                if (total_harga_produk >= voucher_info.minimal_belanja) {
                    if (voucher_info.tipe === 'potongan_harga') {
                        voucher_potongan = Math.min(voucher_info.nilai, voucher_info.maksimal_potongan || voucher_info.nilai);
                    } else if (voucher_info.tipe === 'persen') {
                        voucher_potongan = (total_harga_produk * voucher_info.nilai / 100);
                        if (voucher_info.maksimal_potongan) {
                            voucher_potongan = Math.min(voucher_potongan, voucher_info.maksimal_potongan);
                        }
                    }
                }
            }
        }
        
        const biaya_pengiriman = 15000;
        let biaya_admin = 0;
        
        const metodeResult = await client.query(
            `SELECT biaya_admin FROM metode_pembayaran WHERE id_metode = $1`,
            [id_metode_pembayaran]
        );
        if (metodeResult.rows.length > 0) {
            biaya_admin = metodeResult.rows[0].biaya_admin || 0;
        }
        
        const grand_total = total_harga_produk - voucher_potongan + biaya_pengiriman + biaya_admin;
        
        const transaksiResult = await client.query(
            `INSERT INTO transaksi (id_user, id_alamat, id_metode_pembayaran, id_voucher,
                voucher_potongan, total_harga_produk, total_diskon_produk,
                biaya_pengiriman, biaya_admin, grand_total, catatan, status_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
             RETURNING id_transaksi, invoice_number`,
            [req.user.id_user, id_alamat, id_metode_pembayaran, id_voucher || null,
             voucher_potongan, total_harga_produk, 0, biaya_pengiriman, biaya_admin, grand_total, catatan]
        );
        
        const id_transaksi = transaksiResult.rows[0].id_transaksi;
        const invoice_number = transaksiResult.rows[0].invoice_number;
        
        for (const item of cartResult.rows) {
            const price = item.harga_diskon || item.harga;
            const subtotal = price * item.jumlah;
            
            await client.query(
                `INSERT INTO detail_transaksi (id_transaksi, id_produk, id_varian, id_toko,
                    nama_produk_saat_transaksi, harga_satuan_saat_transaksi, jumlah, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [id_transaksi, item.id_produk, item.id_varian || null, item.id_toko,
                 item.nama_produk, price, item.jumlah, subtotal]
            );
            
            if (item.id_varian) {
                await client.query(
                    `UPDATE varian_produk SET stok = stok - $1 WHERE id_varian = $2`,
                    [item.jumlah, item.id_varian]
                );
            } else {
                await client.query(
                    `UPDATE produk SET stok = stok - $1 WHERE id_produk = $2`,
                    [item.jumlah, item.id_produk]
                );
            }
        }
        
        await client.query(
            `DELETE FROM keranjang WHERE id_user = $1`,
            [req.user.id_user]
        );
        
        if (voucher_info) {
            await client.query(
                `UPDATE voucher_marketplace SET sisa_kuota = sisa_kuota - 1 WHERE id_voucher = $1`,
                [id_voucher]
            );
        }
        
        await client.query(
            `INSERT INTO notifikasi (id_user, judul, pesan, tipe, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id_user, 'Pesanan Dibuat! 📦', 
             `Pesanan dengan invoice ${invoice_number} berhasil dibuat. Silakan lakukan pembayaran.`, 
             'order', `/orders/${id_transaksi}`]
        );
        
        await client.query('COMMIT');
        
        res.json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            order: {
                id: id_transaksi,
                invoice_number,
                grand_total,
                status: 'pending'
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    } finally {
        client.release();
    }
};

// Get user orders
const getOrders = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    try {
        let query = `
            SELECT t.*, a.penerima, a.alamat_lengkap, a.kota, mp.nama_metode
            FROM transaksi t
            JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
            JOIN metode_pembayaran mp ON t.id_metode_pembayaran = mp.id_metode
            WHERE t.id_user = $1
        `;
        const values = [req.user.id_user];
        let valueIndex = 2;
        
        if (status) {
            query += ` AND t.status_order = $${valueIndex}`;
            values.push(status);
            valueIndex++;
        }
        
        query += ` ORDER BY t.created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
        values.push(limit, offset);
        
        const result = await pool.query(query, values);
        
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM transaksi WHERE id_user = $1`,
            [req.user.id_user]
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
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get order detail
const getOrderDetail = async (req, res) => {
    const { id } = req.params;
    
    try {
        const orderResult = await pool.query(
            `SELECT t.*, a.penerima, a.no_hp as penerima_hp, a.alamat_lengkap, a.kota, a.provinsi, a.kode_pos,
                    mp.nama_metode, mp.biaya_admin,
                    v.kode_voucher, v.nama_voucher, v.tipe, v.nilai
             FROM transaksi t
             JOIN alamat_pengiriman a ON t.id_alamat = a.id_alamat
             JOIN metode_pembayaran mp ON t.id_metode_pembayaran = mp.id_metode
             LEFT JOIN voucher_marketplace v ON t.id_voucher = v.id_voucher
             WHERE t.id_transaksi = $1 AND t.id_user = $2`,
            [id, req.user.id_user]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }
        
        const order = orderResult.rows[0];
        
        const detailsResult = await pool.query(
            `SELECT dt.*, p.gambar_utama, t.nama_toko
             FROM detail_transaksi dt
             JOIN produk p ON dt.id_produk = p.id_produk
             JOIN toko t ON dt.id_toko = t.id_toko
             WHERE dt.id_transaksi = $1`,
            [id]
        );
        
        const paymentResult = await pool.query(
            `SELECT * FROM pembayaran WHERE id_transaksi = $1`,
            [id]
        );
        
        const shippingResult = await pool.query(
            `SELECT p.*, k.nama_kurir
             FROM pengiriman p
             LEFT JOIN kurir k ON p.id_kurir = k.id_kurir
             WHERE p.id_transaksi = $1`,
            [id]
        );
        
        let tracking = [];
        if (shippingResult.rows.length > 0) {
            const trackingResult = await pool.query(
                `SELECT * FROM tracking_detail WHERE id_pengiriman = $1 ORDER BY waktu DESC`,
                [shippingResult.rows[0].id_pengiriman]
            );
            tracking = trackingResult.rows;
        }
        
        res.json({
            success: true,
            order,
            details: detailsResult.rows,
            payment: paymentResult.rows[0] || null,
            shipping: shippingResult.rows[0] || null,
            tracking
        });
    } catch (error) {
        console.error('Get order detail error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const { alasan } = req.body;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const orderResult = await client.query(
            `SELECT status_order FROM transaksi 
             WHERE id_transaksi = $1 AND id_user = $2`,
            [id, req.user.id_user]
        );
        
        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }
        
        const currentStatus = orderResult.rows[0].status_order;
        
        if (currentStatus !== 'pending' && currentStatus !== 'dibayar') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Pesanan tidak dapat dibatalkan' });
        }
        
        await client.query(
            `UPDATE transaksi 
             SET status_order = 'dibatalkan', 
                 canceled_at = CURRENT_TIMESTAMP,
                 alasan_batal = $1
             WHERE id_transaksi = $2`,
            [alasan || 'Dibatalkan oleh pembeli', id]
        );
        
        const detailsResult = await client.query(
            `SELECT id_produk, id_varian, jumlah FROM detail_transaksi WHERE id_transaksi = $1`,
            [id]
        );
        
        for (const detail of detailsResult.rows) {
            if (detail.id_varian) {
                await client.query(
                    `UPDATE varian_produk SET stok = stok + $1 WHERE id_varian = $2`,
                    [detail.jumlah, detail.id_varian]
                );
            } else {
                await client.query(
                    `UPDATE produk SET stok = stok + $1 WHERE id_produk = $2`,
                    [detail.jumlah, detail.id_produk]
                );
            }
        }
        
        await client.query(
            `INSERT INTO notifikasi (id_user, judul, pesan, tipe, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [req.user.id_user, 'Pesanan Dibatalkan ❌', 
             `Pesanan Anda telah dibatalkan. ${alasan ? 'Alasan: ' + alasan : ''}`, 
             'order', `/orders/${id}`]
        );
        
        await client.query('COMMIT');
        
        res.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    } finally {
        client.release();
    }
};

module.exports = { createOrder, getOrders, getOrderDetail, cancelOrder };