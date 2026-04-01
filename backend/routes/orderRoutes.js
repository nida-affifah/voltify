const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus,
    buyNow,
    processPayment
} = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Buy Now (langsung checkout tanpa keranjang)
router.post('/buy-now', buyNow);

// Payment
router.put('/:id/pay', processPayment);

// Pelanggan bisa buat order dan lihat order sendiri
router.post('/', authorizeRoles('pelanggan', 'seller', 'admin_toko', 'super_admin'), createOrder);
router.get('/', authorizeRoles('pelanggan', 'seller', 'admin_toko', 'super_admin'), getOrders);
router.get('/:id', authorizeRoles('pelanggan', 'seller', 'admin_toko', 'super_admin'), getOrderDetail);
router.put('/:id/cancel', authorizeRoles('pelanggan', 'seller', 'admin_toko', 'super_admin'), cancelOrder);
router.put('/:id/status', authorizeRoles('seller', 'admin_toko', 'super_admin'), updateOrderStatus);

module.exports = router;
