// redis/redisClient.js
//
// Single shared Redis connection for the whole app, plus the attemptBuy()
// function that runs the atomic Lua script. Controllers import this file —
// they never talk to Redis directly, keeping the concurrency logic in one place.

const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis connection error:', err));

const luaScript = fs.readFileSync(
    path.join(__dirname, 'luaScripts', 'atomicStockDecrement.lua'),
    'utf8'
);

redis.defineCommand('buyAttempt', {
    numberOfKeys: 4,
    lua: luaScript,
});

/**
 * Attempt to buy `qty` units of a product on behalf of `clientId`.
 * This is the ONLY way stock should ever be decremented during a live sale.
 */
async function attemptBuy(productId, clientId, qty = 1, reservationTtlSeconds = 300) {
    const stockKey = `product:${productId}:stock`;
    const reservationKey = `reservation:${clientId}:${productId}`;
    const requestsKey = `stats:${productId}:requests`;
    const rejectedKey = `stats:${productId}:oversell_blocked`;

    const result = await redis.buyAttempt(
        stockKey,
        reservationKey,
        requestsKey,
        rejectedKey,
        qty,
        reservationTtlSeconds
    );

    if (result === -2) {
        return { success: false, reason: 'SALE_NOT_LIVE' };
    }
    if (result === -1) {
        return { success: false, reason: 'SOLD_OUT' };
    }
    return { success: true, remainingStock: result };
}

/**
 * Preload Redis with the sale's stock when a drop goes live.
 * You'll call this from a scheduler job once flashSale.status flips to 'live'.
 */
async function seedFlashSaleStock(productId, allocatedStock) {
    await redis.set(`product:${productId}:stock`, allocatedStock);
}

/**
 * Read current live stock — used by the product page / WebSocket broadcasts.
 */
async function getLiveStock(productId) {
    const stock = await redis.get(`product:${productId}:stock`);
    return stock === null ? null : Number(stock);
}

/**
 * Read the live ops counters for a product — this is what the Ops
 * Dashboard polls/displays. All three come from the same Lua script's
 * INCR calls, so they're always consistent with what actually happened.
 */
async function getStats(productId) {
    const [requests, rejected, stock] = await Promise.all([
        redis.get(`stats:${productId}:requests`),
        redis.get(`stats:${productId}:oversell_blocked`),
        redis.get(`product:${productId}:stock`),
    ]);

    return {
        requests: Number(requests) || 0,
        oversellBlocked: Number(rejected) || 0,
        remainingStock: stock === null ? null : Number(stock),
    };
}

module.exports = { redis, attemptBuy, seedFlashSaleStock, getLiveStock, getStats };