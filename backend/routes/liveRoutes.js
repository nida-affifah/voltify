const express = require('express');
const router = express.Router();
const { getLiveStreams, getLiveStreamById, createLiveStream } = require('../controllers/liveController');
const { authenticateToken, isSeller } = require('../middleware/auth');

router.get('/', getLiveStreams);
router.get('/:id', getLiveStreamById);
router.post('/', authenticateToken, isSeller, createLiveStream);

module.exports = router;
