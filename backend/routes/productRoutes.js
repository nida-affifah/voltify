const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    getFeaturedProducts, 
    getFlashSaleProducts,
    searchProducts,
    getRecommendations
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/search', searchProducts);
router.get('/recommendations', authenticateToken, getRecommendations);
router.get('/:id', getProductById);

module.exports = router;