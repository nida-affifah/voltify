const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAdminDashboard,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  updateResi,
  getReports
} = require('../controllers/adminController');

// Semua route admin memerlukan authentication
router.use(authenticateToken);
router.use(authorizeRoles('super_admin', 'admin_toko', 'seller'));

// Dashboard
router.get('/dashboard', getAdminDashboard);

// Products CRUD
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders Management
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/resi', updateResi);

// Reports
router.get('/reports', getReports);

module.exports = router;
