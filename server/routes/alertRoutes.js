const express = require('express');
const router = express.Router();

const { getAllAlerts, markAlertAsRead } = require('../controllers/alertController');
const authMiddlewares = require('../middleware/authMiddlewares');

router.get('/', authMiddlewares, getAllAlerts);
router.patch('/:id/read', authMiddlewares, markAlertAsRead);

module.exports = router;