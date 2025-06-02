#!/bin/bash
# Simply eBay - HTTPS Quick Start Script (Camera-enabled)

echo "🚀 Simply eBay - HTTPS Quick Start"
echo "=================================="
echo "🔒 Starting with HTTPS for camera permissions"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the project directory (where index.html is located)"
    exit 1
fi

echo "📋 Checking requirements..."

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python to run a local server."
    exit 1
fi

echo "✅ Python found: $PYTHON_CMD"

# Check for OpenSSL (for certificates)
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL not found. Please install OpenSSL for HTTPS support."
    exit 1
fi

echo "✅ OpenSSL found"

# Generate SSL certificates if they don't exist
if [ ! -f "cert.pem" ] || [ ! -f "key.pem" ]; then
    echo "🔐 Generating SSL certificates for HTTPS..."
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=Local/O=Simply eBay/CN=localhost" 2>/dev/null
    echo "✅ SSL certificates generated"
fi

# Check for Node.js (needed for Gun.js relay)
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Some data persistence features will be limited."
else
    echo "✅ Node.js found"
fi

# Check for llama-server
if ! command -v llama-server &> /dev/null; then
    echo "🤖 AI server not found. Some features will be limited."
    echo "💡 To install: brew install llama.cpp"
else
    echo "✅ llama-server found"
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start Gun.js relay server if Node.js is available
if command -v node &> /dev/null && [ -f "gun-relay.js" ]; then
    RELAY_PORT=8765
    if check_port $RELAY_PORT; then
        echo "⚠️  Port $RELAY_PORT is already in use. Trying port $((RELAY_PORT + 1))..."
        RELAY_PORT=$((RELAY_PORT + 1))
    fi
    
    echo "📦 Starting Gun.js relay server on port $RELAY_PORT..."
    node gun-relay.js $RELAY_PORT > /dev/null 2>&1 &
    RELAY_PID=$!
    sleep 1
    if kill -0 $RELAY_PID 2>/dev/null; then
        echo "✅ Gun.js relay server started on port $RELAY_PORT"
    else
        echo "⚠️  Gun.js relay server failed to start"
    fi
fi

# Start HTTPS web server
HTTPS_PORT=8443
if check_port $HTTPS_PORT; then
    echo "⚠️  Port $HTTPS_PORT is already in use. Trying port $((HTTPS_PORT + 1))..."
    HTTPS_PORT=$((HTTPS_PORT + 1))
fi

echo "🌐 Starting HTTPS web server on port $HTTPS_PORT..."
$PYTHON_CMD https-server.py &
WEB_PID=$!
sleep 2

# Start AI server if available
if command -v llama-server &> /dev/null; then
    AI_PORT=8080
    if check_port $AI_PORT; then
        echo "⚠️  Port $AI_PORT is already in use. Trying port $((AI_PORT + 1))..."
        AI_PORT=$((AI_PORT + 1))
    fi
    
    echo "🤖 Starting AI server on port $AI_PORT..."
    echo "📥 Downloading SmolVLM model (cached after first download)..."
    llama-server \
        --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF \
        --hf-file SmolVLM-500M-Instruct-Q8_0.gguf \
        --mmproj ggml-org/SmolVLM-500M-Instruct-GGUF/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf \
        --port $AI_PORT \
        --host 0.0.0.0 \
        --parallel 1 \
        --ctx-size 4096 \
        --threads $(sysctl -n hw.ncpu) > /dev/null 2>&1 &
    AI_PID=$!
fi

echo ""
echo "🎉 Simply eBay is starting up!"
echo "================================"
echo "🔒 HTTPS App: https://localhost:$HTTPS_PORT"
echo "📱 Ready for PWA installation and camera access"
echo ""
echo "⚠️  IMPORTANT: Accept the self-signed certificate when prompted"
echo "   This enables camera permissions for the app"
echo ""
echo "📋 Services:"
echo "   🌐 HTTPS Web Server: Port $HTTPS_PORT"
if [ ! -z "$RELAY_PID" ]; then
    echo "   📦 Gun.js Relay: Port $RELAY_PORT"
fi
if [ ! -z "$AI_PID" ]; then
    echo "   🤖 AI Server: Port $AI_PORT"
fi
echo ""
echo "💡 To install on mobile devices:"
echo "   1. Connect to same WiFi network"
echo "   2. Find your local IP: ifconfig | grep 'inet '"
echo "   3. Use https://[YOUR-IP]:$HTTPS_PORT on mobile"
echo "   4. Accept certificate and tap 'Add to Home Screen'"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null
    fi
    if [ ! -z "$RELAY_PID" ]; then
        kill $RELAY_PID 2>/dev/null
    fi
    if [ ! -z "$AI_PID" ]; then
        kill $AI_PID 2>/dev/null
    fi
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
