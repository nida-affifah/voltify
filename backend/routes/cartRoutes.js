const express = require('express');
const router = express.Router();
const { 
    getCart, 
    addToCart, 
    updateCart, 
    removeFromCart, 
    clearCart,
    getCartCount
} = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/', addToCart);
router.put('/:id', updateCart);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;