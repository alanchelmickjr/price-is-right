#!/bin/bash
# Simply eBay - Quick Start Script

echo "🚀 Simply eBay - Quick Start"
echo "==============================="

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
    echo "   Or open index.html directly in your browser (some features may be limited)"
    exit 1
fi

echo "✅ Python found: $PYTHON_CMD"

# Check if port 8000 is available
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. Trying port 8001..."
    PORT=8001
else
    PORT=8000
fi

echo "🌐 Starting web server on port $PORT..."
echo ""
echo "📱 Open your browser and go to:"
echo "   👉 http://localhost:$PORT"
echo ""
echo "🎯 Next steps:"
echo "   1. Allow camera permissions"
echo "   2. Click 'Setup eBay API' for real pricing"
echo "   3. Start scanning items!"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
$PYTHON_CMD -m http.server $PORT
