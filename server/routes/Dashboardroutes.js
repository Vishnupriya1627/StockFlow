const express = require('express');
const {
    getSummary,
    getStockTrend,
    getCategoryBreakdown,
    getRecentActivity
} = require('../controllers/Dashboardcontroller');
const authMiddlewares = require('../middleware/authMiddlewares');
const router = express.Router();

router.get('/summary', authMiddlewares, getSummary);
router.get('/stock-trend', authMiddlewares, getStockTrend);
router.get('/category-breakdown', authMiddlewares, getCategoryBreakdown);
router.get('/activity', authMiddlewares, getRecentActivity);

module.exports = router;