# Kill any processes using critical ports before starting services
for port in 8765 8080 3000; do
  if lsof -ti :$port >/dev/null; then
    echo "🔪 Killing process on port $port"
    lsof -ti :$port | xargs kill -9
  fi
done
#!/bin/bash

# Simply eBay - Complete Startup Script
# Starts all required services in the correct order

set -e  # Exit on any error

echo "🚀 Starting Simply eBay Mobile App..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "⏳ Waiting for $service_name (port $port) to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        sleep 1
        echo -n "."
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}✗${NC}"
    echo -e "${RED}❌ $service_name failed to start after 30 seconds${NC}"
    return 1
}

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "gun-relay.js" 2>/dev/null || true
pkill -f "llava" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Please install it first:${NC}"
    echo "npm install -g pnpm"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start Gun.js relay server
echo "🔫 Starting Gun.js P2P relay server..."
if check_port 8765; then
    echo -e "${YELLOW}⚠️  Port 8765 already in use, using existing Gun.js relay${NC}"
else
    # Create temporary Gun.js relay server
    cat > gun-relay-temp.js << 'EOF'
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
EOF

    # Start Gun.js relay in background
    node gun-relay-temp.js > gun-relay.log 2>&1 &
    GUN_PID=$!
    echo "Gun.js relay PID: $GUN_PID"
    
    # Wait for Gun.js to be ready
    if ! wait_for_service 8765 "Gun.js relay"; then
        echo -e "${RED}❌ Failed to start Gun.js relay server${NC}"
        exit 1
    fi
fi

# Start LlamaFile AI server if not running
echo "🤖 Starting LlamaFile AI server..."
if check_port 8080; then
    echo -e "${YELLOW}⚠️  Port 8080 already in use, using existing AI server${NC}"
else
    # Check if start-llava.sh exists
    if [ -f "start-llava.sh" ]; then
        chmod +x start-llava.sh
        ./start-llava.sh &
        LLAVA_PID=$!
        echo "LlamaFile PID: $LLAVA_PID"
        
        # Wait for AI server to be ready
        if ! wait_for_service 8080 "LlamaFile AI server"; then
            echo -e "${YELLOW}⚠️  LlamaFile AI server not available, continuing without it${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  LlamaFile startup script not found, skipping AI server${NC}"
    fi
fi

# Start Next.js development server
echo "⚛️  Starting Next.js development server..."
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 already in use, using existing Next.js server${NC}"
else
    # Start Next.js in background
    pnpm dev > nextjs.log 2>&1 &
    NEXTJS_PID=$!
    echo "Next.js PID: $NEXTJS_PID"
    
    # Wait for Next.js to be ready
    if ! wait_for_service 3000 "Next.js development server"; then
        echo -e "${RED}❌ Failed to start Next.js development server${NC}"
        exit 1
    fi
fi

echo ""
echo "🎉 Simply eBay is now running!"
echo "================================"
echo -e "${GREEN}📱 Web App:${NC}       http://localhost:3000"
echo -e "${GREEN}🔫 Gun.js Relay:${NC}  http://localhost:8765"
if check_port 8080; then
    echo -e "${GREEN}🤖 AI Server:${NC}     http://localhost:8080"
fi
echo ""
echo -e "${BLUE}📱 Mobile URLs (for testing on devices):${NC}"
echo -e "   WiFi: http://$(ipconfig getifaddr en0 2>/dev/null || echo "YOUR_IP"):3000"
echo ""
echo "✨ Features available:"
echo "   • AI-powered item recognition"
echo "   • Real-time price suggestions"
echo "   • One-tap eBay listing creation"
echo "   • P2P data synchronization"
echo ""
echo "🛠️  Logs:"
echo "   • Gun.js relay: gun-relay.log"
echo "   • Next.js: nextjs.log"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping Simply eBay services..."
    
    # Kill background processes
    if [ ! -z "$GUN_PID" ]; then
        kill $GUN_PID 2>/dev/null || true
    fi
    if [ ! -z "$LLAVA_PID" ]; then
        kill $LLAVA_PID 2>/dev/null || true
    fi
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null || true
    fi
    
    # Clean up temporary files
    rm -f gun-relay-temp.js
    
    echo "👋 Simply eBay stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and monitor services
while true; do
    sleep 5
    
    # Check if critical services are still running
    if ! check_port 3000; then
        echo -e "${RED}❌ Next.js server stopped unexpectedly${NC}"
        break
    fi
    
    if ! check_port 8765; then
        echo -e "${RED}❌ Gun.js relay stopped unexpectedly${NC}"
        break
    fi
done

cleanup
