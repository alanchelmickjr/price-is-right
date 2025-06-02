#!/bin/bash

# Test the Simply eBay installer
echo "🧪 Testing Simply eBay installer..."
echo "=================================="

# Create a temporary test directory
TEST_DIR="/tmp/simply-ebay-test"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Copy the installer
cp "/Users/alanhelmick/Documents/GitHub/ebay-helper/install.sh" .

# Run the installer
echo "🚀 Running installer..."
chmod +x install.sh
./install.sh --test

echo ""
echo "✅ Installer test completed!"
echo "Check the output above for any errors."
