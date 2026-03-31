const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderDetail, cancelOrder } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderDetail);
router.put('/:id/cancel', cancelOrder);

module.exports = router;