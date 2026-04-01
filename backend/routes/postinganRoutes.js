const express = require('express');
const router = express.Router();
const { 
    getPostingan, 
    createPostingan, 
    likePostingan, 
    unlikePostingan, 
    getComments, 
    addComment 
} = require('../controllers/postinganController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getPostingan);
router.post('/', authenticateToken, createPostingan);
router.post('/:id/like', authenticateToken, likePostingan);
router.delete('/:id/like', authenticateToken, unlikePostingan);
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticateToken, addComment);

module.exports = router;
