const {
    tryEnterFlashSale,
    getQueueLength,
    getActiveBuyerCount,
    getQueuePosition,
} = require('../redis/queueClient');

const { redis } = require('../redis/redisClient');

async function run() {
    const productId = 'traffic-gate-test';

    const ACTIVE_CAPACITY = 50;
    const TOTAL_BUYERS = 1000;

    await redis.del(
        `waiting-room:${productId}`
    );

    await redis.del(
        `active-buyers:${productId}`
    );

    console.log('\n==============================');
    console.log('STOCKFLOW TRAFFIC GATE TEST');
    console.log('==============================\n');

    console.log(
        `Buyers: ${TOTAL_BUYERS}`
    );

    console.log(
        `Active capacity: ${ACTIVE_CAPACITY}\n`
    );

    const buyers = Array.from(
        { length: TOTAL_BUYERS },
        (_, index) =>
            `gate-buyer-${index + 1}`
    );

    const start = Date.now();

    const results = await Promise.all(
        buyers.map((clientId) =>
            tryEnterFlashSale(
                productId,
                clientId,
                ACTIVE_CAPACITY
            )
        )
    );

    const elapsed =
        Date.now() - start;

    const activeCount =
        results.filter(
            (result) => result.active
        ).length;

    const waitingCount =
        results.filter(
            (result) => result.waiting
        ).length;

    const redisActive =
        await getActiveBuyerCount(
            productId
        );

    const redisWaiting =
        await getQueueLength(
            productId
        );

    console.log(
        `Completed in ${elapsed}ms\n`
    );

    console.log('------------------------------');

    console.log(
        `Successful active entries: ${activeCount}`
    );

    console.log(
        `Waiting buyers: ${waitingCount}`
    );

    console.log(
        `Redis active count: ${redisActive}`
    );

    console.log(
        `Redis queue count: ${redisWaiting}`
    );

    console.log('------------------------------');

    const waitingBuyer =
        await getQueuePosition(
            productId,
            'gate-buyer-100'
        );

    console.log(
        `gate-buyer-100 queue position: #${waitingBuyer}`
    );

    console.log('\n==============================');
    console.log('TEST COMPLETE');
    console.log('==============================\n');

    await redis.quit();
}

run().catch((err) => {
    console.error(
        'Traffic gate test failed:',
        err
    );

    process.exit(1);
});