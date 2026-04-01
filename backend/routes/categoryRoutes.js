const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, getProductsByCategory } = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/:id/produk', getProductsByCategory);

module.exports = router;
