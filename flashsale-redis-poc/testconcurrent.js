// testConcurrent.js
//
// This is the moment of truth: it simulates hundreds of people clicking
// "Buy Now" on the exact same product at the exact same instant, and proves
// the atomic Lua script never lets total sold exceed allocated stock —
// no matter how much concurrency you throw at it.
//
// Run with: node testConcurrent.js

const { redis, attemptBuy } = require('./redisClient');

const PRODUCT_ID = 'test-product-1';
const ALLOCATED_STOCK = 100;   // pretend this is saleStock from Mongo
const CONCURRENT_BUYERS = 500; // way more people than there is stock

async function run() {
    // Reset everything so repeated test runs start clean
    await redis.del(`product:${PRODUCT_ID}:stock`);
    await redis.del(`stats:${PRODUCT_ID}:requests`);
    await redis.del(`stats:${PRODUCT_ID}:oversell_blocked`);
    // Clear any leftover reservation keys from a previous run
    const oldKeys = await redis.keys(`reservation:*:${PRODUCT_ID}`);
    if (oldKeys.length) await redis.del(...oldKeys);

    // Seed stock — this is what your "preload Redis at saleStartTime" step will do
    await redis.set(`product:${PRODUCT_ID}:stock`, ALLOCATED_STOCK);

    console.log(`Seeded stock: ${ALLOCATED_STOCK}`);
    console.log(`Firing ${CONCURRENT_BUYERS} concurrent buy attempts...\n`);

    // Fire ALL buy attempts at once — Promise.all means they hit Redis
    // essentially simultaneously, which is exactly the race condition
    // scenario that caused your original overselling bug.
    const attempts = Array.from({ length: CONCURRENT_BUYERS }, (_, i) =>
        attemptBuy(PRODUCT_ID, `test-client-${i}`, 1)
    );

    const results = await Promise.all(attempts);

    const successes = results.filter(r => r.success);
    const soldOut = results.filter(r => !r.success && r.reason === 'SOLD_OUT');

    const finalStock = await redis.get(`product:${PRODUCT_ID}:stock`);
    const totalRequests = await redis.get(`stats:${PRODUCT_ID}:requests`);
    const oversellBlocked = await redis.get(`stats:${PRODUCT_ID}:oversell_blocked`);

    console.log('--- RESULTS ---');
    console.log(`Successful buys:        ${successes.length}`);
    console.log(`Sold-out rejections:    ${soldOut.length}`);
    console.log(`Final stock in Redis:   ${finalStock}`);
    console.log(`Total requests counted: ${totalRequests}`);
    console.log(`Oversell attempts blocked: ${oversellBlocked}`);
    console.log('');

    // The three assertions that prove correctness
    const checks = [
        [successes.length === ALLOCATED_STOCK, `Exactly ${ALLOCATED_STOCK} succeeded`],
        [Number(finalStock) === 0, 'Final stock hit exactly 0, never negative'],
        [successes.length + soldOut.length === CONCURRENT_BUYERS, 'Every request got a definitive answer'],
    ];

    let allPassed = true;
    for (const [passed, label] of checks) {
        console.log(`${passed ? '✅' : '❌'} ${label}`);
        if (!passed) allPassed = false;
    }

    console.log(allPassed ? '\nNo overselling. The atomic script held under load.' : '\nSomething is wrong — investigate.');

    await redis.quit();
    process.exit(allPassed ? 0 : 1);
}

run().catch(err => {
    console.error('Test failed to run:', err);
    process.exit(1);
});