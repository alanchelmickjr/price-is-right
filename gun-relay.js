const Gun = require('gun');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8765;

/**
 * Enable CORS for all routes, explicitly allowing credentials and dynamic origin.
 * This is required for Gun.js auth to work with cookies or Authorization headers.
 */
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow all origins for dev, restrict in production as needed
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Log all request headers for /gun and /gun/* for diagnostics
app.use(['/gun', '/gun/*'], (req, res, next) => {
  console.log('[GUN RELAY][HEADERS]', req.method, req.originalUrl, req.headers);
  next();
});

// Serve Gun.js
app.use(Gun.serve);

// Create Gun instance
const gun = Gun({
  web: app,
  localStorage: false, // Disable localStorage on server
  radisk: true // Enable disk storage
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: Date.now(),
    peers: Object.keys(gun._.opt.peers || {}).length 
  });
});

const server = app.listen(port, () => {
  console.log(`🔫 Gun.js relay server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔄 P2P sync enabled for mobile-first data`);
});
// --- Minimal Gun.js relay diagnostics ---
// Log every new peer connection (WebSocket handshake)
gun.on('opt', ctx => {
  if (ctx && ctx.web && ctx.web._events && ctx.web._events.connection) {
    // Already has connection event
    return;
  }
  if (ctx && ctx.web && ctx.web.on) {
    ctx.web.on('connection', (socket, req) => {
      const ip = req && req.connection && req.connection.remoteAddress;
      console.log(`[GUN RELAY] New WebSocket connection from: ${ip || 'unknown'}`);
    });
  }
});

// Log Gun.js peer events (for debugging P2P mesh)
gun.on('hi', peer => {
  if (peer && peer.url) {
    console.log(`[GUN RELAY] Peer connected: ${peer.url}`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Gun.js relay server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Gun.js relay server...');
  server.close(() => {
    process.exit(0);
  });
});
// --- Enumerate possible gun.js login failure sources for diagnostics ---
console.log('[GUN RELAY][DIAG] Enumerating possible login failure sources:');
console.log('[GUN RELAY][DIAG] 1. CORS misconfiguration (check allowed origins, credentials)');
console.log('[GUN RELAY][DIAG] 2. Gun.js peer connection issues (network/firewall, port 8765)');
console.log('[GUN RELAY][DIAG] 3. Session/cookie handling (stateless relay, no session persistence)');
console.log('[GUN RELAY][DIAG] 4. Client/server version mismatch (gun.js client vs relay)');
console.log('[GUN RELAY][DIAG] 5. Gun.js relay not reachable from client (check browser console for WebSocket errors)');
console.log('[GUN RELAY][DIAG] 6. Gun.js relay process crash or restart (see exit/exception logs above)');
console.log('[GUN RELAY][DIAG] 7. Client-side auth logic not calling gun.user().auth() correctly or missing credentials');
// --- Exit diagnostics: log reason and code ---
process.on('exit', (code) => {
  console.log(`[GUN RELAY] Process exiting with code: ${code}`);
});
process.on('uncaughtException', (err) => {
  console.error('[GUN RELAY] Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[GUN RELAY] Unhandled Rejection:', reason);
  process.exit(1);
});
