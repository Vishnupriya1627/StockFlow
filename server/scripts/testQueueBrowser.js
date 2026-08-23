const {
  runVirtualBuyer,
} = require("../services/virtualBuyerService");

const {
  getActiveBuyerCount,
  getQueueLength,
} = require("../redis/queueClient");

const {
  redis,
} = require("../redis/redisClient");

const productId = process.argv[2];

const TOTAL_VIRTUAL_BUYERS = 50;

async function run() {
  if (!productId) {
    console.log(
      "Usage: node scripts/testQueueBrowser.js <productId>",
    );

    process.exit(1);
  }

  try {
    // ---------------------------------------------
    // Clean previous virtual traffic
    // ---------------------------------------------

    await redis.del(`active-buyers:${productId}`);
    await redis.del(`waiting-room:${productId}`);

    console.log("Previous traffic state cleared.");

    // ---------------------------------------------
    // Start 50 virtual buyers
    // ---------------------------------------------

    console.log("");
    console.log("Starting 50 virtual buyers...");
    console.log("");

    const promises = Array.from(
      { length: TOTAL_VIRTUAL_BUYERS },
      (_, index) =>
        runVirtualBuyer(
          productId,
          index + 1,
        ),
    );

    // ---------------------------------------------
    // Monitor queue
    // ---------------------------------------------

    const monitor = setInterval(async () => {
      try {
        const active =
          await getActiveBuyerCount(productId);

        const waiting =
          await getQueueLength(productId);

        console.log(
          `[QUEUE] Active: ${active} | Waiting: ${waiting}`,
        );
      } catch (err) {
        console.error(
          "Queue monitor error:",
          err,
        );
      }
    }, 1000);

    // ---------------------------------------------
    // Wait for all virtual buyers
    // ---------------------------------------------

    const results =
      await Promise.all(promises);

    clearInterval(monitor);

    console.log("");
    console.log("Virtual buyers finished.");

    console.log(
      `Active: ${await getActiveBuyerCount(productId)}`,
    );

    console.log(
      `Waiting: ${await getQueueLength(productId)}`,
    );

    console.log("");
    console.log("Results:");

    const purchased =
      results.filter(
        (r) => r.status === "PURCHASED",
      ).length;

    const soldOut =
      results.filter(
        (r) => r.status === "SOLD_OUT",
      ).length;

    const errors =
      results.filter(
        (r) => r.status === "ERROR",
      ).length;

    console.log(
      `Purchased: ${purchased}`,
    );

    console.log(
      `Sold out: ${soldOut}`,
    );

    console.log(
      `Errors: ${errors}`,
    );
  } catch (err) {
    console.error(
      "Test failed:",
      err,
    );
  } finally {
    await redis.quit();
  }
}

run();