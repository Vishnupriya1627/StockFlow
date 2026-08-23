const { randomUUID } = require("crypto");

const {
  tryEnterFlashSale,
  isActiveBuyer,
} = require("../redis/queueClient");

const {
  attemptBuy,
  consumeReservation,
} = require("../redis/redisClient");

const {
  releaseBuyerAndPromote,
} = require("./flashSalePipeline");

const ACTIVE_CAPACITY = 50;

const MIN_BUY_DELAY_MS = 5000;
const MAX_BUY_DELAY_MS = 15000;

const MIN_CHECKOUT_DELAY_MS = 5000;
const MAX_CHECKOUT_DELAY_MS = 15000;

const POLL_INTERVAL_MS = 500;
const MAX_WAIT_MS = 15 * 60 * 1000;


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


function randomDelay(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}


async function waitUntilActive(
  productId,
  clientId
) {
  let waited = 0;

  while (waited < MAX_WAIT_MS) {

    const active =
      await isActiveBuyer(
        productId,
        clientId
      );

    if (active) {
      return true;
    }

    await sleep(POLL_INTERVAL_MS);

    waited += POLL_INTERVAL_MS;
  }

  return false;
}


async function runVirtualBuyer(
  productId,
  buyerNumber
) {
  const clientId =
    `virtual-${buyerNumber}-${randomUUID()}`;

  let active = false;

  try {

    // ------------------------------------------
    // 1. ENTER TRAFFIC GATE
    // ------------------------------------------

    const gateResult =
      await tryEnterFlashSale(
        productId,
        clientId,
        ACTIVE_CAPACITY
      );


    // ------------------------------------------
    // 2. IF WAITING, POLL REDIS UNTIL PROMOTED
    // ------------------------------------------

    if (!gateResult.active) {

      console.log(
        `[VIRTUAL ${buyerNumber}] Waiting...`
      );

      active =
        await waitUntilActive(
          productId,
          clientId
        );

      if (!active) {
        return {
          clientId,
          buyerNumber,
          status: "WAITING_TIMEOUT",
        };
      }

      console.log(
        `[VIRTUAL ${buyerNumber}] Promoted to ACTIVE`
      );

    } else {

      active = true;

      console.log(
        `[VIRTUAL ${buyerNumber}] Entered ACTIVE`
      );
    }


    // ------------------------------------------
    // 3. SIMULATE THINKING TIME
    // ------------------------------------------

    await sleep(
      randomDelay(
        MIN_BUY_DELAY_MS,
        MAX_BUY_DELAY_MS
      )
    );


    // ------------------------------------------
    // 4. VERIFY STILL ACTIVE
    // ------------------------------------------

    const stillActive =
      await isActiveBuyer(
        productId,
        clientId
      );

    if (!stillActive) {

      active = false;

      return {
        clientId,
        buyerNumber,
        status: "RELEASED_BEFORE_BUY",
      };
    }


    // ------------------------------------------
    // 5. ATTEMPT BUY
    // ------------------------------------------

    const buyResult =
      await attemptBuy(
        productId,
        clientId,
        1
      );

    if (!buyResult.success) {

      await releaseBuyerAndPromote(
        productId,
        clientId
      );

      active = false;

      return {
        clientId,
        buyerNumber,
        status: buyResult.reason,
      };
    }


    // ------------------------------------------
    // 6. SIMULATE CHECKOUT TIME
    // ------------------------------------------

    await sleep(
      randomDelay(
        MIN_CHECKOUT_DELAY_MS,
        MAX_CHECKOUT_DELAY_MS
      )
    );


    // ------------------------------------------
    // 7. CONSUME RESERVATION
    // ------------------------------------------

    const quantity =
      await consumeReservation(
        productId,
        clientId
      );

    if (quantity <= 0) {

      await releaseBuyerAndPromote(
        productId,
        clientId
      );

      active = false;

      return {
        clientId,
        buyerNumber,
        status: "RESERVATION_EXPIRED",
      };
    }


    // ------------------------------------------
    // 8. RELEASE SLOT
    // ------------------------------------------

    await releaseBuyerAndPromote(
      productId,
      clientId
    );

    active = false;

    return {
      clientId,
      buyerNumber,
      status: "PURCHASED",
    };

  } catch (err) {

    console.error(
      `[VIRTUAL ${buyerNumber}] Error:`,
      err
    );

    if (active) {
      try {

        await releaseBuyerAndPromote(
          productId,
          clientId
        );

      } catch (cleanupError) {

        console.error(
          `[VIRTUAL ${buyerNumber}] Cleanup error:`,
          cleanupError
        );
      }
    }

    return {
      clientId,
      buyerNumber,
      status: "ERROR",
    };
  }
}


module.exports = {
  runVirtualBuyer,
  ACTIVE_CAPACITY,
};