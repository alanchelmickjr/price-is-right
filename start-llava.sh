#!/bin/bash

# LLaVA Model Startup Script for Simply eBay
# This script starts the LLaVA llamafile server for AI item recognition

LLAMAFILE_PATH="./llava-v1.5-7b-q4.llamafile"
PORT=8080
HOST="127.0.0.1"

echo "🚀 Starting LLaVA Model Server for Simply eBay..."
echo "📍 Server will be available at: http://${HOST}:${PORT}"
echo "🎯 Optimized for eBay item recognition and pricing"

# Check if llamafile exists
if [ ! -f "$LLAMAFILE_PATH" ]; then
    echo "❌ Error: $LLAMAFILE_PATH not found!"
    echo "📥 Please download it first with:"
    echo "curl -L -o llava-v1.5-7b-q4.llamafile https://huggingface.co/Mozilla/llava-v1.5-7b-llamafile/resolve/main/llava-v1.5-7b-q4.llamafile"
    exit 1
fi

# Make executable if not already
chmod +x "$LLAMAFILE_PATH"

echo "🔥 Starting server... (This may take a moment to load the model)"
echo "💡 Tip: The first request may be slower as the model initializes"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the llamafile server with optimal settings for eBay item recognition
exec "$LLAMAFILE_PATH" \
    --server \
    --host "$HOST" \
    --port "$PORT" \
    --ctx-size 2048 \
    --threads $(sysctl -n hw.ncpu 2>/dev/null || nproc || echo 4) \
    --temp 0.1 \
    --repeat-penalty 1.1 \
    --gpu-layers 0 \
    --log-disable
