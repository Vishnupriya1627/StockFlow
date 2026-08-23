const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    adjustStock,
    getProductStockHistory,
    getProductMovements
} = require('../controllers/productcontroller');
const authMiddlewares = require('../middleware/authMiddlewares');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();
 
router.get('/', authMiddlewares, getAllProducts);
router.get('/:id', authMiddlewares, getProductById);
router.get('/:id/stock-history', authMiddlewares, getProductStockHistory);
router.get('/:id/movements', authMiddlewares, getProductMovements);
 
router.post('/', authMiddlewares, requireAdmin, createProduct);
router.put('/:id', authMiddlewares, requireAdmin, updateProduct);
router.delete('/:id', authMiddlewares, requireAdmin, deleteProduct);
router.patch('/:id/stock', authMiddlewares, requireAdmin, adjustStock);

module.exports = router;