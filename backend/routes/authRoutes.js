const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    updateProfile, 
    uploadAvatar,
    changePassword
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
