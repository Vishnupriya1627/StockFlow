// scripts/loadTest.js
//
// This is the real version of your earlier standalone Redis test — instead of
// calling the Lua script directly, this fires concurrent HTTP requests at your
// ACTUAL running Express server, exactly like hundreds of real users clicking
// "Buy Now" at once. This proves the whole stack (Express -> Redis -> Lua)
// holds up together, not just the Redis layer in isolation.
//
// BEFORE RUNNING: make sure your server is running (node index.js / nodemon)
// and reseed stock fresh:
//   docker exec -it flashsale-redis redis-cli set product:TESTSKU:stock 100
//
// Run with: node scripts/loadTest.js

const PRODUCT_ID = 'TESTSKU';
const BASE_URL = 'http://localhost:3000';
const CONCURRENT_BUYERS = 500; // way more than the seeded stock

async function fireBuyAttempt() {
    const res = await fetch(`${BASE_URL}/flashsale/${PRODUCT_ID}/buy`, {
        method: 'POST',
    });
    const body = await res.json();
    return { status: res.status, ...body };
}

async function run() {
    console.log(`Firing ${CONCURRENT_BUYERS} concurrent buy requests at ${BASE_URL}...\n`);

    const attempts = Array.from({ length: CONCURRENT_BUYERS }, () => fireBuyAttempt());
    const results = await Promise.all(attempts);

    const successes = results.filter(r => r.success);
    const soldOut = results.filter(r => !r.success && r.reason === 'SOLD_OUT');
    const saleNotLive = results.filter(r => !r.success && r.reason === 'SALE_NOT_LIVE');
    const otherErrors = results.filter(r => !r.success && r.reason !== 'SOLD_OUT' && r.reason !== 'SALE_NOT_LIVE');

    console.log('--- RESULTS ---');
    console.log(`Successful buys:     ${successes.length}`);
    console.log(`Sold-out rejections: ${soldOut.length}`);
    console.log(`Sale-not-live:       ${saleNotLive.length}`);
    console.log(`Other errors:        ${otherErrors.length}`);

    if (otherErrors.length > 0) {
        console.log('\nSample error:', otherErrors[0]);
    }

    // Check final stock via the live endpoint
    const stockRes = await fetch(`${BASE_URL}/flashsale/${PRODUCT_ID}/stock`);
    const stockBody = await stockRes.json();
    console.log(`\nFinal stock reading: ${stockBody.stock}`);

    console.log('\n' + (stockBody.stock === 0 && successes.length + soldOut.length + saleNotLive.length === CONCURRENT_BUYERS
        ? '✅ No overselling — the full HTTP -> Redis -> Lua path held under load.'
        : '❌ Something looks off — investigate the numbers above.'));
}

run().catch(err => {
    console.error('Load test failed to run:', err);
});