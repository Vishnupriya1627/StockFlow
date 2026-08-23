const {
    promoteNextBuyerAtomic,
} = require('../redis/queueClient');

const {
    emitQueuePromotion,
} = require('../socket/socketManager');

const ACTIVE_CAPACITY = 50;

/**
 * Promote waiting buyers until
 * the active pool is full.
 */
async function processQueue(productId) {
    const promoted = [];

    try {
        while (true) {

            const buyer =
                await promoteNextBuyerAtomic(
                    productId,
                    ACTIVE_CAPACITY
                );

            /**
             * No capacity or no buyers waiting.
             */
            if (!buyer) {
                break;
            }

            promoted.push(buyer);

            /**
             * Notify the promoted buyer.
             */
            emitQueuePromotion(
                productId,
                buyer
            );
        }

        return {
            promoted,
        };

    } catch (err) {
        console.error(
            'processQueue error:',
            err
        );

        throw err;
    }
}

module.exports = {
    processQueue,
    ACTIVE_CAPACITY,
};