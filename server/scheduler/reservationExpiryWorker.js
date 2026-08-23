const {
  redis,
  releaseReservation,
  RESERVATION_EXPIRY_KEY,
} = require("../redis/redisClient");

const { emitStockUpdate } = require("../socket/socketManager");

const { releaseBuyerAndPromote } = require("../services/flashSalePipeline");
const { isActiveBuyer, removeActiveBuyer } = require("../redis/queueClient");

const { processQueue } = require("../services/queueProcessor");

const CHECK_INTERVAL_MS = 1000;

// --------------------------------------------------
// Process expired reservations
// --------------------------------------------------

async function processExpiredReservations() {
  try {
    const now = Math.floor(Date.now() / 1000);

    // Find reservations whose expiration
    // timestamp is <= current time.
    const expiredReservations = await redis.zrangebyscore(
      RESERVATION_EXPIRY_KEY,
      "-inf",
      now,
      "LIMIT",
      0,
      100,
    );

    if (expiredReservations.length === 0) {
      return;
    }

    for (const reservationKey of expiredReservations) {
      try {
        /*
         * Reservation keys look like:
         *
         * reservation:<clientId>:<productId>
         *
         * Example:
         *
         * reservation:abc123:65f123...
         */

        const parts = reservationKey.split(":");

        if (parts.length !== 3) {
          console.error("Invalid reservation key:", reservationKey);

          // Remove malformed entry so the
          // worker does not process it forever.
          await redis.zrem(RESERVATION_EXPIRY_KEY, reservationKey);

          continue;
        }

        const clientId = parts[1];

        const productId = parts[2];

        // Atomically:
        //
        // GET reservation
        // DELETE reservation
        // ZREM expiry index
        // INCR stock
        //
        const releasedQuantity = await releaseReservation(productId, clientId);

        if (releasedQuantity > 0) {
          const stockKey = `product:${productId}:stock`;

          const currentStock = await redis.get(stockKey);

          const remainingStock =
            currentStock === null ? null : Number(currentStock);

          console.log(
            `[Reservation Expired] ` +
              `${reservationKey} ` +
              `released ${releasedQuantity} unit(s)`,
          );

          // Notify connected clients.
          if (remainingStock !== null) {
            emitStockUpdate(productId, remainingStock);
          }

          // --------------------------------------------
          // Release this buyer's active slot.
          // --------------------------------------------

          const wasActive = await isActiveBuyer(productId, clientId);

          if (wasActive) {
            await removeActiveBuyer(productId, clientId);

            // ----------------------------------------
            // Promote the next waiting buyer.
            // ----------------------------------------

            await processQueue(productId);
          }
        }
      } catch (reservationError) {
        console.error("Reservation processing error:", reservationError);
      }
    }
  } catch (err) {
    console.error("Reservation expiry worker error:", err);
  }
}

// --------------------------------------------------
// Start worker
// --------------------------------------------------

function startReservationExpiryWorker() {
  console.log("Reservation expiry worker started");

  setInterval(processExpiredReservations, CHECK_INTERVAL_MS);
}

module.exports = {
  startReservationExpiryWorker,
  processExpiredReservations,
};
