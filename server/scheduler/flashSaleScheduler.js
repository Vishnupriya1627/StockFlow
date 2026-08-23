
const Product = require('../models/Productmodel');
const { seedFlashSaleStock } = require('../redis/redisClient');
const { emitStockUpdate } = require('../socket/socketManager');

const POLL_INTERVAL_MS = 10000; 

async function checkAndTransitionDrops() {
    const now = new Date();

    try {
        // --- Transition: scheduled -> live ---
        const dueToStart = await Product.find({
            'flashSale.isEnabled': true,
            'flashSale.status': 'scheduled',
            'flashSale.startTime': { $lte: now },
        });

        for (const product of dueToStart) {
            await seedFlashSaleStock(product._id.toString(), product.flashSale.allocatedStock);
            product.flashSale.status = 'live';
            await product.save();

            emitStockUpdate(product._id.toString(), product.flashSale.allocatedStock);

            console.log(`[scheduler] Flash sale went LIVE: ${product.name} (${product._id}) — seeded ${product.flashSale.allocatedStock} units`);
        }

        // --- Transition: live -> ended ---
        const dueToEnd = await Product.find({
            'flashSale.isEnabled': true,
            'flashSale.status': 'live',
            'flashSale.endTime': { $lte: now },
        });

        for (const product of dueToEnd) {
            product.flashSale.status = 'ended';
            await product.save();

            console.log(`[scheduler] Flash sale ENDED: ${product.name} (${product._id})`);
            // NOTE: syncing final Redis stock count back into product.flashSale.soldCount
            // is exactly the kind of non-critical side effect that belongs in a BullMQ
            // job, not here — that's the next piece we'll build.
        }
    } catch (err) {
        console.error('[scheduler] Error while checking drops:', err);
    }
}

function startFlashSaleScheduler() {
    console.log(`[scheduler] Flash sale scheduler started (checking every ${POLL_INTERVAL_MS / 1000}s)`);
    setInterval(checkAndTransitionDrops, POLL_INTERVAL_MS);
    checkAndTransitionDrops();
}

module.exports = startFlashSaleScheduler;