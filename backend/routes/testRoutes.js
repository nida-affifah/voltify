const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Test buy now
router.post('/test-buy', async (req, res) => {
  console.log('Test endpoint called');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  try {
    const { id_produk, jumlah } = req.body;
    const userId = req.user?.id_user || 15;
    
    const result = await pool.query(
      'INSERT INTO transaksi (id_user, total_harga_produk, grand_total, status_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, 100000, 100000, 'pending']
    );
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
