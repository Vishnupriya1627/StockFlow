// redis/queuePubSub.js
//
// Cross-process bridge for queue promotions.
//
// Any process (script, worker, real server) can call publishPromotion().
// Only the real server process (the one with a live Socket.IO instance)
// should call subscribeToPromotions().

const Redis = require('ioredis');

const CHANNEL = 'queue:promotions';

function createRedisConnection() {
    return process.env.REDIS_URL
        ? new Redis(process.env.REDIS_URL)
        : new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
        });
}

// Independent connections — pub/sub should never share a connection
// with normal Redis commands (a subscribed connection can't run GET/SET/etc).
const publisherClient = createRedisConnection();
const subscriberClient = createRedisConnection();

publisherClient.on('error', (err) => console.error('[PUBSUB] Publisher error:', err));
subscriberClient.on('error', (err) => console.error('[PUBSUB] Subscriber error:', err));

async function publishPromotion(productId, clientId) {
    await publisherClient.publish(
        CHANNEL,
        JSON.stringify({ productId, clientId })
    );

    console.log(`[PUBSUB] Published promotion for ${clientId}`);
}

async function subscribeToPromotions(onPromotion) {
    await subscriberClient.subscribe(CHANNEL);

    subscriberClient.on('message', (channel, message) => {
        if (channel !== CHANNEL) return;

        try {
            const { productId, clientId } = JSON.parse(message);
            onPromotion(productId, clientId);
        } catch (err) {
            console.error('[PUBSUB] Bad promotion message:', err);
        }
    });

    console.log(`[PUBSUB] Subscribed to ${CHANNEL}`);
}

module.exports = { publishPromotion, subscribeToPromotions };