const express = require('express');
const router = express.Router();

const { addToCart, getCart, updateCart, removeFromCart } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', addToCart);
router.get('/', getCart);
router.put('/:id', updateCart);
router.delete('/:id', removeFromCart);

module.exports = router;
