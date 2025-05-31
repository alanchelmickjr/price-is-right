# Simply eBay - Setup Guide

## Quick Start

1. **Run the start script**
   - On Windows: Double-click `start.bat`
   - On macOS/Linux: Run `./start.sh`

The script will automatically:
- Start a local web server
- Start the AI server (if llama.cpp is installed)
- Open the app in your browser

## Manual Installation

### 1. Install Python
- Download from [python.org](https://python.org)
- Make sure Python is added to your PATH

### 2. Install llama.cpp (Required for AI Features)

#### macOS
```bash
# Using Homebrew
brew install llama.cpp
```

#### Windows
1. Download the latest release from [llama.cpp releases](https://github.com/ggerganov/llama.cpp/releases)
2. Extract to a folder
3. Add the folder to your PATH

#### Build from Source
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

### 3. Start the Servers Manually

1. **Start the Web Server**
```bash
# From the project directory
python -m http.server 8000
```

2. **Start the AI Server**
```bash
llama-server \
  --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF \
  --hf-file smolvlm-500m-instruct-q4_k_m.gguf \
  --port 8080 \
  --host 0.0.0.0 \
  --n-gpu-layers 99 \
  --chat-template chatml
```

3. Open http://localhost:8000 in your browser

## Optional: eBay API Setup

1. Create an eBay Developer Account at [developer.ebay.com](https://developer.ebay.com)
2. Create a new application
3. Copy your Client ID and Client Secret
4. Click "Setup eBay API" in the app to configure

## Troubleshooting

### AI Server Issues
- Ensure llama.cpp is installed and in your PATH
- Try running without GPU acceleration (remove --n-gpu-layers)
- Check server logs at http://localhost:8080/health

### Web Server Issues
- Make sure port 8000 is available
- Try a different port: `python -m http.server 8001`

### Camera Issues
- Ensure you're using HTTPS or localhost
- Grant camera permissions in your browser
- Try a different browser (Chrome recommended)
