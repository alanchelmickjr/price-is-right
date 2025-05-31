# Simply eBay - Local-First AI eBay Assistant
⚡ **Local AI. Instant Results. Zero Cloud Dependencies.**

![demo](./demo.png)

**Transform garage sale prep into a 2-minute magic trick.** Point your camera, get instant AI pricing, and list to eBay – all while keeping your data private and processing everything locally.

**Alpha Version 0.3 - Working Alpha!** 🎉 **New: Complete PWA Rewrite**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) ![Gun.js](https://img.shields.io/badge/Gun.js-262626?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMjJIMkwxMiAyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K) ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white) ![llama.cpp](https://img.shields.io/badge/llama.cpp-000000?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgMjJIMkwxMiAyWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K)

## � What We're Building

Simply eBay transforms your garage sale prep from a weekend-long nightmare into a 2-minute magic trick. Snap a photo, get instant AI pricing, list to eBay - all while keeping your data private and processing everything locally.

## ✨ Current Features - Working Alpha!

### 📸 Real-Time Camera Processing ✅ **FULLY WORKING**
- Take photos directly in the app
- AI identifies items automatically in real-time
- Generate instant pricing suggestions  
- Extract item details and descriptions
- Mobile-optimized camera interface

### 💰 eBay Price Intelligence ✅ **FULLY WORKING**
- Real-time pricing from eBay's completed listings
- Price range analysis and market trends
- Sample sales data with links
- Intelligent price estimation algorithms

### 🧙‍♂️ Interactive Setup Wizard ✅ **FULLY WORKING**
- 6-step guided eBay API configuration
- Credential validation and testing
- No manual config files needed
- Built-in troubleshooting

### 📱 Mobile-First PWA ✅ **FULLY WORKING**
- Install on your phone like a native app
- Beautiful neumorphic UI design
- Touch-optimized interface
- Works offline after first load
- Thumb-friendly controls

### 🛡️ Privacy-First Architecture ✅ **FULLY WORKING**
- All processing happens locally on your device
- Gun.js P2P local data storage
- Zero cloud dependencies
- Your data never leaves your device

### 🎨 Modern Interface ✅ **FULLY WORKING**
- Neumorphic design system
- Mobile-first responsive layout
- Loading screens with progress indicators
- Notification system with status updates

## 🎬 See It In Action

**Camera Feature**: Take a photo and watch the AI identify your items in real-time!

- ✅ Camera access working
- ✅ Photo capture functional  
- ✅ AI processing pipeline active
- ✅ eBay price estimation working
- ✅ Setup wizard complete

## ⚙️ Technical Architecture

### 📱 **Single-File PWA**
```
index.html (Complete App)
├── 🎨 Neumorphic UI Components
├── 📸 Camera API Integration  
├── 🔐 Gun.js P2P Storage
├── 🧠 AI Processing Pipeline
└── 🛒 eBay API Integration
```

### 🖥️ **Local Services**
```
🦙 llama.cpp Server (Port 8080) ✅
├── SmolVLM-500M-Instruct model
├── Real-time vision processing
└── Local inference (no cloud)

🔫 Gun.js P2P Storage ✅
├── Local data persistence
├── Session history
└── Privacy-first architecture
```

### 📡 **External APIs**
```
🛒 eBay Browse API ✅
├── Real-time price data
├── Completed listings analysis
└── Market trend information
```

## 🚀 Quick Start

### Prerequisites
1. **Install [llama.cpp](https://github.com/ggml-org/llama.cpp)**
2. **Modern browser** with camera support

### ⚡ One-Command Setup
```bash
# Option 1: Use our startup scripts
./start.sh              # Linux/Mac  
./start.bat              # Windows

# Option 2: Manual setup
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF
python -m http.server 8000   # Then open http://localhost:8000
```

### 🌐 **GitHub Pages Deployment**
The app works perfectly on GitHub Pages! Just:
1. Push to your repo
2. Enable GitHub Pages
3. Access at: `https://yourusername.github.io/your-repo`

### 📱 **Mobile Testing**
Test on your phone by visiting:
- `http://your-computer-ip:8000` (local)
- `https://yourusername.github.io/your-repo` (GitHub Pages)

The interface is optimized for mobile with:
- Touch-friendly buttons
- Responsive camera interface  
- Swipe navigation
- Offline capability after first load

## � Current Status

### ✅ **Phase 1 Complete - Core PWA**
- ✅ Real-time eBay item identification
- ✅ PWA structure with mobile-first design  
- ✅ Neumorphic UI with thumb-friendly controls
- ✅ Image compression and mobile optimization

### ✅ **Phase 2 Complete - eBay Integration**  
- ✅ eBay API integration for price estimation
- ✅ Local data storage with gun.js
- ✅ Recent scanning sessions history
- ✅ Interactive setup wizard with validation

### � **Phase 3 In Progress - Listing Creation**
- 🔄 eBay listing creation and posting
- 🔄 OAuth integration for eBay authentication  
- 🔄 Bulk listing management

## � Configuration & Advanced Usage

### **AI Models**
You can try different vision models with llama.cpp:
- `SmolVLM-500M-Instruct` (default, fastest)
- `SmolVLM-1.7B-Instruct` (better accuracy)
- [Other supported models](https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md)

### **Scan Settings**
- **Scan Interval**: Adjust how often items are analyzed (0.5s - 3s)
- **API Server**: Change if running llama.cpp on different port/host
- **eBay API**: Configure through the interactive setup wizard

### **Performance Tips**
- **GPU Acceleration**: Add `-ngl 99` to llama-server for GPU boost
- **Best Lighting**: Use good lighting for better AI recognition
- **Clear Views**: Position items clearly in frame
- **Multiple Angles**: Scan from different angles for better identification

## 🆘 Troubleshooting

### **Common Issues**

**"AI Server Connection Failed"**
```bash
# Check if llama.cpp is running
ps aux | grep llama-server
# Restart AI server  
llama-server -hf ggml-org/SmolVLM-500M-Instruct-GGUF
# Verify port 8080 is available
lsof -i :8080
```

**"Camera Access Denied"**
- Enable camera permissions in browser
- Use HTTPS or localhost only
- Check browser developer console

**"eBay API Setup Issues"**
- Use the interactive setup wizard
- Verify credentials on eBay Developer Center
- Check API rate limits

**"Gun.js Storage Issues"**
- Clear browser storage and refresh
- Check browser console for errors
- Gun.js loads automatically from CDN

## 🙏 Development Team

**Paul Elite** - UI/UX Wizardry (Figma to Code Designer and Implementer of User Forward Modern Interfaces)  
*The easy to use pretty face that keeps you coming back - endless creativity and user experiential focus*

**Claude Sonnet 3.5** (Anthropic) - Chief AI Architect  
*The wild horse of innovation - endless creativity and architectural vision*

**GitHub Copilot** - Senior Code Whisperer  
*The gentle sage - patient pair programming and code refinement*

**Alan Helmick** - Product Lead & Human Driver  
*Barely holding the reins but steering toward the dream with determination and joy*

---

## 🌟 Simply eBay: Where wild horses meet gentle guidance, and barely-held reins lead to extraordinary results! 🌟

*Made with ❤️, ☕, and 50+ years of dreaming that AI collaboration would finally arrive*

---

## 🤝 Contributing

This project follows the **"elegance & simplicity"** principle. Contributions should:
- Maintain the local-first architecture
- Keep the mobile-first design  
- Preserve the neumorphic aesthetic
- Add value without overengineering

## 📄 Documentation

- [Complete Setup Guide](./SETUP.md)
- [eBay API Configuration](./EBAY_SETUP.md)
- [Implementation Plan](./spec/IMPLEMENTATION_PLAN01.md)

## 🔗 Links

- [GitHub Repository](https://github.com/alanchelmickjr/price-is-right)
- [Live Demo (GitHub Pages)](https://alanchelmickjr.github.io/price-is-right)
- [Issue Tracker](https://github.com/alanchelmickjr/price-is-right/issues)

## 📄 License

See [LICENSE](./LICENSE) file for details.

