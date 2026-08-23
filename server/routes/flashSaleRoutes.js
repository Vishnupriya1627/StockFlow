const express = require("express");

const router = express.Router();

const {
  buyFlashSaleItem,
  getFlashSaleStock,
  checkoutFlashSaleOrder,
  getActiveDrops,
  getDropStats,
  simulateLoad,
} = require("../controllers/flashSaleController");

const authMiddlewares = require("../middleware/authMiddlewares");
const requireAdmin = require("../middleware/requireAdmin");
const clientIdMiddleware = require("../middleware/clientIdMiddleware");
const { flashSaleGate } = require("../middleware/flashSaleGate");
const { resetFlashSaleState } = require("../controllers/flashSaleController");

router.get("/active/list", getActiveDrops);

router.post(
  "/:productId/buy",
  clientIdMiddleware,
  flashSaleGate,
  buyFlashSaleItem,
);

router.get("/:productId/stock", getFlashSaleStock);

router.post("/:productId/checkout", clientIdMiddleware, checkoutFlashSaleOrder);

router.get("/:productId/stats", authMiddlewares, requireAdmin, getDropStats);

router.post(
  "/:productId/simulate",
  authMiddlewares,
  requireAdmin,
  simulateLoad,
);

router.post(
  "/:productId/reset",
  authMiddlewares,
  requireAdmin,
  resetFlashSaleState,
);

module.exports = router;
