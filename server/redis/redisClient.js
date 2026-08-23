const Redis = require('ioredis');
const fs = require('fs');
const path = require('path');

const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    });

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis connection error:', err));

const atomicStockDecrementScript = fs.readFileSync(
    path.join(__dirname, 'luaScripts', 'atomicStockDecrement.lua'),
    'utf8'
);

redis.defineCommand('buyAttempt', {
    numberOfKeys: 5,
    lua: atomicStockDecrementScript,
});

const consumeReservationScript = fs.readFileSync(
    path.join(__dirname, 'luaScripts', 'consumeReservation.lua'),
    'utf8'
);

redis.defineCommand('consumeReservation', {
    numberOfKeys: 2,
    lua: consumeReservationScript,
});

const releaseReservationScript = fs.readFileSync(
    path.join(__dirname, 'luaScripts', 'releaseReservation.lua'),
    'utf8'
);

redis.defineCommand('releaseReservation', {
    numberOfKeys: 3,
    lua: releaseReservationScript,
});

const RESERVATION_TTL_SECONDS = 300;

const RESERVATION_EXPIRY_KEY = 'reservations:expiry';

async function attemptBuy(
    productId,
    clientId,
    qty = 1,
    reservationTtlSeconds = RESERVATION_TTL_SECONDS
) {
    const stockKey = `product:${productId}:stock`;

    const reservationKey = `reservation:${clientId}:${productId}`;

    const requestsKey = `stats:${productId}:requests`;

    const rejectedKey = `stats:${productId}:oversell_blocked`;

    const result = await redis.buyAttempt(
        stockKey,
        reservationKey,
        requestsKey,
        rejectedKey,
        RESERVATION_EXPIRY_KEY,
        qty,
        reservationTtlSeconds
    );

    if (result === -2) {
        return {
            success: false,
            reason: 'SALE_NOT_LIVE',
        };
    }

    if (result === -1) {
        return {
            success: false,
            reason: 'SOLD_OUT',
        };
    }

    return {
        success: true,
        remainingStock: Number(result),
        reservationTtlSeconds,
    };
}

async function consumeReservation(productId, clientId) {
    const reservationKey = `reservation:${clientId}:${productId}`;

    const result = await redis.consumeReservation(
        reservationKey,
        RESERVATION_EXPIRY_KEY
    );

    return Number(result);
}

async function releaseReservation(productId, clientId) {
    const reservationKey = `reservation:${clientId}:${productId}`;

    const stockKey = `product:${productId}:stock`;

    const result = await redis.releaseReservation(
        reservationKey,
        RESERVATION_EXPIRY_KEY,
        stockKey
    );

    return Number(result);
}

async function seedFlashSaleStock(productId, allocatedStock) {
    await redis.set(
        `product:${productId}:stock`,
        allocatedStock
    );
}

async function getLiveStock(productId) {
    const stock = await redis.get(
        `product:${productId}:stock`
    );

    return stock === null ? null : Number(stock);
}

async function getStats(productId) {
    const [
        requests,
        rejected,
        stock,
    ] = await Promise.all([
        redis.get(`stats:${productId}:requests`),
        redis.get(`stats:${productId}:oversell_blocked`),
        redis.get(`product:${productId}:stock`),
    ]);

    return {
        requests: Number(requests) || 0,

        oversellBlocked: Number(rejected) || 0,

        remainingStock:
            stock === null
                ? null
                : Number(stock),
    };
}

module.exports = {
    redis,

    attemptBuy,

    consumeReservation,

    releaseReservation,

    seedFlashSaleStock,

    getLiveStock,

    getStats,

    RESERVATION_TTL_SECONDS,

    RESERVATION_EXPIRY_KEY,
};