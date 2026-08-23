const {
    redis,
} = require('./redisClient');

const fs = require('fs');
const path = require('path');


// --------------------------------------------------
// TRAFFIC GATE
// --------------------------------------------------

const trafficGateScript = fs.readFileSync(
    path.join(
        __dirname,
        'luaScripts',
        'trafficGate.lua'
    ),
    'utf8'
);

redis.defineCommand('trafficGate', {
    numberOfKeys: 2,
    lua: trafficGateScript,
});


// --------------------------------------------------
// QUEUE CONFIG
// --------------------------------------------------

const QUEUE_PREFIX = 'waiting-room';
const ACTIVE_PREFIX = 'active-buyers';

function getQueueKey(productId) {
    return `${QUEUE_PREFIX}:${productId}`;
}

function getActiveKey(productId) {
    return `${ACTIVE_PREFIX}:${productId}`;
}


// --------------------------------------------------
// PROMOTION
// --------------------------------------------------

const promoteBuyerScript = fs.readFileSync(
    path.join(
        __dirname,
        'luaScripts',
        'promoteBuyer.lua'
    ),
    'utf8'
);

redis.defineCommand('promoteBuyer', {
    numberOfKeys: 2,
    lua: promoteBuyerScript,
});


// --------------------------------------------------
// JOIN / ENTER FLASH SALE
// --------------------------------------------------

async function tryEnterFlashSale(
    productId,
    clientId,
    capacity
) {
    const activeKey = getActiveKey(productId);
    const queueKey = getQueueKey(productId);

    const [
        seconds,
        microseconds,
    ] = await redis.time();

    const score =
        Number(seconds) * 1000000 +
        Number(microseconds);

    const result = await redis.trafficGate(
        activeKey,
        queueKey,
        clientId,
        capacity,
        score
    );

    return {
        active: result === 1,
        waiting: result === 0,
    };
}


// --------------------------------------------------
// QUEUE POSITION
// --------------------------------------------------

async function getQueuePosition(
    productId,
    clientId
) {
    const queueKey = getQueueKey(productId);

    const rank = await redis.zrank(
        queueKey,
        clientId
    );

    if (rank === null) {
        return null;
    }

    return rank + 1;
}


// --------------------------------------------------
// QUEUE LENGTH
// --------------------------------------------------

async function getQueueLength(productId) {
    const queueKey = getQueueKey(productId);

    return redis.zcard(queueKey);
}


// --------------------------------------------------
// REMOVE FROM QUEUE
// --------------------------------------------------

async function removeFromQueue(
    productId,
    clientId
) {
    const queueKey = getQueueKey(productId);

    return redis.zrem(
        queueKey,
        clientId
    );
}


// --------------------------------------------------
// ACTIVE BUYERS
// --------------------------------------------------

async function addActiveBuyer(
    productId,
    clientId
) {
    const activeKey = getActiveKey(productId);

    return redis.sadd(
        activeKey,
        clientId
    );
}


async function removeActiveBuyer(
    productId,
    clientId
) {
    const activeKey = getActiveKey(productId);

    return redis.srem(
        activeKey,
        clientId
    );
}


async function isActiveBuyer(
    productId,
    clientId
) {
    const activeKey = getActiveKey(productId);

    return (
        await redis.sismember(
            activeKey,
            clientId
        )
    ) === 1;
}


async function getActiveBuyerCount(
    productId
) {
    const activeKey = getActiveKey(productId);

    return redis.scard(activeKey);
}


// --------------------------------------------------
// NEXT BUYER
// --------------------------------------------------

async function getNextBuyer(productId) {
    const queueKey = getQueueKey(productId);

    const result = await redis.zrange(
        queueKey,
        0,
        0
    );

    return result.length > 0
        ? result[0]
        : null;
}


// --------------------------------------------------
// ATOMIC PROMOTION
// --------------------------------------------------

async function promoteNextBuyerAtomic(
    productId,
    capacity
) {
    const activeKey = getActiveKey(productId);
    const queueKey = getQueueKey(productId);

    return redis.promoteBuyer(
        activeKey,
        queueKey,
        capacity
    );
}


// --------------------------------------------------
// QUEUE STATS
// --------------------------------------------------

async function getQueueStats(productId) {
    const [
        waiting,
        active,
    ] = await Promise.all([
        getQueueLength(productId),
        getActiveBuyerCount(productId),
    ]);

    return {
        waiting,
        active,
    };
}


// --------------------------------------------------
// OLD MANUAL PROMOTION
// --------------------------------------------------

async function promoteNextBuyer(productId) {
    const nextBuyer =
        await getNextBuyer(productId);

    if (!nextBuyer) {
        return null;
    }

    const removed =
        await removeFromQueue(
            productId,
            nextBuyer
        );

    if (removed !== 1) {
        return null;
    }

    await addActiveBuyer(
        productId,
        nextBuyer
    );

    return nextBuyer;
}


module.exports = {
    tryEnterFlashSale,

    getQueuePosition,
    getQueueLength,

    removeFromQueue,

    addActiveBuyer,
    removeActiveBuyer,
    isActiveBuyer,
    getActiveBuyerCount,

    getNextBuyer,
    getQueueStats,

    promoteNextBuyer,
    promoteNextBuyerAtomic,
};