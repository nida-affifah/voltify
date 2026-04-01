const express = require('express');
const router = express.Router();
const { 
    getSellerDashboard,
    getStoreProducts,
    getStoreOrders,
    updateOrderStatus,
    getStoreStats,
    getStoreReviews
} = require('../controllers/sellerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('seller', 'admin_toko', 'super_admin'));

router.get('/dashboard', getSellerDashboard);
router.get('/produk', getStoreProducts);
router.get('/orders', getStoreOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/stats', getStoreStats);
router.get('/reviews', getStoreReviews);

module.exports = router;
