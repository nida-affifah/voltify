const express = require('express');
const router = express.Router();
const { 
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    getNotifications,
    markNotificationRead
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Profile (semua role bisa)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Alamat (semua role bisa)
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/primary', setPrimaryAddress);

// Notifikasi (semua role bisa)
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
