const express = require('express');
const router = express.Router();
const { 
    getAffiliateInfo,
    getAffiliateStats,
    getAffiliateLinks,
    createAffiliateLink,
    getCommissionHistory,
    withdrawCommission
} = require('../controllers/affiliateController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Hanya affiliator dan admin yang bisa akses
router.get('/info', authorizeRoles('affiliator', 'super_admin'), getAffiliateInfo);
router.get('/stats', authorizeRoles('affiliator', 'super_admin'), getAffiliateStats);
router.get('/links', authorizeRoles('affiliator', 'super_admin'), getAffiliateLinks);
router.post('/links', authorizeRoles('affiliator', 'super_admin'), createAffiliateLink);
router.get('/commission', authorizeRoles('affiliator', 'super_admin'), getCommissionHistory);
router.post('/withdraw', authorizeRoles('affiliator', 'super_admin'), withdrawCommission);

module.exports = router;
