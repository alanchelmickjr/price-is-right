#!/bin/bash
# Simply eBay - Quick Start Script (Simplified for eBay Testing)

echo "🚀 Simply eBay - Quick Start"
echo "==============================="

# Kill any existing processes first
echo "🧹 Cleaning up any existing processes..."
pkill -f "python.*http.server" 2>/dev/null || true
pkill -f "node.*gun-relay" 2>/dev/null || true
pkill -f "/opt/homebrew/bin/llama-server" 2>/dev/null || true
pkill -f "ebay-proxy" 2>/dev/null || true
sleep 2

echo "📋 Checking requirements..."

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    echo "❌ Python not found. Please install Python."
    exit 1
fi
echo "✅ Python found: $PYTHON_CMD"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js."
    exit 1
fi
echo "✅ Node.js found"

# Start web server
echo "🌐 Starting web server on port 8000..."
$PYTHON_CMD -m http.server 8000 > web-server.log 2>&1 &
WEB_PID=$!
sleep 1

if ! ps -p $WEB_PID > /dev/null; then
    echo "❌ Failed to start web server"
    exit 1
fi
echo "✅ Web server started on port 8000"

# Start Gun.js relay
echo "📦 Starting Gun.js relay server on port 8765..."
node gun-relay.js > gun-relay.log 2>&1 &
GUN_PID=$!
sleep 2

if ! ps -p $GUN_PID > /dev/null; then
    echo "❌ Failed to start Gun.js relay"
    cat gun-relay.log
    exit 1
fi
echo "✅ Gun.js relay started on port 8765"

# Start AI server
AI_SERVER=true
if command -v /opt/homebrew/bin/llama-server &> /dev/null; then
    echo "🤖 Starting AI server on port 8080..."
    /opt/homebrew/bin/llama-server \
        --model ~/.cache/huggingface/hub/models--ggml-org--SmolVLM-500M-Instruct-GGUF/snapshots/*/SmolVLM-500M-Instruct-Q8_0.gguf \
        --mmproj ~/.cache/huggingface/hub/models--ggml-org--SmolVLM-500M-Instruct-GGUF/snapshots/*/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf \
        --host 0.0.0.0 --port 8080 \
        --chat-template chatml \
        --log-disable > ai-server.log 2>&1 &
    AI_PID=$!
    
    echo "⏳ Waiting for AI server..."
    for i in {1..30}; do
        if curl -s "http://localhost:8080/health" >/dev/null 2>&1; then
            echo "✅ AI server ready!"
            break
        fi
        sleep 1
    done
else
    echo "⚠️  llama-server not found - AI features disabled"
    AI_SERVER=false
fi

# Start eBay proxy
echo "🛒 Starting eBay API proxy on port 8444..."
python3 ./ebay-proxy.py 8444 > ebay-proxy.log 2>&1 &
EBAY_PID=$!
sleep 1

if ! ps -p $EBAY_PID > /dev/null; then
    echo "❌ Failed to start eBay proxy"
    cat ebay-proxy.log
else
    echo "✅ eBay proxy started on port 8444"
fi

echo ""
echo "🎉 Simply eBay is running!"
echo "========================="
echo ""
echo "📱 Main App: http://localhost:8000"
echo "🛒 eBay Proxy: http://localhost:8444 (for CORS)"
echo "📦 Gun.js Relay: http://localhost:8765"
if [ "$AI_SERVER" = true ]; then
    echo "🤖 AI Server: http://localhost:8080"
fi
echo ""
echo "🎯 Test eBay Integration:"
echo "   1. Open http://localhost:8000"
echo "   2. Go to Settings > eBay API Setup"
echo "   3. Test the connection (should work now!)"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Stopping all services..."
    [ ! -z "$WEB_PID" ] && kill $WEB_PID 2>/dev/null
    [ ! -z "$GUN_PID" ] && kill $GUN_PID 2>/dev/null
    [ ! -z "$AI_PID" ] && kill $AI_PID 2>/dev/null
    [ ! -z "$EBAY_PID" ] && kill $EBAY_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
