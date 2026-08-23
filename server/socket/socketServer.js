// socket/socketServer.js
//
// Creates the Socket.IO server and manages:
// - Product rooms
// - Buyer-specific rooms
// - Ops Dashboard room
//
// IMPORTANT:
// The clientId used by Socket.IO MUST be the same clientId
// used by the HTTP API.
//
// If the browser does not have a clientId cookie yet,
// Socket.IO creates one AND sends it to the browser as
// an HTTP cookie. Subsequent API requests will therefore
// use the exact same clientId.

const { Server } = require("socket.io");
const { randomUUID } = require("crypto");

const { setIO } = require("./socketManager");

// --------------------------------------------------
// Read clientId from cookie header
// --------------------------------------------------

function getClientIdFromCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex);
    const value = cookie.slice(separatorIndex + 1);

    if (name === "clientId") {
      return decodeURIComponent(value);
    }
  }

  return null;
}

// --------------------------------------------------
// SOCKET SERVER
// --------------------------------------------------

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        'https://stock-flow-nu-nine.vercel.app',
      ],
      credentials: true,
    },
  });

  // --------------------------------------------------
  // IMPORTANT:
  //
  // If Socket.IO is the FIRST thing the browser contacts,
  // there may not be a clientId cookie yet.
  //
  // Generate the clientId during the Engine.IO handshake
  // and send it back as a cookie.
  //
  // This guarantees that later HTTP requests use the SAME
  // clientId as the Socket.IO connection.
  // --------------------------------------------------

  io.engine.on("initial_headers", (headers, request) => {
    let clientId = getClientIdFromCookie(request.headers.cookie);

    if (!clientId) {
      clientId = randomUUID();

      headers["Set-Cookie"] =
        `clientId=${encodeURIComponent(clientId)}; ` +
        `Path=/; ` +
        `HttpOnly; ` +
        `SameSite=Lax; ` +
        `Max-Age=604800`;

      console.log(`Created clientId during Socket.IO handshake: ${clientId}`);
    }
  });

  // --------------------------------------------------
  // CONNECTION
  // --------------------------------------------------

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --------------------------------------------------
    // IDENTIFY BUYER
    // --------------------------------------------------

    let clientId = getClientIdFromCookie(socket.handshake.headers.cookie);

    // This should normally NEVER happen now because
    // initial_headers creates the cookie first.
    //
    // Keep this fallback for safety.
    //

    if (!clientId) {
      clientId = randomUUID();

      console.warn(
        `WARNING: Socket connected without clientId cookie. ` +
          `Generated fallback clientId: ${clientId}`,
      );
    }

    socket.data.clientId = clientId;

    // --------------------------------------------------
    // BUYER-SPECIFIC ROOM
    // --------------------------------------------------

    socket.join(`buyer:${clientId}`);

    console.log(`Buyer socket registered: ${clientId}`);

    console.log(`[SOCKET] Buyer room: buyer:${clientId}`);

    console.log(`Buyer room: buyer:${clientId}`);

    // --------------------------------------------------
    // PRODUCT ROOM
    // --------------------------------------------------

    socket.on("watchProduct", (productId) => {
      if (!productId) {
        return;
      }

      socket.join(`product:${productId}`);

      console.log(`Socket ${socket.id} watching product ${productId}`);
    });

    socket.on("unwatchProduct", (productId) => {
      if (!productId) {
        return;
      }

      socket.leave(`product:${productId}`);
    });

    // --------------------------------------------------
    // OPS DASHBOARD
    // --------------------------------------------------

    socket.on("watchOpsDashboard", () => {
      socket.join("ops-dashboard");
    });

    // --------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // --------------------------------------------------
  // MAKE IO AVAILABLE TO OTHER SERVICES
  // --------------------------------------------------

  setIO(io);

  return io;
}

module.exports = initSocketServer;
