const express = require('express');
const router = express.Router();
const { getAdminStats, getSellerStats, getUserStats } = require('../controllers/dashboardController');
const { authenticateToken, isAdmin, isSeller } = require('../middleware/auth');

router.get('/admin', authenticateToken, isAdmin, getAdminStats);
router.get('/seller', authenticateToken, isSeller, getSellerStats);
router.get('/user', authenticateToken, getUserStats);

module.exports = router;