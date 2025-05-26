const Gun = require('gun');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8765;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'gun-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Gun server with file storage
const server = app.listen(port, () => {
  console.log(`🔫 Gun.js relay server running on http://localhost:${port}`);
});

// Initialize Gun with server
const gun = Gun({
  web: server,
  file: path.join(dataDir, 'data.json'),
  localStorage: false,
  radisk: true
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔫 Shutting down Gun.js relay server...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🔫 Shutting down Gun.js relay server...');
  server.close();
  process.exit(0);
});
