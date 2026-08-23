const {
  removeActiveBuyer,
  promoteNextBuyerAtomic,
} = require("../redis/queueClient");

const { publishPromotion } = require("../redis/queuePubSub");
const { redis } = require("../redis/redisClient");
const { emitQueuePosition } = require("../socket/socketManager");

const ACTIVE_CAPACITY = 50;

// --------------------------------------------------
// RELEASE ACTIVE BUYER + PROMOTE NEXT BUYERS
// --------------------------------------------------

async function releaseBuyerAndPromote(productId, clientId) {
  try {
    console.log(`[PIPELINE] Releasing active buyer: ${clientId}`);

    const removed = await removeActiveBuyer(productId, clientId);

    console.log(`[PIPELINE] Removed result: ${removed}`);

    if (removed !== 1) {
      console.log(`[PIPELINE] Buyer was not active: ${clientId}`);

      return {
        released: false,
        promoted: [],
      };
    }

    const promoted = [];

    while (true) {
      const buyer = await promoteNextBuyerAtomic(productId, ACTIVE_CAPACITY);

      console.log(`[PIPELINE] promoteNextBuyerAtomic returned: ${buyer}`);

      if (!buyer) {
        break;
      }

      promoted.push(buyer);

      console.log(`[PIPELINE] Promoting buyer: ${buyer}`);

      await publishPromotion(productId, buyer);
    }

    console.log(`[PIPELINE] Promotion complete. Promoted: ${promoted.length}`);

    // --------------------------------------------------
    // NOTIFY REMAINING WAITERS OF THEIR NEW POSITION
    //
    // Without this, a buyer's position freezes at whatever
    // it was when they first joined the queue, even as
    // people ahead of them get promoted.
    // --------------------------------------------------

    const queueKey = `waiting-room:${productId}`;
    const stillWaiting = await redis.zrange(queueKey, 0, -1);

    console.log(`[PIPELINE] Broadcasting positions to ${stillWaiting.length} waiting buyer(s)`);

    for (let i = 0; i < stillWaiting.length; i++) {
      emitQueuePosition(productId, stillWaiting[i], i + 1);
    }

    return {
      released: true,
      promoted,
    };
  } catch (err) {
    console.error("releaseBuyerAndPromote error:", err);

    throw err;
  }
}

module.exports = {
  releaseBuyerAndPromote,
  ACTIVE_CAPACITY,
};