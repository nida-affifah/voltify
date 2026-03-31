const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
    const { username, name, email, password, phone, gender, birth_date } = req.body;
    
    try {
        const existingUser = await pool.query(
            'SELECT id_user FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email atau username sudah terdaftar' 
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const result = await pool.query(
            `INSERT INTO users (username, name, email, password, role, phone, gender, birth_date, is_verified, last_login)
             VALUES ($1, $2, $3, $4, 'pelanggan', $5, $6, $7, true, CURRENT_TIMESTAMP)
             RETURNING id_user, username, name, email, role`,
            [username, name, email, hashedPassword, phone, gender, birth_date]
        );
        
        const user = result.rows[0];
        
        await pool.query(
            `INSERT INTO coin (id_user, jumlah_coin) VALUES ($1, 0)`,
            [user.id_user]
        );
        
        const token = jwt.sign(
            { id: user.id_user, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        
        await pool.query(
            `INSERT INTO notifikasi (id_user, judul, pesan, tipe, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [user.id_user, 'Selamat Datang di Voltify! 🎉', 
             'Terima kasih telah bergabung. Nikmati pengalaman belanja elektronik seru di Voltify!', 
             'system', '/']
        );
        
        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Selamat bergabung di Voltify',
            token,
            user: {
                id: user.id_user,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            `SELECT u.id_user, u.username, u.name, u.email, u.password, u.role, 
                    u.is_active, u.avatar, u.id_tier, u.phone,
                    mt.nama_tier, mt.diskon_extra, mt.cashback_rate
             FROM users u
             LEFT JOIN member_tier mt ON u.id_tier = mt.id_tier
             WHERE u.email = $1`,
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'Akun Anda telah dinonaktifkan. Hubungi admin' 
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email atau password salah' 
            });
        }
        
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_user = $1',
            [user.id_user]
        );
        
        const token = jwt.sign(
            { id: user.id_user, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        
        res.json({
            success: true,
            message: 'Login berhasil! Selamat datang kembali',
            token,
            user: {
                id: user.id_user,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                tier: {
                    nama: user.nama_tier,
                    diskon_extra: user.diskon_extra,
                    cashback_rate: user.cashback_rate
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id_user, u.username, u.name, u.email, u.role, u.phone, u.avatar, 
                    u.bio, u.gender, u.birth_date, u.follower_count, u.following_count, 
                    u.is_verified, u.id_tier, u.saldo, u.coin,
                    mt.nama_tier, mt.diskon_extra, mt.cashback_rate, mt.free_shipping,
                    COUNT(DISTINCT t.id_transaksi) as total_transaksi,
                    COALESCE(SUM(t.grand_total), 0) as total_belanja
             FROM users u
             LEFT JOIN member_tier mt ON u.id_tier = mt.id_tier
             LEFT JOIN transaksi t ON u.id_user = t.id_user AND t.status_order = 'selesai'
             WHERE u.id_user = $1
             GROUP BY u.id_user, mt.nama_tier, mt.diskon_extra, mt.cashback_rate, mt.free_shipping`,
            [req.user.id_user]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    const { name, phone, bio, gender, birth_date } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 phone = COALESCE($2, phone),
                 bio = COALESCE($3, bio),
                 gender = COALESCE($4, gender),
                 birth_date = COALESCE($5, birth_date),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id_user = $6
             RETURNING id_user, username, name, email, phone, bio, gender, birth_date, avatar`,
            [name, phone, bio, gender, birth_date, req.user.id_user]
        );
        
        res.json({ success: true, message: 'Profil berhasil diperbarui', user: result.rows[0] });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    }
    
    try {
        const avatarUrl = `/uploads/users/${req.file.filename}`;
        
        await pool.query(
            `UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2`,
            [avatarUrl, req.user.id_user]
        );
        
        res.json({ success: true, message: 'Avatar berhasil diupload', avatar: avatarUrl });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

// Change password
const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT password FROM users WHERE id_user = $1',
            [req.user.id_user]
        );
        
        const isValid = await bcrypt.compare(current_password, result.rows[0].password);
        
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Password saat ini salah' });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id_user = $2',
            [hashedPassword, req.user.id_user]
        );
        
        res.json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar, changePassword };