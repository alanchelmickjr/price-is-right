#!/bin/bash

# Simply eBay - Distribution Package Creator
# Creates a ready-to-distribute package

echo "📦 Creating Simply eBay Distribution Package..."
echo "=============================================="

# Create distribution directory
DIST_DIR="SimplyeBay-Distribution"
rm -rf "$DIST_DIR" 2>/dev/null || true
mkdir -p "$DIST_DIR"

# Copy essential files
echo "📁 Copying essential files..."
cp index.html "$DIST_DIR/"
cp manifest.json "$DIST_DIR/"
cp sw.js "$DIST_DIR/"
cp gun-relay.js "$DIST_DIR/"
cp icon-192.png "$DIST_DIR/"
cp icon-512.png "$DIST_DIR/"
cp install.sh "$DIST_DIR/"
cp INSTALL_README.md "$DIST_DIR/README.md"

# Copy optional files if they exist
[ -f LICENSE ] && cp LICENSE "$DIST_DIR/"
[ -f .env.example ] && cp .env.example "$DIST_DIR/"

# Create a simple double-click installer for non-technical users
cat > "$DIST_DIR/DOUBLE-CLICK-TO-INSTALL.command" << 'EOF'
#!/bin/bash

echo "🚀 Simply eBay - Double-Click Installer"
echo "======================================"
echo ""
echo "This will automatically install and launch Simply eBay!"
echo ""

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Make install script executable and run it
chmod +x install.sh
./install.sh --launch
EOF

chmod +x "$DIST_DIR/DOUBLE-CLICK-TO-INSTALL.command"

# Create a quick start guide
cat > "$DIST_DIR/QUICK-START.txt" << 'EOF'
🚀 Simply eBay - Quick Start Guide

FOR COMPLETE BEGINNERS:
1. Double-click "DOUBLE-CLICK-TO-INSTALL.command"
2. Follow the prompts
3. That's it!

FOR TECHNICAL USERS:
1. Open Terminal
2. Navigate to this folder
3. Run: ./install.sh
4. Follow the prompts

MOBILE INSTALLATION:
- After running the installer, open the provided URL on your phone
- Look for "Add to Home Screen" in your browser menu
- Tap it to install as a native app

Need help? Read README.md for detailed instructions.
EOF

# Create archive
echo "🗜️  Creating distribution archive..."
tar -czf "SimplyeBay-OneClick-Installer.tar.gz" "$DIST_DIR"

# Create DMG for macOS (if on macOS)
if command -v hdiutil >/dev/null 2>&1; then
    echo "💿 Creating macOS DMG..."
    hdiutil create -volname "Simply eBay" -srcfolder "$DIST_DIR" -ov -format UDZO "SimplyeBay-OneClick-Installer.dmg" >/dev/null 2>&1
fi

echo ""
echo "✅ Distribution package created!"
echo "==============================="
echo ""
echo "📦 Files created:"
echo "   • SimplyeBay-OneClick-Installer.tar.gz (cross-platform)"
if [ -f "SimplyeBay-OneClick-Installer.dmg" ]; then
echo "   • SimplyeBay-OneClick-Installer.dmg (macOS)"
fi
echo "   • $DIST_DIR/ (folder for testing)"
echo ""
echo "🚀 How users install:"
echo "   1. Download and extract the archive"
echo "   2. Double-click 'DOUBLE-CLICK-TO-INSTALL.command'"
echo "   3. Everything installs automatically!"
echo ""
echo "📱 The app will be installable on phones and tablets too!"
echo ""

# Test the package
echo "🧪 Testing the distribution package..."
cd "$DIST_DIR"
if [ -f "install.sh" ] && [ -f "index.html" ] && [ -f "manifest.json" ]; then
    echo "✅ Package integrity check passed!"
else
    echo "❌ Package integrity check failed!"
    exit 1
fi

echo ""
echo "🎉 Ready for distribution! Share either the .tar.gz or .dmg file."
