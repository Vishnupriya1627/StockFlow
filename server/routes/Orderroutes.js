const express = require('express');
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');
const authMiddlewares = require('../middleware/authMiddlewares');
const router = express.Router();

router.post('/', authMiddlewares, createOrder);
router.get('/', authMiddlewares, getAllOrders);
router.get('/:id', authMiddlewares, getOrderById);
router.patch('/:id/status', authMiddlewares, updateOrderStatus);

module.exports = router;