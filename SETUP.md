# Simply eBay - Setup Guide

## 🚀 Quick Start (5 minutes)

### Option 1: Direct File Opening (Easiest)
1. **Download the project**
2. **Open `index.html` directly in your browser**
3. **Allow camera permissions when prompted**
4. **Follow the setup wizard for eBay API**

⚠️ **Note**: Some features like camera access might be restricted when opening files directly. Use Option 2 for full functionality.

### Option 2: Local Server (Recommended)
1. **Navigate to project folder in terminal**
2. **Start a local server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have it)
   npx http-server -p 8000
   
   # PHP (if you have it)
   php -S localhost:8000
   ```
3. **Open in browser**: `http://localhost:8000`
4. **Follow the setup wizard**

### Option 3: GitHub Pages / Netlify (Online)
1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Access your live URL**
4. **Setup eBay API through the wizard**

## 🔧 Dependencies

### Automatically Loaded from CDN:
- **Gun.js**: Real-time database for local storage
- **AI Model**: SmolVLM (via llama.cpp server)

### Local Requirements:
- **llama.cpp**: For AI vision processing
- **Modern browser**: Chrome, Firefox, Safari, Edge
- **Camera access**: For item scanning

## 📋 Setup Checklist

### 1. Start AI Server
```bash
# Install llama.cpp first (see https://github.com/ggml-org/llama.cpp)
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF -ngl 99
```

### 2. Open the App
- Direct: Double-click `index.html`
- Server: Navigate to `http://localhost:8000`

### 3. Configure eBay API
- Click "Setup eBay API" button
- Follow the 6-step wizard
- Test your connection

### 4. Start Scanning!
- Allow camera permissions
- Point at items you want to sell
- Get instant pricing and descriptions

## 🌐 How It All Works

### Architecture:
```
📱 Browser App (PWA)
├── 🎥 Camera API (getUserMedia)
├── 🤖 llama.cpp server (localhost:8080)
├── 💰 eBay API (real-time pricing)
├── 💾 Gun.js (local data storage)
└── 🎨 Neumorphic UI (CSS/JS)
```

### Data Flow:
1. **Camera** captures item images
2. **AI Server** identifies sellable items
3. **eBay API** fetches real pricing
4. **Gun.js** stores data locally
5. **UI** displays results beautifully

## 🔐 Privacy & Security

- **Local-First**: All processing happens on your device
- **No Cloud Storage**: Your data never leaves your device
- **Secure APIs**: eBay credentials stored in browser localStorage
- **No Tracking**: No analytics or data collection

## 🛠️ Troubleshooting

### Camera Not Working?
- Ensure you're using HTTPS or localhost
- Check browser permissions
- Try different browser

### AI Not Responding?
- Check llama.cpp server is running on port 8080
- Verify model is loaded correctly
- Check console for errors

### eBay Prices Not Showing?
- Run through setup wizard again
- Check your API credentials
- Verify internet connection

### PWA Not Installing?
- Use a local server (Option 2)
- Ensure manifest.json is accessible
- Try different browser

## 📱 Mobile Installation

1. **Open in mobile browser**
2. **Look for "Add to Home Screen" prompt**
3. **Or use browser menu**: "Add to Home Screen"
4. **App will work offline after first load**

## 🚀 Advanced Setup

### Custom AI Models:
```bash
# Try different models for better accuracy
llama-server -hf ggml-org/SmolVLM-1.7B-Instruct-GGUF

# Or use other vision models
llama-server -hf microsoft/DialoGPT-medium
```

### Production eBay API:
- Set `sandbox: false` in setup wizard
- Use production eBay credentials
- Higher rate limits and real marketplace data

---

**Need help?** Check the console (F12) for error messages or create an issue on GitHub.
