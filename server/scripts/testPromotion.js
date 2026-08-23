const {
    getActiveBuyerCount,
    getQueueLength,
    tryEnterFlashSale,
    removeActiveBuyer,
    promoteNextBuyerAtomic,
} = require('../redis/queueClient');

const { redis } = require('../redis/redisClient');

const productId = process.argv[2];

const CAPACITY = 3;

async function run() {
    if (!productId) {
        console.log(
            'Usage: node scripts/testPromotion.js <productId>'
        );

        process.exit(1);
    }

    console.log('');
    console.log('==============================');
    console.log('STOCKFLOW PROMOTION TEST');
    console.log('==============================');
    console.log('');

    // Clean previous test state.
    await redis.del(
        `active-buyers:${productId}`
    );

    await redis.del(
        `waiting-room:${productId}`
    );

    console.log(
        `Capacity: ${CAPACITY}`
    );

    console.log('');
    console.log('Creating 6 buyers...');
    console.log('');

    for (let i = 1; i <= 6; i++) {
        const clientId = `promotion-buyer-${i}`;

        const result =
            await tryEnterFlashSale(
                productId,
                clientId,
                CAPACITY
            );

        console.log(
            `${clientId} -> ${
                result.active
                    ? 'ACTIVE'
                    : 'WAITING'
            }`
        );
    }

    console.log('');
    console.log('------------------------------');

    let active =
        await getActiveBuyerCount(productId);

    let waiting =
        await getQueueLength(productId);

    console.log(
        `Before promotion:`
    );

    console.log(
        `Active: ${active}`
    );

    console.log(
        `Waiting: ${waiting}`
    );

    console.log('');
    console.log(
        'Removing active buyer...'
    );

    await removeActiveBuyer(
        productId,
        'promotion-buyer-1'
    );

    console.log(
        'promotion-buyer-1 released'
    );

    console.log('');
    console.log(
        'Promoting next buyer...'
    );

    const promoted =
        await promoteNextBuyerAtomic(
            productId,
            CAPACITY
        );

    console.log(
        `Promoted: ${promoted}`
    );

    console.log('');
    console.log(
        '------------------------------'
    );

    active =
        await getActiveBuyerCount(productId);

    waiting =
        await getQueueLength(productId);

    console.log(
        `After promotion:`
    );

    console.log(
        `Active: ${active}`
    );

    console.log(
        `Waiting: ${waiting}`
    );

    console.log('');
    console.log(
        '=============================='
    );

    console.log(
        'PROMOTION TEST COMPLETE'
    );

    console.log(
        '=============================='
    );

    await redis.quit();
}

run().catch((err) => {
    console.error(
        'Promotion test failed:',
        err
    );

    process.exit(1);
});