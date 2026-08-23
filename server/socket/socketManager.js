// socket/socketManager.js
//
// Central Socket.IO manager.
//
// index.js creates the Socket.IO instance and calls setIO().
// Other modules can then emit events without importing index.js,
// avoiding circular dependencies.

let ioInstance = null;

function setIO(io) {
    ioInstance = io;
}

function getIO() {
    if (!ioInstance) {
        throw new Error(
            'Socket.IO has not been initialized yet. ' +
            'Call setIO() in index.js first.'
        );
    }

    return ioInstance;
}


// --------------------------------------------------
// STOCK EVENTS
// --------------------------------------------------

function emitStockUpdate(
    productId,
    remainingStock
) {
    if (!ioInstance) return;

    ioInstance
        .to(`product:${productId}`)
        .emit('stockUpdate', {
            productId,
            remainingStock,
        });
}


// --------------------------------------------------
// OPS DASHBOARD EVENTS
// --------------------------------------------------

function emitOpsStats(
    productId,
    stats
) {
    if (!ioInstance) return;

    ioInstance
        .to('ops-dashboard')
        .emit('opsStatsUpdate', {
            productId,
            ...stats,
        });
}


// --------------------------------------------------
// WAITING ROOM
// --------------------------------------------------

/**
 * Tell one specific buyer that they have
 * been promoted from the waiting room.
 *
 * The buyer must have joined:
 *
 * buyer:<clientId>
 */
function emitQueuePromotion(
    productId,
    clientId
) {
    if (!ioInstance) {
        console.log(
            "[SOCKET] Cannot emit queue promotion: ioInstance not initialized"
        );
        return;
    }

    const room = `buyer:${clientId}`;
    const socketsInRoom =
        ioInstance.sockets.adapter.rooms.get(room);

    console.log(
        `[SOCKET] queuePromoted -> ${room}`
    );

    console.log(
        `[SOCKET] Sockets in room: ${
            socketsInRoom
                ? socketsInRoom.size
                : 0
        }`
    );

    ioInstance
        .to(room)
        .emit("queuePromoted", {
            productId,
            clientId,
            message:
                "You have been promoted from the waiting room.",
        });
}


/**
 * Send a buyer's current queue position.
 *
 * This is useful when the browser is waiting
 * and we want to update its position in real time.
 */
function emitQueuePosition(
    productId,
    clientId,
    position
) {
    if (!ioInstance) return;

    ioInstance
        .to(`buyer:${clientId}`)
        .emit('queuePosition', {
            productId,
            clientId,
            position,
        });
}


module.exports = {
    setIO,
    getIO,
    emitStockUpdate,
    emitOpsStats,
    emitQueuePromotion,
    emitQueuePosition,
};