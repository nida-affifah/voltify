const express = require('express');
const router = express.Router();
const { 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setPrimaryAddress,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/primary', setPrimaryAddress);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

module.exports = router;