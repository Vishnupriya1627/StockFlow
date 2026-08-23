const { randomUUID } = require('crypto');

function clientIdMiddleware(req, res, next) {
    let clientId = req.cookies?.clientId;

    if (!clientId) {
        clientId = randomUUID();
        res.cookie('clientId', clientId, {
            httpOnly: true,       // JS on the frontend can't read/tamper with it
            sameSite: 'lax',      // fine for localhost dev, revisit for production cross-site needs
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
    }

    req.clientId = clientId; // now available in every controller as req.clientId
    next();
}

module.exports = clientIdMiddleware;