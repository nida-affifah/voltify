const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    getUserReviews
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/product/:id', getProductReviews);

// Protected routes (perlu login)
router.post('/', authenticateToken, createReview);
router.get('/my-reviews', authenticateToken, getUserReviews);

module.exports = router;
