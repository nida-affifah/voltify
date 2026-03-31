const express = require('express');
const router = express.Router();
const { getProductReviews, addReview, replyReview } = require('../controllers/reviewController');
const { authenticateToken, isSeller } = require('../middleware/auth');

router.get('/product/:id', getProductReviews);
router.post('/product/:id', authenticateToken, addReview);
router.put('/:id/reply', authenticateToken, isSeller, replyReview);

module.exports = router;