const express = require('express');
const router = express.Router();
const { 
    getDeliveryList,
    getTodayDelivery,
    getDeliveryHistory,
    getDeliveryDetail,
    updateDeliveryStatus
} = require('../controllers/deliveryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Hanya kurir dan admin yang bisa akses
router.get('/', authorizeRoles('kurir', 'super_admin'), getDeliveryList);
router.get('/today', authorizeRoles('kurir', 'super_admin'), getTodayDelivery);
router.get('/history', authorizeRoles('kurir', 'super_admin'), getDeliveryHistory);
router.get('/:id', authorizeRoles('kurir', 'super_admin'), getDeliveryDetail);
router.put('/:id/status', authorizeRoles('kurir', 'super_admin'), updateDeliveryStatus);

module.exports = router;
