#!/bin/bash

# Simply eBay Launcher
echo "🚀 Starting Simply eBay..."
echo "========================="

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Check if all required files exist
if [ ! -f "index.html" ] || [ ! -f "manifest.json" ] || [ ! -f "gun-relay.js" ]; then
    echo "❌ Error: Missing required files. Please ensure you're in the Simply eBay directory."
    exit 1
fi

# Kill any existing processes on our ports
echo "🧹 Cleaning up any existing processes..."
pkill -f "python.*8000" >/dev/null 2>&1 || true
pkill -f "node.*gun-relay" >/dev/null 2>&1 || true
pkill -f "llama-server.*8080" >/dev/null 2>&1 || true

# Wait a moment for processes to fully stop
sleep 2

# Start Gun.js relay server
echo "📡 Starting Gun.js relay server..."
node gun-relay.js > gun-relay.log 2>&1 &
GUNJS_PID=$!

# Start AI server with SSL
echo "🤖 Starting AI server with SSL (this may take a moment to load the model)..."
llama-server \
    --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF \
    --hf-file SmolVLM-500M-Instruct-Q8_0.gguf \
    --mmproj mmproj-SmolVLM-500M-Instruct-Q8_0.gguf \
    --host 0.0.0.0 \
    --port 8443 \
    --ctx-size 4096 \
    --threads 4 \
    --n-gpu-layers 33 \
    --ssl-key-file server.key \
    --ssl-cert-file server.crt > ai-server.log 2>&1 &
AI_PID=$!

# Start HTTPS web server
echo "🌐 Starting HTTPS web server..."
python3 -c "
import http.server
import ssl
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress log messages

PORT = 8000
Handler = MyHTTPRequestHandler

# Check if SSL files exist
if os.path.exists('server.crt') and os.path.exists('server.key'):
    # HTTPS
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('server.crt', 'server.key')
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        print(f'HTTPS Server running on https://localhost:{PORT}')
        httpd.serve_forever()
else:
    # HTTP fallback
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print(f'HTTP Server running on http://localhost:{PORT}')
        httpd.serve_forever()
" &
WEB_PID=$!

# Wait for servers to start
echo "⏳ Waiting for servers to initialize..."
sleep 5

# Get local IP for mobile access
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo ""
echo "🎉 Simply eBay is now running!"
echo "=============================="
echo ""
echo "📱 Access on this computer:"
if [ -f "server.crt" ]; then
    echo "   → https://localhost:8000"
else
    echo "   → http://localhost:8000"
fi
echo ""
echo "📱 Access on mobile devices (same WiFi network):"
if [ -f "server.crt" ]; then
    echo "   → https://$LOCAL_IP:8000"
else
    echo "   → http://$LOCAL_IP:8000"
fi
echo ""
echo "ℹ️  On mobile devices:"
echo "   1. Open the URL above in your mobile browser"
echo "   2. For HTTPS: Accept the security warning (it's safe - it's your local server)"
echo "   3. Look for 'Add to Home Screen' or 'Install App' option"
echo "   4. Tap it to install Simply eBay as a native app!"
echo ""
echo "📋 Servers running:"
echo "   • Web Server: Port 8000"
echo "   • Gun.js Relay: Port 8765"
echo "   • AI Server: Port 8080"
echo ""
echo "🛑 To stop all servers, press Ctrl+C"
echo ""

# Save PIDs for cleanup
echo $GUNJS_PID > .gunjs.pid
echo $AI_PID > .ai.pid
echo $WEB_PID > .web.pid

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Simply eBay..."
    
    # Kill background processes
    if [ -f .gunjs.pid ]; then
        kill $(cat .gunjs.pid) 2>/dev/null || true
        rm .gunjs.pid
    fi
    
    if [ -f .ai.pid ]; then
        kill $(cat .ai.pid) 2>/dev/null || true
        rm .ai.pid
    fi
    
    if [ -f .web.pid ]; then
        kill $(cat .web.pid) 2>/dev/null || true
        rm .web.pid
    fi
    
    # Additional cleanup
    pkill -f "python.*8000" >/dev/null 2>&1 || true
    pkill -f "node.*gun-relay" >/dev/null 2>&1 || true
    pkill -f "llama-server.*8080" >/dev/null 2>&1 || true
    
    echo "✅ All servers stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
while true; do
    sleep 1
done
