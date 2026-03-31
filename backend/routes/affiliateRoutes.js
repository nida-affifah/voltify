const express = require('express');
const router = express.Router();
const { 
    getAffiliateInfo, 
    registerAffiliate, 
    getAffiliateStats, 
    createAffiliateLink, 
    getAffiliateLinks 
} = require('../controllers/affiliateController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/info', getAffiliateInfo);
router.post('/register', registerAffiliate);
router.get('/stats', getAffiliateStats);
router.get('/links', getAffiliateLinks);
router.post('/links', createAffiliateLink);

module.exports = router;