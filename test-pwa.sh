#!/bin/bash

# PWA Installation Test Script for Simply eBay
echo "🔧 Testing PWA Installation Features"
echo "====================================="

# Check if server is running
echo "📡 Checking server status..."
if curl -s http://localhost:8001 > /dev/null; then
    echo "✅ Web server is running on port 8001"
else
    echo "❌ Web server is not accessible"
    exit 1
fi

# Check manifest.json
echo "📋 Checking manifest.json..."
if curl -s http://localhost:8001/manifest.json | jq . > /dev/null 2>&1; then
    echo "✅ manifest.json is valid JSON"
else
    echo "❌ manifest.json is invalid or missing"
fi

# Check service worker
echo "🔧 Checking service worker..."
if curl -s http://localhost:8001/sw.js | grep -q "CACHE_NAME"; then
    echo "✅ Service worker is accessible"
else
    echo "❌ Service worker is missing or invalid"
fi

# Check icon files
echo "🎨 Checking icon files..."
for icon in "icon-192.png" "icon-512.png"; do
    if curl -s -I http://localhost:8001/$icon | grep -q "200 OK"; then
        echo "✅ $icon is accessible"
    else
        echo "❌ $icon is missing"
    fi
done

# Check browserconfig.xml
echo "🖥️ Checking Windows integration..."
if curl -s http://localhost:8001/browserconfig.xml | grep -q "browserconfig"; then
    echo "✅ browserconfig.xml is accessible"
else
    echo "❌ browserconfig.xml is missing"
fi

echo ""
echo "🎯 PWA Installation Test Summary"
echo "==============================="
echo "📱 The app should now be installable on devices!"
echo ""
echo "🧪 To test installation:"
echo "1. Open http://localhost:8001 on your phone/tablet"
echo "2. Look for 'Add to Home Screen' option"
echo "3. Install and test offline functionality"
echo ""
echo "🌐 For remote testing, consider using:"
echo "• ngrok (https://ngrok.com) for secure tunneling"
echo "• Local network IP if devices are on same WiFi"
echo ""

# Get local IP for network testing
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ip route get 1 | sed -n 's/.*src \([0-9.]*\).*/\1/p' 2>/dev/null)
if [ ! -z "$LOCAL_IP" ]; then
    echo "🏠 Local network access: http://$LOCAL_IP:8001"
    echo "   (Use this URL on other devices on your WiFi)"
fi

echo ""
echo "✨ PWA testing complete!"
