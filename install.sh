#!/bin/bash

# Simply eBay - One-Click Installer
# This script automatically sets up everything needed to run Simply eBay

set -e  # Exit on any error

# Check for test mode
TEST_MODE=false
if [[ "$1" == "--test" ]]; then
    TEST_MODE=true
    echo "🧪 Running in test mode (no auto-launch)"
fi

echo "🚀 Simply eBay - One-Click Installer"
echo "===================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Homebrew if needed
install_homebrew() {
    if ! command_exists brew; then
        echo "📦 Installing Homebrew (required for dependencies)..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
    else
        echo "✅ Homebrew is already installed"
    fi
}

# Function to install Node.js if needed
install_nodejs() {
    if ! command_exists node; then
        echo "📦 Installing Node.js..."
        brew install node
    else
        echo "✅ Node.js is already installed"
    fi
}

# Function to install Python if needed
install_python() {
    if ! command_exists python3; then
        echo "📦 Installing Python..."
        brew install python
    else
        echo "✅ Python is already installed"
    fi
}

# Function to install llama.cpp if needed
install_llama() {
    if ! command_exists llama-server; then
        echo "📦 Installing llama.cpp for AI processing..."
        brew install llama.cpp
    else
        echo "✅ llama.cpp is already installed"
    fi
}

# Function to generate SSL certificate
generate_ssl() {
    if [ ! -f server.crt ] || [ ! -f server.key ]; then
        echo "🔐 Generating SSL certificate for HTTPS..."
        openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" >/dev/null 2>&1
        echo "✅ SSL certificate generated"
    else
        echo "✅ SSL certificate already exists"
    fi
}

# Function to create the launch script
create_launcher() {
    cat > launch-simply-ebay.sh << 'EOF'
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

# Start AI server
echo "🤖 Starting AI server (this may take a moment to load the model)..."
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF -ngl 99 --port 8080 --host 0.0.0.0 --ssl-cert-file server.crt --ssl-key-file server.key > ai-server.log 2>&1 &
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
EOF

    chmod +x launch-simply-ebay.sh
    echo "✅ Launcher script created"
}

# Function to create desktop shortcut (macOS)
create_desktop_shortcut() {
    DESKTOP_PATH="$HOME/Desktop"
    APP_PATH="$(pwd)"
    
    cat > "$DESKTOP_PATH/Simply eBay.command" << EOF
#!/bin/bash
cd "$APP_PATH"
./launch-simply-ebay.sh
EOF
    
    chmod +x "$DESKTOP_PATH/Simply eBay.command"
    echo "✅ Desktop shortcut created"
}

# Main installation process
main() {
    echo "Starting automated installation..."
    echo ""
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo "❌ This installer is designed for macOS. Please install dependencies manually."
        exit 1
    fi
    
    # Install dependencies
    install_homebrew
    install_nodejs
    install_python
    install_llama
    
    echo ""
    echo "🔧 Setting up Simply eBay..."
    
    # Generate SSL certificate
    generate_ssl
    
    # Create launcher script
    create_launcher
    
    # Create desktop shortcut
    create_desktop_shortcut
    
    echo ""
    echo "🎉 Installation Complete!"
    echo "========================"
    echo ""
    echo "📋 What was installed:"
    echo "   ✅ Homebrew (package manager)"
    echo "   ✅ Node.js (for Gun.js database)"
    echo "   ✅ Python (for web server)"
    echo "   ✅ llama.cpp (for AI processing)"
    echo "   ✅ SSL certificate (for camera access)"
    echo "   ✅ Launch script"
    echo "   ✅ Desktop shortcut"
    echo ""
    echo "🚀 How to run Simply eBay:"
    echo "   Option 1: Double-click 'Simply eBay.command' on your Desktop"
    echo "   Option 2: Run './launch-simply-ebay.sh' in this folder"
    echo "   Option 3: Run './install.sh --launch' to start immediately"
    echo ""
    echo "📱 The app will be accessible on:"
    echo "   • This computer: https://localhost:8000"
    echo "   • Mobile devices: https://[your-ip]:8000"
    echo ""
    echo "💡 Tip: The launcher will show your exact mobile URL when it starts!"
    
    # Handle different launch modes
    if [[ "$TEST_MODE" == "true" ]]; then
        echo ""
        echo "🧪 Test mode complete - installer verification successful!"
        echo "✅ All dependencies checked and launcher created"
        return 0
    elif [[ "$1" == "--launch" ]]; then
        echo ""
        echo "🚀 Launching Simply eBay now..."
        ./launch-simply-ebay.sh
    else
        echo ""
        read -p "🚀 Would you like to launch Simply eBay now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./launch-simply-ebay.sh
        fi
    fi
}

# Run main function
main "$@"
