const express = require('express');
const router = express.Router();
const { 
    getProducts,
    getProductById,
    getFeaturedProducts,
    getFlashSaleProducts,
    searchProducts,
    getRecommendations,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes (semua orang bisa akses)
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes (hanya seller/admin yang bisa CRUD)
router.get('/recommendations', authenticateToken, getRecommendations);
router.post('/', authenticateToken, authorizeRoles('seller', 'super_admin', 'admin_toko'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('seller', 'super_admin', 'admin_toko'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('seller', 'super_admin', 'admin_toko'), deleteProduct);

module.exports = router;
