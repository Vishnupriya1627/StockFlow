const { runVirtualBuyer } = require("./virtualBuyerService");

const { getActiveBuyerCount, getQueueLength } = require("../redis/queueClient");

const TOTAL_VIRTUAL_BUYERS = 999;

/**
 * Generate 999 virtual buyers.
 *
 * All buyers start concurrently.
 *
 * The traffic gate decides:
 *
 * 50 -> ACTIVE
 * 949 -> WAITING
 */
async function generateVirtualBuyers(productId) {
  console.log("");
  console.log("======================================");
  console.log("VIRTUAL BUYER TRAFFIC STARTED");
  console.log("======================================");
  console.log(`Product: ${productId}`);
  console.log(`Virtual buyers: ${TOTAL_VIRTUAL_BUYERS}`);
  console.log("");

  const startTime = Date.now();

  const monitor = setInterval(async () => {
  try {
    const active = await getActiveBuyerCount(productId);
    const waiting = await getQueueLength(productId);

    console.log(
      `[QUEUE] Active: ${active} | Waiting: ${waiting}`
    );
  } catch (err) {
    console.error("Queue monitor error:", err);
  }
}, 2000);

  // --------------------------------------------------
  // Launch all 999 buyers concurrently.
  // --------------------------------------------------

  const promises = Array.from({ length: TOTAL_VIRTUAL_BUYERS }, (_, index) =>
    runVirtualBuyer(productId, index + 1),
  );

  const results = await Promise.all(promises);

  clearInterval(monitor);

  // --------------------------------------------------
  // Count results
  // --------------------------------------------------

  const purchased = results.filter((r) => r.status === "PURCHASED").length;

  const soldOut = results.filter((r) => r.status === "SOLD_OUT").length;

  const expired = results.filter(
    (r) => r.status === "RESERVATION_EXPIRED",
  ).length;

  const waitingTimeout = results.filter(
    (r) => r.status === "WAITING_TIMEOUT",
  ).length;

  const releasedBeforeBuy = results.filter(
    (r) => r.status === "RELEASED_BEFORE_BUY",
  ).length;

  const errors = results.filter((r) => r.status === "ERROR").length;

  const active = await getActiveBuyerCount(productId);

  const queue = await getQueueLength(productId);

  const duration = Date.now() - startTime;

  const accountedFor =
    purchased + soldOut + expired + waitingTimeout + releasedBeforeBuy + errors;

  // --------------------------------------------------
  // Results
  // --------------------------------------------------

  console.log("");
  console.log("--------------------------------------");
  console.log("VIRTUAL TRAFFIC RESULTS");
  console.log("--------------------------------------");

  console.log(`Total buyers:       ${TOTAL_VIRTUAL_BUYERS}`);

  console.log(`Purchased:           ${purchased}`);

  console.log(`Sold out:            ${soldOut}`);

  console.log(`Reservation expired: ${expired}`);

  console.log(`Waiting timeout:     ${waitingTimeout}`);

  console.log(`Released before buy: ${releasedBeforeBuy}`);

  console.log(`Errors:              ${errors}`);

  console.log("");

  console.log(`Redis active:        ${active}`);

  console.log(`Redis waiting:       ${queue}`);

  console.log("");

  console.log(`Duration:            ${duration} ms`);

  console.log(`Accounted for:       ${accountedFor}/${TOTAL_VIRTUAL_BUYERS}`);

  if (accountedFor !== TOTAL_VIRTUAL_BUYERS) {
    console.error(
      `WARNING: ${TOTAL_VIRTUAL_BUYERS - accountedFor} buyers were not accounted for.`,
    );
  }

  console.log("--------------------------------------");
  console.log("");
}

module.exports = {
  generateVirtualBuyers,
  TOTAL_VIRTUAL_BUYERS,
};
