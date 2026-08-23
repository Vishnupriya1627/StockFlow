const {
  removeActiveBuyer,
  promoteNextBuyerAtomic,
} = require("../redis/queueClient");

const { publishPromotion } = require("../redis/queuePubSub");

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
