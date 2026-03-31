const express = require('express');
const router = express.Router();
const { getVouchers, applyVoucher, getUserVouchers } = require('../controllers/voucherController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getVouchers);
router.post('/apply', authenticateToken, applyVoucher);
router.get('/my', authenticateToken, getUserVouchers);

module.exports = router;