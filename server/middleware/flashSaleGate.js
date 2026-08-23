const { tryEnterFlashSale, getQueuePosition } = require("../redis/queueClient");

const ACTIVE_CAPACITY = 50;

async function flashSaleGate(req, res, next) {
  const { productId } = req.params;
  const clientId = req.clientId;
  console.log(`[GATE] HTTP clientId: ${req.clientId}`);

  if (!clientId) {
    return res.status(400).json({
      success: false,
      reason: "CLIENT_ID_REQUIRED",
    });
  }

  try {
    const result = await tryEnterFlashSale(
      productId,
      clientId,
      ACTIVE_CAPACITY,
    );

    /**
     * Buyer successfully entered the
     * active purchase pipeline.
     */
    if (result.active) {
      req.flashSaleAccess = "ACTIVE";

      return next();
    }

    /**
     * Capacity is full.
     * Buyer has been placed in Redis queue.
     */
    const position = await getQueuePosition(productId, clientId);
    console.log(`[GATE] Buyer sent to waiting room: ${req.clientId}`);

    return res.status(202).json({
      success: false,
      waiting: true,
      reason: "WAITING_ROOM",
      position,
      capacity: ACTIVE_CAPACITY,
    });
  } catch (err) {
    console.error("flashSaleGate error:", err);

    return res.status(500).json({
      success: false,
      reason: "SERVER_ERROR",
    });
  }
}

module.exports = {
  flashSaleGate,
  ACTIVE_CAPACITY,
};
