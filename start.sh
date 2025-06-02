#!/bin/bash
# Simply eBay - Quick Start Script
#
# DEBUGGING NOTES:
# - Claude 3.5 previously installed conflicting llama-server versions
# - /usr/local/bin/llama-server has library issues (libmtmd.dylib)
# - /opt/homebrew/bin/llama-server works correctly
# - Always use the Homebrew version for stability
# - Future custom llama.cpp builds should go in different location
#
# MODEL NOTES:
# - Primary model: ggml-org/SmolVLM-500M-Instruct-GGUF (M2 compatible)
# - Fallback for non-Apple: HuggingFaceTB/SmolVLM-500M-Instruct
# - Actual files: SmolVLM-500M-Instruct-Q8_0.gguf + mmproj-SmolVLM-500M-Instruct-Q8_0.gguf

echo "🚀 Simply eBay - Quick Start"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the project directory (where index.html is located)"
    exit 1
fi

# Kill any existing processes first (be specific about llama-server path)
echo "🧹 Cleaning up any existing processes..."
pkill -f "python.*http.server" 2>/dev/null || true
pkill -f "node.*gun-relay" 2>/dev/null || true
pkill -f "/opt/homebrew/bin/llama-server" 2>/dev/null || true
pkill -f "/usr/local/bin/llama-server" 2>/dev/null || true  # Clean up broken installation too
sleep 2

echo "📋 Checking requirements..."

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python to run a local server."
    echo "   Or open index.html directly in your browser (some features may be limited)"
    exit 1
fi

echo "✅ Python found: $PYTHON_CMD"

# Check for Node.js (needed for Gun.js relay)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing Node.js for data persistence..."
    if command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ Please install Node.js manually from https://nodejs.org/"
        echo "   Gun.js data persistence will be limited without relay server"
    fi
else
    echo "✅ Node.js found"
fi

# Check for llama-server (use Homebrew version to avoid library conflicts)
LLAMA_SERVER="/opt/homebrew/bin/llama-server"
if [ ! -f "$LLAMA_SERVER" ]; then
    echo "🤖 Setting up your personal AI assistant (this keeps you safe!)"
    echo "📥 Installing llama.cpp automatically..."
    echo "🔒 This protects your privacy - everything stays on your device"
    echo "⏱️  One-time setup takes 2-3 minutes, then it's instant forever"
    echo ""
    
    # Auto-install llama.cpp via Homebrew
    if command -v brew &> /dev/null; then
        echo "🍺 Installing via Homebrew..."
        brew install llama.cpp
        if [ $? -eq 0 ] && [ -f "$LLAMA_SERVER" ]; then
            echo "✅ llama.cpp installed successfully!"
            AI_SERVER=true
        else
            echo "❌ Installation failed. AI features will be disabled."
            AI_SERVER=false
        fi
    else
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        AI_SERVER=false
    fi
else
    echo "✅ llama-server found (Homebrew version)"
    # Test if llama-server works properly
    if "$LLAMA_SERVER" --help >/dev/null 2>&1; then
        AI_SERVER=true
    else
        echo "⚠️  llama-server has issues. Trying to fix..."
        if command -v brew &> /dev/null; then
            brew reinstall llama.cpp
            if [ $? -eq 0 ]; then
                echo "✅ llama-server fixed!"
                AI_SERVER=true
            else
                echo "❌ Could not fix llama-server. AI features will be disabled."
                AI_SERVER=false
            fi
        else
            echo "❌ Cannot fix llama-server without Homebrew. AI features will be disabled."
            AI_SERVER=false
        fi
    fi
fi

# Find available ports
find_available_port() {
    local start_port=$1
    local port=$start_port
    while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
        port=$((port + 1))
    done
    echo $port
}

WEB_PORT=$(find_available_port 8000)
AI_PORT=$(find_available_port 8080)
GUN_PORT=$(find_available_port 8765)

if [ $WEB_PORT -ne 8000 ]; then
    echo "⚠️  Port 8000 is busy. Using port $WEB_PORT for web server."
fi
if [ $AI_PORT -ne 8080 ]; then
    echo "⚠️  Port 8080 is busy. Using port $AI_PORT for AI server."
fi
if [ $GUN_PORT -ne 8765 ]; then
    echo "⚠️  Port 8765 is busy. Using port $GUN_PORT for Gun.js relay."
fi

# Create temporary Gun.js relay server file
echo "const Gun = require('gun');
const server = require('http').createServer().listen($GUN_PORT);
const gun = Gun({web: server});
console.log('Gun.js relay server started on port $GUN_PORT');" > gun-relay.js

# Install Gun.js if not available
if ! npm list gun &> /dev/null; then
    echo "📦 Installing Gun.js for data persistence..."
    npm install gun --no-save &> /dev/null || {
        echo "⚠️  Gun.js installation failed. Data persistence may be limited."
    }
fi

# Start Gun.js relay server
echo "📦 Starting Gun.js relay server on port $GUN_PORT..."
node gun-relay.js > gun-relay.log 2>&1 &
GUN_PID=$!

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    
    # Kill processes by PID if available
    if [ ! -z "$WEB_PID" ] && kill -0 $WEB_PID 2>/dev/null; then
        kill $WEB_PID 2>/dev/null
        echo "   ✅ Web server stopped"
    fi
    if [ ! -z "$AI_PID" ] && kill -0 $AI_PID 2>/dev/null; then
        kill $AI_PID 2>/dev/null
        echo "   ✅ AI server stopped"
    fi
    if [ ! -z "$GUN_PID" ] && kill -0 $GUN_PID 2>/dev/null; then
        kill $GUN_PID 2>/dev/null
        echo "   ✅ Gun.js relay stopped"
    fi
    
    # Fallback: kill by process name (be specific about paths)
    pkill -f "python.*http.server" 2>/dev/null
    pkill -f "/opt/homebrew/bin/llama-server" 2>/dev/null
    pkill -f "/usr/local/bin/llama-server" 2>/dev/null
    pkill -f "node.*gun-relay" 2>/dev/null
    
    # Clean up temporary files
    rm -f gun-relay.js 2>/dev/null
    
    echo "🏁 All servers stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🌐 Starting web server on port $WEB_PORT..."

# Try to start the web server with error handling
start_web_server() {
    local attempts=0
    local max_attempts=3
    
    while [ $attempts -lt $max_attempts ]; do
        if $PYTHON_CMD -m http.server $WEB_PORT > /dev/null 2>&1 & then
            WEB_PID=$!
            sleep 2
            if kill -0 $WEB_PID 2>/dev/null; then
                echo "✅ Web server started on port $WEB_PORT"
                return 0
            fi
        fi
        
        attempts=$((attempts + 1))
        WEB_PORT=$(find_available_port $((WEB_PORT + 1)))
        echo "⚠️  Retrying with port $WEB_PORT..."
        sleep 1
    done
    
    echo "❌ Failed to start web server after $max_attempts attempts"
    return 1
}

if ! start_web_server; then
    cleanup
    exit 1
fi

if [ "$AI_SERVER" = true ]; then
    echo "🤖 Preparing AI server..."
    
    # Start the AI server with better error handling
    echo "🚀 Starting AI server on port $AI_PORT..."
    echo "⏳ This may take a moment to download/load the model..."
    
    # Start llama-server in background with detailed logging (M2 compatible)
    # Use cached mmproj file path
    MMPROJ_PATH="$HOME/Library/Caches/llama.cpp/ggml-org_SmolVLM-500M-Instruct-GGUF_mmproj-SmolVLM-500M-Instruct-Q8_0.gguf"
    
    if [ -f "$MMPROJ_PATH" ]; then
        echo "   Using cached mmproj file..."
        "$LLAMA_SERVER" \
            --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF \
            --hf-file SmolVLM-500M-Instruct-Q8_0.gguf \
            --mmproj "$MMPROJ_PATH" \
            --port $AI_PORT \
            --host 0.0.0.0 \
            --n-gpu-layers 0 \
            --chat-template chatml \
            --log-disable > ai-server.log 2>&1 &
    else
        echo "   Downloading mmproj file automatically..."
        "$LLAMA_SERVER" \
            --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF \
            --hf-file SmolVLM-500M-Instruct-Q8_0.gguf \
            --mmproj ggml-org/SmolVLM-500M-Instruct-GGUF/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf \
            --port $AI_PORT \
            --host 0.0.0.0 \
            --n-gpu-layers 0 \
            --chat-template chatml \
            --log-disable > ai-server.log 2>&1 &
    fi
    AI_PID=$!
    
    # Wait for server to be ready with timeout
    echo "⏳ Waiting for AI server to initialize..."
    MAX_RETRIES=60
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s "http://localhost:$AI_PORT/health" >/dev/null 2>&1; then
            echo "✅ AI server ready!"
            break
        fi
        
        # Check if process is still running
        if ! kill -0 $AI_PID 2>/dev/null; then
            echo "❌ AI server process died. Check ai-server.log for details."
            echo "   Last few lines of log:"
            tail -n 5 ai-server.log 2>/dev/null || echo "   (No log file found)"
            AI_SERVER=false
            break
        fi
        
        if [ $((RETRY_COUNT % 10)) -eq 0 ]; then
            echo "   Still waiting... ($RETRY_COUNT/${MAX_RETRIES})"
        fi
        
        sleep 1
        RETRY_COUNT=$((RETRY_COUNT + 1))
    done
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo "❌ AI server failed to start within timeout. Check ai-server.log for details."
        AI_SERVER=false
    fi
fi

# Start unified SSL proxy for HTTPS access and eBay API CORS handling
echo ""
echo "🔐 Starting unified SSL proxy..."
python3 ./unified-proxy.py 8443 --ssl > unified-proxy.log 2>&1 &
PROXY_PID=$!
sleep 2

# Check if proxy is running
PROXY_RUNNING=false
if ps -p $PROXY_PID > /dev/null 2>&1; then
    echo "✅ Unified SSL proxy running on port 8443 (PID: $PROXY_PID)"
    PROXY_RUNNING=true
else
    echo "❌ Failed to start unified SSL proxy. Check unified-proxy.log for details."
    echo "   Last few lines of log:"
    tail -n 5 unified-proxy.log 2>/dev/null || echo "   (No log file found)"
fi


echo ""
echo "🧹 Cleaning up..."
echo "   2. Allow camera permissions when prompted"
echo "   3. Start scanning items!"
echo "   4. Click 'Setup eBay API' for real pricing data"
echo ""
echo "📋 Troubleshooting:"
echo "   • Check ai-server.log if AI features aren't working"
echo "   • Check gun-relay.log if data isn't saving"
echo "   • Visit GitHub repository for more help"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo " http://localhost:8000 "
echo ""

# Wait for background processes
wait
