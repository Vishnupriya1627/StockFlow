const {
  attemptBuy,
  getLiveStock,
  redis,
  getStats,
  consumeReservation,
  RESERVATION_TTL_SECONDS,
} = require("../redis/redisClient");

const Product = require("../models/Productmodel");
const Order = require("../models/Ordermodel");
const StockMovement = require("../models/stockMovementModel");

const { releaseBuyerAndPromote } = require("../services/flashSalePipeline");

const { tryEnterFlashSale, getQueuePosition } = require("../redis/queueClient");

const { randomUUID } = require("crypto");

const { emitStockUpdate, emitOpsStats } = require("../socket/socketManager");

// --------------------------------------------------
// BUY FLASH SALE ITEM
// --------------------------------------------------

async function buyFlashSaleItem(req, res) {
  const { productId } = req.params;
  const clientId = req.clientId;

  console.log(`[BUY] HTTP clientId: ${clientId}`);

  console.log(`[BUY] product=${productId} clientId=${clientId}`);

  const qty = 1;
  const ACTIVE_CAPACITY = 50;

  try {
    // --------------------------------------------------
    // STEP 1
    // Enter the traffic gate
    // --------------------------------------------------

    const gateResult = await tryEnterFlashSale(
      productId,
      clientId,
      ACTIVE_CAPACITY,
    );

    // --------------------------------------------------
    // BUYER ENTERED WAITING ROOM
    // --------------------------------------------------

    if (!gateResult.active) {
      const position = await getQueuePosition(productId, clientId);

      return res.status(202).json({
        success: false,
        waiting: true,
        reason: "WAITING_ROOM",
        position,
      });
    }

    // --------------------------------------------------
    // BUYER IS ACTIVE
    // --------------------------------------------------

    const result = await attemptBuy(productId, clientId, qty);

    // --------------------------------------------------
    // PURCHASE FAILED
    // --------------------------------------------------

    if (!result.success) {
      // If the buyer was admitted to the active pool
      // but could not reserve inventory, release
      // their slot and promote the next buyer.

      await releaseBuyerAndPromote(productId, clientId);

      const statusCode = result.reason === "SALE_NOT_LIVE" ? 404 : 409;

      return res.status(statusCode).json({
        success: false,
        reason: result.reason,
      });
    }

    // --------------------------------------------------
    // RESERVATION SUCCESSFUL
    // --------------------------------------------------

    emitStockUpdate(productId, result.remainingStock);

    return res.status(200).json({
      success: true,
      remainingStock: result.remainingStock,
      reservationTtlSeconds: result.reservationTtlSeconds,
    });
  } catch (err) {
    console.error("buyFlashSaleItem error:", err);

    // --------------------------------------------------
    // SAFETY CLEANUP
    // --------------------------------------------------

    try {
      await releaseBuyerAndPromote(productId, clientId);
    } catch (cleanupError) {
      console.error("buyFlashSaleItem cleanup error:", cleanupError);
    }

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// GET FLASH SALE STOCK
// --------------------------------------------------

async function getFlashSaleStock(req, res) {
  const { productId } = req.params;

  try {
    const stock = await getLiveStock(productId);

    if (stock === null) {
      return res.status(404).json({
        success: false,
        reason: "SALE_NOT_LIVE",
      });
    }

    return res.status(200).json({
      success: true,
      stock,
    });
  } catch (err) {
    console.error("getFlashSaleStock error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// CHECKOUT FLASH SALE ORDER
// --------------------------------------------------

async function checkoutFlashSaleOrder(req, res) {
  const { productId } = req.params;

  const clientId = req.clientId;
  const { customer } = req.body; // { name, email, phone, address }

  if (!customer?.name || !customer?.email || !customer?.phone) {
    return res.status(400).json({
      success: false,
      reason: "MISSING_CUSTOMER_INFO",
    });
  }

  try {
    // --------------------------------------------------
    // Atomically consume the reservation.
    // --------------------------------------------------

    const quantity = await consumeReservation(productId, clientId);

    if (quantity <= 0) {
      return res.status(410).json({
        success: false,
        reason: "RESERVATION_EXPIRED",
      });
    }

    // --------------------------------------------------
    // Get product information
    // --------------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      // Reservation was already consumed,
      // so restore the inventory.

      const stockKey = `product:${productId}:stock`;

      await redis.incrby(stockKey, quantity);

      return res.status(404).json({
        success: false,
        reason: "PRODUCT_NOT_FOUND",
      });
    }

    // --------------------------------------------------
    // Calculate order amount
    // --------------------------------------------------

    const unitPrice = product.unitPrice;

    const totalAmount = unitPrice * quantity;

    // --------------------------------------------------
    // Create order
    // --------------------------------------------------

    let order;

    try {
      order = await Order.create({
        orderNumber: `FS-${Date.now()}-${randomUUID().slice(0, 8)}`,

        items: [
          {
            product: product._id,
            quantity,
            unitPrice,
          },
        ],

        status: "confirmed",

        totalAmount,

        buyerClientId: clientId,
        customer,
      });
    } catch (orderError) {
      // Order creation failed.
      // Restore inventory.

      const stockKey = `product:${productId}:stock`;

      await redis.incrby(stockKey, quantity);

      throw orderError;
    }

    try {
      await Product.findByIdAndUpdate(productId, {
        $inc: {
          currentStock: -quantity,
          "flashSale.soldCount": quantity,
        },
      });

      await StockMovement.create({
        product: product._id,
        order: order._id,
        type: "outbound",
        quantity: -quantity,
        reason: "sale",
        performedBy: undefined, 
      });
    } catch (syncError) {
      console.error("Inventory sync error after checkout:", syncError);
    }

    // --------------------------------------------------
    // Notify clients about current stock
    // --------------------------------------------------

    const remainingStock = await getLiveStock(productId);

    emitStockUpdate(productId, remainingStock);

    // --------------------------------------------------
    // IMPORTANT:
    //
    // The real buyer has completed checkout.
    // Their active traffic-gate slot must now
    // be released.
    //
    // releaseBuyerAndPromote() does TWO things:
    //
    // 1. Removes this buyer from the active pool.
    // 2. Promotes the next waiting buyer.
    //
    // This is what keeps the traffic pipeline moving.
    // --------------------------------------------------

    await releaseBuyerAndPromote(productId, clientId);

    // --------------------------------------------------
    // Return successful order
    // --------------------------------------------------

    return res.status(201).json({
      success: true,

      orderNumber: order.orderNumber,

      totalAmount: order.totalAmount,
    });
  } catch (err) {
    console.error("checkoutFlashSaleOrder error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// GET ACTIVE DROPS
// --------------------------------------------------

async function getActiveDrops(req, res) {
  try {
    const products = await Product.find({
      "flashSale.isEnabled": true,

      "flashSale.status": {
        $in: ["scheduled", "live"],
      },
    }).select("name imageUrl unitPrice flashSale");

    return res.status(200).json({
      success: true,
      drops: products,
    });
  } catch (err) {
    console.error("getActiveDrops error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// GET DROP STATS
// --------------------------------------------------

async function getDropStats(req, res) {
  const { productId } = req.params;

  try {
    const stats = await getStats(productId);

    return res.status(200).json({
      success: true,
      ...stats,
    });
  } catch (err) {
    console.error("getDropStats error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// SIMULATE LOAD
// --------------------------------------------------

async function simulateLoad(req, res) {
  const { productId } = req.params;

  const count = Math.min(Number(req.body?.count) || 200, 2000);

  try {
    const attempts = Array.from({ length: count }, () =>
      attemptBuy(productId, `sim-${randomUUID()}`, 1),
    );

    const results = await Promise.all(attempts);

    const successCount = results.filter((r) => r.success).length;

    const soldOutCount = results.filter(
      (r) => !r.success && r.reason === "SOLD_OUT",
    ).length;

    const finalStock = await getLiveStock(productId);

    emitStockUpdate(productId, finalStock);

    const stats = await getStats(productId);

    emitOpsStats(productId, stats);

    return res.status(200).json({
      success: true,

      requested: count,

      successCount,

      soldOutCount,

      finalStock,
    });
  } catch (err) {
    console.error("simulateLoad error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  buyFlashSaleItem,

  getFlashSaleStock,

  checkoutFlashSaleOrder,

  getActiveDrops,

  getDropStats,

  simulateLoad,
};
