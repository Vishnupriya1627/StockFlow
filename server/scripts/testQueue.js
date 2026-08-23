const {
    joinQueue,
    getQueuePosition,
    getQueueLength,
    getQueueStats,
} = require('../redis/queueClient');

const { redis } = require('../redis/redisClient');

async function run() {
    const productId = 'queue-load-test';

    await redis.del(`waiting-room:${productId}`);
    await redis.del(`active-buyers:${productId}`);

    const TOTAL_BUYERS = 1000;

    console.log('\n==============================');
    console.log('STOCKFLOW QUEUE LOAD TEST');
    console.log('==============================');

    console.log(`\nCreating ${TOTAL_BUYERS} virtual buyers...\n`);

    const start = Date.now();

    const buyers = Array.from(
        { length: TOTAL_BUYERS },
        (_, index) => `virtual-buyer-${index + 1}`
    );

    const results = await Promise.all(
        buyers.map((clientId) =>
            joinQueue(productId, clientId)
        )
    );

    const elapsed = Date.now() - start;

    console.log(`Completed in ${elapsed}ms`);

    console.log('\n------------------------------');

    console.log(
        `Queue length: ${await getQueueLength(productId)}`
    );

    console.log('\n------------------------------');

    const firstBuyer = await getQueuePosition(
        productId,
        'virtual-buyer-1'
    );

    const middleBuyer = await getQueuePosition(
        productId,
        'virtual-buyer-500'
    );

    const lastBuyer = await getQueuePosition(
        productId,
        'virtual-buyer-1000'
    );

    console.log(
        `virtual-buyer-1 position: #${firstBuyer}`
    );

    console.log(
        `virtual-buyer-500 position: #${middleBuyer}`
    );

    console.log(
        `virtual-buyer-1000 position: #${lastBuyer}`
    );

    console.log('\n------------------------------');

    const stats = await getQueueStats(productId);

    console.log('Final queue stats:');
    console.log(stats);

    console.log('\n==============================');
    console.log('LOAD TEST COMPLETE');
    console.log('==============================\n');

    await redis.quit();
}

run().catch((err) => {
    console.error('Queue load test failed:', err);
    process.exit(1);
});