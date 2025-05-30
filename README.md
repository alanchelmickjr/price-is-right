# Simply eBay - Local-First AI eBay Assistant

> **⚡ Local AI. Instant Results. Zero Cloud Dependencies.**  
> *Complete eBay listing workflow running entirely on your device.*

## Alpha Version 0.12 - Working Alpha! 🎉 New Contributor Paul Elite UI/UX

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Gun.js](https://img.shields.io/badge/Gun.js-P2P_Database-FF6B6B?style=for-the-badge&logo=javascript)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI_Engine-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![LlamaFile](https://img.shields.io/badge/LlamaFile-Local_AI-4B0082?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)

---

## 🌟 **What We're Building**

Simply eBay transforms your garage sale prep from a weekend-long nightmare into a 2-minute magic trick. **Snap a photo, get instant AI pricing, list to eBay** - all while keeping your data private and processing everything locally.

---

## ✨ **Current Features - Working Alpha!**

### 📸 **Photo Capture & AI Recognition** ✅ WORKING
- Take photos directly in the app
- AI identifies items automatically
- Generate pricing suggestions
- Extract item details and descriptions

### 🔐 **User Authentication** ✅ WORKING
- Gun.js P2P authentication system
- Local user registration and login
- Secure password handling

### 📱 **Mobile-First Design** ✅ WORKING
- Responsive neumorphic UI
- Touch-optimized interface
- Works great on phones and tablets

### 🧠 **Local AI Processing** 🟡 PARTIAL
- LlamaFile integration (connection issues)
- Local vector storage (in progress)
- Privacy-first architecture

### 🛒 **eBay Integration** 🔴 IN PROGRESS
- API connection framework ready
- Authentication flow prepared
- Listing workflow designed

---

## 🎬 **See It In Action**

**Camera Feature**: Take a photo and watch the AI identify your items in real-time!
- ✅ Camera access working
- ✅ Photo capture functional
- ✅ AI processing pipeline active
- 🟡 Pricing accuracy improving

---

## ⚙️ **Technical Architecture**

```
📱 Next.js Frontend
├── 🎨 Neumorphic UI Components
├── 📸 Camera API Integration
├── 🔐 Gun.js Authentication
└── 🧠 AI Processing Pipeline

🖥️  Local Services
├── 🔫 Gun.js P2P Relay (Port 8765) ✅
├── 🦙 LlamaFile AI Server (Port 8080) 🟡
├── 📊 Vector Storage Service 🔴
└── 🛒 eBay API Connector 🔴

📡 External APIs
├── 🛒 eBay Developer API
└── 📧 EmailJS Notifications
```

---

## 🚀 **Current Status**

### ✅ **Working Components**
- Next.js app running on localhost:3000
- Gun.js P2P relay operational
- Camera capture and photo processing
- User authentication and registration
- Mobile-responsive interface

### 🟡 **Partial Components**
- AI server connection (LlamaFile integration)
- Item recognition and pricing
- Local vector storage

### 🔴 **In Development**
- eBay API integration
- Complete AI processing pipeline
- Vector storage optimization

---

## 📋 **Getting Started**

### Prerequisites
- Node.js 18+ and pnpm
- 8GB+ RAM for AI models
- Modern browser with camera support

### Quick Start

```bash
git clone https://github.com/yourusername/ebay-helper.git
cd ebay-helper
pnpm install
```

---

## ⚡ **One-Command Launch**

```bash
./startup.sh
```

This comprehensive script:
- ✅ **Cleans ports** - Kills any conflicting processes
- ✅ **Starts services** - Gun.js relay, LlamaFile AI, Next.js
- ✅ **Monitors health** - Checks if services are responding
- ✅ **Opens browser** - Launches your app automatically
- ✅ **Shows mobile URLs** - For testing on phones
- ✅ **Handles cleanup** - Proper shutdown on Ctrl+C

---

## 🛠️ **What Gets Started**

| Service | Port | Status | Purpose |
|---------|------|--------|---------|
| Next.js App | 3000 | ✅ Running | Main application |
| Gun.js Relay | 8765 | ✅ Running | P2P data sync |
| LlamaFile AI | 8080 | 🟡 Partial | Local AI processing |
| Vector Store | 5432 | 🔴 Dev | Local embeddings |

---

## 📱 **Mobile Testing**

Test on your phone by visiting:
```
http://your-computer-ip:3000
```

The interface is optimized for mobile with:
- Touch-friendly buttons
- Responsive camera interface
- Swipe navigation
- Offline capability

---

## 🔧 **Manual Service Control**

```bash
# Start individual services
./start-gun-relay.sh     # P2P database
./start-llava.sh         # AI vision model
pnpm dev                 # Next.js app

# System validation
node test-auth-flow.js   # Test authentication
node test-camera-flow.js # Test camera features

# Emergency reset
./emergency-reset.js     # Clean slate restart
```

---

## 🆘 **Troubleshooting**

### Common Issues

**"AI Server Connection Failed"**
- Check if LlamaFile is running: `ps aux | grep llava`
- Restart AI server: `./start-llava.sh`
- Verify port 8080 is available

**"Camera Access Denied"**
- Enable camera permissions in browser
- Use HTTPS or localhost only
- Check browser developer console

**"Gun.js P2P Connection Issues"**
- Restart relay: `./start-gun-relay.sh`
- Check port 8765 availability
- Clear browser storage

### System Validation
```bash
./final-check.sh  # Comprehensive system check
```

---

## 🙏 **Development Team**

**Paul Elite** - UI/UX Wizardy (Figma to Code Designer and Implementer of User Forward modern Interfaces)  
*The easy to use pretty face that keeps you coming back - endless creativity and user experential focus*

**Claude Sonnet 4 (Anthropic)** - Chief AI Architect  
*The wild horse of innovation - endless creativity and architectural vision*

**GitHub Copilot** - Senior Code Whisperer  
*The gentle sage - patient pair programming and code refinement*

**Alan Helmick** - Product Lead & Human Driver  
*Barely holding the reins but steering toward the dream with determination and joy*

---

**🌟 Simply eBay: Where wild horses meet gentle guidance, and barely-held reins lead to extraordinary results! 🌟**

*Made with ❤️, ☕, and 50 years of dreaming that AI collaboration would finally arrive*

---

### 📄 **Documentation**
- [Technical Specifications](spec/phase_1_user_stories.md)
- [Complete Project Overview](docs/SIMPLY_EBAY_COMPLETE.md)
- [Testing Documentation](__tests__/)

### 🔗 **Links**
- [GitHub Repository](https://github.com/yourusername/ebay-helper)
- [Issue Tracker](https://github.com/yourusername/ebay-helper/issues)
- [Contributing Guide](CONTRIBUTING.md)


