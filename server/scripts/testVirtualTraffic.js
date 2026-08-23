const {
  generateVirtualBuyers,
} = require("../services/virtualBuyerTraffic");

const {
  redis,
} = require("../redis/redisClient");

const productId = process.argv[2];

async function run() {

  if (!productId) {
    console.log(
      "Usage: node scripts/testVirtualTraffic.js <productId>"
    );

    process.exit(1);
  }

  try {

    // ---------------------------------------------
    // Clean previous traffic
    // ---------------------------------------------

    await redis.del(
      `active-buyers:${productId}`
    );

    await redis.del(
      `waiting-room:${productId}`
    );

    console.log(
      "Previous traffic state cleared."
    );

    // ---------------------------------------------
    // Start 999 virtual buyers
    // ---------------------------------------------

    await generateVirtualBuyers(
      productId
    );

  } catch (err) {

    console.error(
      "Virtual traffic test failed:",
      err
    );

  } finally {

    await redis.quit();

  }
}

run();