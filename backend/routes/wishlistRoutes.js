const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.get('/check/:id_produk', checkWishlist);

module.exports = router;
