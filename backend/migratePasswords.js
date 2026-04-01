// backend/migratePasswords.js
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const migratePasswords = async () => {
    console.log('🚀 Memulai migrasi password...');
    
    try {
        // Ambil semua user yang passwordnya belum di-hash (panjangnya kurang dari 60 karakter)
        const result = await pool.query(`
            SELECT id_user, username, password 
            FROM users 
            WHERE LENGTH(password) < 60 OR password NOT LIKE '$2b$%'
        `);
        
        console.log(`📊 Ditemukan ${result.rows.length} user dengan password plain text`);
        
        if (result.rows.length === 0) {
            console.log('✅ Semua password sudah ter-hash!');
            process.exit(0);
        }
        
        for (const user of result.rows) {
            console.log(`🔐 Hashing password untuk user: ${user.username} (ID: ${user.id_user})`);
            
            // Hash password plain text
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            
            // Update database
            await pool.query(
                'UPDATE users SET password = $1 WHERE id_user = $2',
                [hashedPassword, user.id_user]
            );
            
            console.log(`✅ Password untuk ${user.username} berhasil di-hash`);
        }
        
        console.log('🎉 Migrasi password selesai!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error migrasi password:', error);
        process.exit(1);
    }
};

migratePasswords();
