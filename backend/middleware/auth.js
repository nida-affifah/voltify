const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Silakan login terlebih dahulu' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            `SELECT id_user, username, name, email, role, is_active, avatar, phone, id_tier
             FROM users WHERE id_user = $1 AND is_active = true`,
            [decoded.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak ditemukan atau akun dinonaktifkan' 
            });
        }
        
        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesi login telah berakhir, silakan login ulang' 
            });
        }
        return res.status(403).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Akses ditolak. Role yang diizinkan: ${roles.join(', ')}` 
            });
        }
        next();
    };
};

const isSeller = async (req, res, next) => {
    if (req.user.role !== 'seller' && req.user.role !== 'super_admin' && req.user.role !== 'admin_toko') {
        return res.status(403).json({ 
            success: false, 
            message: 'Hanya seller yang dapat melakukan aksi ini' 
        });
    }
    next();
};

const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin_toko') {
        return res.status(403).json({ 
            success: false, 
            message: 'Hanya admin yang dapat melakukan aksi ini' 
        });
    }
    next();
};

module.exports = { authenticateToken, authorizeRoles, isSeller, isAdmin };
