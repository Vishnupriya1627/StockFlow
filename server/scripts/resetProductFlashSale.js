const { redis, seedFlashSaleStock } = require('../redis/redisClient');

const productId = process.argv[2];
const newStock = Number(process.argv[3]);

async function run() {
  if (!productId || !newStock) {
    console.log('Usage: node scripts/resetProductFlashSale.js <productId> <stockAmount>');
    process.exit(1);
  }

  try {
    console.log(`Resetting flash sale state for product: ${productId}`);

    // 1. Clear the active buyers set
    const activeKey = `active-buyers:${productId}`;
    const activeRemoved = await redis.del(activeKey);
    console.log(`Cleared active buyers set (existed: ${activeRemoved === 1})`);

    // 2. Clear the waiting room
    const queueKey = `waiting-room:${productId}`;
    const queueRemoved = await redis.del(queueKey);
    console.log(`Cleared waiting room (existed: ${queueRemoved === 1})`);

    // 3. Find and delete all reservation keys for this product
    const reservationKeys = await redis.keys(`reservation:*:${productId}`);
    if (reservationKeys.length > 0) {
      await redis.del(...reservationKeys);
      console.log(`Deleted ${reservationKeys.length} leftover reservation(s)`);

      // Also remove their entries from the expiry sorted set
      await redis.zrem('reservations:expiry', ...reservationKeys);
      console.log(`Cleaned up ${reservationKeys.length} expiry entries`);
    } else {
      console.log('No leftover reservations found');
    }

    // 4. Reset stats counters
    await redis.del(`stats:${productId}:requests`);
    await redis.del(`stats:${productId}:oversell_blocked`);
    console.log('Reset stats counters');

    // 5. Reset stock to a clean number
    await seedFlashSaleStock(productId, newStock);
    console.log(`Stock reset to ${newStock}`);

    console.log('');
    console.log('Done. Product is clean and ready for a fresh test.');
  } catch (err) {
    console.error('Reset failed:', err);
  } finally {
    await redis.quit();
  }
}

run();