const { randomUUID } = require('crypto');

function clientIdMiddleware(req, res, next) {
    let clientId = req.cookies?.clientId;

    if (!clientId) {
        clientId = randomUUID();
        res.cookie('clientId', clientId, {
            httpOnly: true,       // JS on the frontend can't read/tamper with it
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production', // required when sameSite is 'none'
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
    }

    req.clientId = clientId; // now available in every controller as req.clientId
    next();
}

module.exports = clientIdMiddleware;