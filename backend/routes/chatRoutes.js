const express = require('express');
const router = express.Router();
const { getOrCreateRoom, getUserRooms, getMessages, sendMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/rooms', getUserRooms);
router.get('/room/:seller_id', getOrCreateRoom);
router.get('/room/:room_id/messages', getMessages);
router.post('/message', sendMessage);

module.exports = router;