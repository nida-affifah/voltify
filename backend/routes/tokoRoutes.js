const express = require('express');
const router = express.Router();
const { getTokoById, followToko, unfollowToko, checkFollow } = require('../controllers/tokoController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:id', getTokoById);
router.post('/:id/follow', authenticateToken, followToko);
router.delete('/:id/follow', authenticateToken, unfollowToko);
router.get('/:id/follow/check', authenticateToken, checkFollow);

module.exports = router;
