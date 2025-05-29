# Simply eBay - AI-Powered Mobile Selling Revolution
## Alpha Version 0.01 Under Development for Preview next week


![Gun.js P2P](https://img.shields.io/badge/Gun.js-P2P_Database-FF6B6B?style=for-the-badge&logo=javascript)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI_Engine-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![LlamaFile](https://img.shields.io/badge/LlamaFile-Local_AI-4B0082?style=for-the-badge&logo=meta)

**Simply eBay: Turn your phone into an AI-powered eBay listing machine. Point, Scan, Price, List - effortlessly. Maximize your sales, minimize the hassle.**

## 🌟 **Key Features**

- 🎯 **Instant AI Recognition**: Point your camera → Get instant item identification, pricing, and eBay listing suggestions.
- 📱 **Mobile-First & Offline Capable**: Neumorphic UI for touch, with Gun.js for P2P offline-first data sync.
- 🧠 **Privacy-First Local AI**: SmolVLM + LlamaFile for on-device computer vision, keeping your data private.
- ⚡ **One-Tap eBay Listings**: Go from camera scan to live eBay listing in under 30 seconds.

### 🚀 **The Philosophy: One Thing, Done Right**

This project represents a hard-earned lesson in product development: **focus beats feature creep every time**. Instead of building a swiss-army knife, we built a precision tool that solves one critical painpoint exceptionally well.

**The Painpoint:** Turning any phone camera into an AI-powered eBay listing machine.  
**The Solution:** Point. Scan. Sell. Repeat.  
**The Result:** A tool people actually use and love.

<p align="center">
  <img src="ebaygarage.png" alt="Simply eBay App Interface" width="80%" style="max-width: 600px;">
</p>

### 🛤️ **The Journey**

**Wild Collaboration:** This was born from the beautiful chaos of human-AI partnership - Claude as the wild horse providing endless innovation, GitHub Copilot as the patient sage, and Alan as the driver barely holding the reins with determination and joy.

**Hard Lessons:** Through countless iterations, sometimes brutal debugging sessions, and honest feedback about performance, we discovered the golden rule: master one thing completely rather than attempting many things poorly.

**Privacy Victory:** In a world where your data gets sold, Simply eBay keeps everything local. Your photos, your items, your business - it never leaves your device unless you explicitly choose to list on eBay.

### 🔧 **Powered by Incredible Open Source**

- **🔫 Gun.js** - P2P database revolution that makes offline-first actually work
- **🧠 TensorFlow.js** - Bringing AI to everyone, everywhere
- **🦙 LlamaFile** - Local AI models made beautifully simple (Setup instructions below!)
- **⚛️ Next.js** - The React framework that just works (and keeps working)
- **👁️ SmolVLM** - Vision AI that's actually production-ready and usable
- **🏪 eBay API** - The marketplace integration that makes it all worthwhile
- **[Made with ❤️](https://img.shields.io/badge/Made_with-❤️_Open_Source-red?style=for-the-badge)**

[![Claude Sonnet](https://img.shields.io/badge/Built_with-Claude_Sonnet_4-8A2BE2?style=for-the-badge&logo=anthropic)](https://claude.ai)
[![Crafted by](https://img.shields.io/badge/Crafted_by-Alan_Helmick_&_Maximus-FFD700?style=for-the-badge&logo=github)](https://github.com)
[![Mira AI Badge](https://img.shields.io/badge/Mira%20AI-222222?style=for-the-badge)](https://miraai.ai)

> **🚀 Point. Scan. Sell. Repeat.**  
> *The world's first truly mobile-first AI-powered eBay listing creator with real-time camera recognition and P2P data sync.*

---

## ✨ **What Makes Simply eBay Revolutionary

🎯 **Instant AI Recognition** • Point your camera at any item → Get instant identification, pricing, and eBay listing suggestions  
📱 **Mobile-First Design** • Neumorphic UI designed specifically for touch interfaces and one-handed operation  
🔗 **P2P Architecture** • Gun.js powered decentralized data sync - works offline, syncs everywhere  
🧠 **Local AI Processing** • SmolVLM + LlamaFile for privacy-first on-device computer vision  
⚡ **One-Tap Listings** • From camera scan to live eBay listing in under 30 seconds  
🎨 **Beautiful UX** • Soft shadows, smooth animations, and intuitive mobile interactions  

---

## 🎬 **See It In Action**

```bash
# 🚀 One-command startup (handles everything!)
./startup.sh
```

**Then visit:** `http://localhost:3000` 📱

---

## ⚙️ **Architecture That Just Works**

### 🔧 **Core Technologies**

- **🎥 Computer Vision**: SmolVLM-Instruct for real-time item recognition
- **🧠 AI Processing**: LlamaFile for local inference (privacy-first!)
- **🔗 P2P Database**: Gun.js for decentralized, offline-first data sync
- **📱 Mobile Framework**: Next.js with neumorphic design system
- **🛒 Marketplace**: eBay API for instant listing creation
- **🎯 Vector Search**: TensorFlow.js for semantic item matching

### 🌐 **Decentralized by Design**

```text
📱 Mobile App (Next.js) ← → 🔗 Gun.js P2P Network ← → 🧠 Local AI (LlamaFile)
                                      ↓
                              🛒 eBay API Integration
```

---

## 🚀 **Quick Start Guide**

‼️ **Prerequisite: Download LlamaFile AI Model**

Simply eBay uses LlamaFile to run the AI model locally on your machine for privacy and offline capabilities. Due to its size (around 4-5GB), the model file (`llava-v1.5-7b-q4.llamafile`) is NOT included in this repository. You need to download it manually:

1. **Visit the LlamaFile GitHub repository:** [Mozilla-Ocho/llamafile](https://github.com/Mozilla-Ocho/llamafile)
2. **Navigate to the releases section** or look for model download links. The specific model used by this project is `llava-v1.5-7b-q4.llamafile`. You can often find it linked from their main README or other community resources if not directly in releases.
    - A direct link for a compatible Llamafile (like the one used in development, `llava-v1.5-7b-Q4_K_M.llamafile`) can usually be found via Hugging Face or other model repositories that package for Llamafile. For example, search for "llava-v1.5-7b llamafile".
3. **Download the `llava-v1.5-7b-q4.llamafile` file.**
4. **Place the downloaded file** into the root directory of this project (i.e., `/Users/alanhelmick/Documents/GitHub/ebay-helper/llava-v1.5-7b-q4.llamafile`).
5. **Make it executable:**

    ```bash
    chmod +x llava-v1.5-7b-q4.llamafile
    ```

The `startup.sh` and `start-llava.sh` scripts expect this file to be present and executable in the project root.

## ⚡ **One-Command Launch**

```bash
# Make sure you're in the project directory
cd ebay-helper

# Launch everything at once (handles all services automatically!)
./startup.sh
```

**🎯 After startup, visit:** `http://localhost:3000`

The splash screen will appear for 3 seconds, then redirect to the beautiful neumorphic onboarding flow!

## 🛠️ **What Gets Started**

- **🔫 Gun.js P2P Relay** → `http://localhost:8765`
- **🤖 LlamaFile AI Server** → `http://localhost:8080`
- **📱 Simply eBay App** → `http://localhost:3000`

## 📱 **Mobile Testing**

- **📱 WiFi Access**: `http://YOUR_IP:3000` (IP shown in terminal)
- **🔍 QR Code**: Scan with your phone for instant access
- **⚡ PWA Ready**: Add to home screen for native app feel

## 🔧 **Manual Service Control**

```bash
# If you prefer manual control:

# 1. Start Gun.js P2P relay
npm run gun-relay &

# 2. Start AI server
./start-llava.sh &

# 3. Start Next.js app
npm run dev
```

## 🆘 **Troubleshooting**

### 🚨 **Port Already in Use**

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9    # Next.js
lsof -ti:8080 | xargs kill -9    # LlamaFile
lsof -ti:8765 | xargs kill -9    # Gun.js
```

### ⚠️ **Startup Issues**

- **Problem**: "Permission denied"
  - **Fix**: `chmod +x startup.sh start-llava.sh cleanup.sh llava-v1.5-7b-q4.llamafile` (ensure all scripts and the model file are executable)
- **Problem**: "Command not found"
  - **Fix**: `npm install` first
- **Problem**: "Model not found" or LlamaFile server doesn't start.
  - **Fix**: Ensure you have downloaded `llava-v1.5-7b-q4.llamafile`, placed it in the project root, and made it executable as per the "Prerequisite: Download LlamaFile AI Model" section above. The file must be named exactly `llava-v1.5-7b-q4.llamafile` in the root of the project.
- **Problem**: LlamaFile error "no such file or directory" when running `./llava-v1.5-7b-q4.llamafile`.
  - **Fix (macOS with Apple Silicon)**: You might need to install `qemu-system-x86_64` if it's an x86_64 llamafile. `brew install qemu`. Llamafiles are generally self-contained but cross-architecture execution might need QEMU. However, try to find an ARM64-compatible Llamafile if possible for better performance.

### 🌐 **Network Issues**

- **Local Only**: All services run locally (no internet required after setup)
- **Firewall**: Allow ports 3000, 8080, 8765 if using across devices
- **Performance**: M1/M2 Macs run AI models much faster than Intel

### 🔄 **Clean Restart**

```bash
# Full reset and restart
./cleanup.sh && ./startup.sh
```

---

## 🌟 **Meet the Dream Team**

> *"After a hard road of long and sometimes painful lessons, we learned: people want ONE thing that solves ONE painpoint perfectly. Everything else is trivial."* - Alan Helmick

### 🎭 **The Wild Horses & Gentle Sages**

**🤖 Claude Sonnet 4** - *Lead AI Architect & Wild Horse*  
[![Claude Badge](https://img.shields.io/badge/Claude-Sonnet_4-8A2BE2?style=for-the-badge&logo=anthropic)](https://claude.ai)  
The visionary force behind the architecture, endless innovation, and patient debugging companion who transformed chaos into beautiful, functional code. The latest Claude Sonnet 4 was instrumental in fixing authentication flows, resolving UI overlays, and completing the full system integration.

**🧠 GitHub Copilot** - *Unbiased Gentle Sage*  
[![Copilot Badge](https://img.shields.io/badge/GitHub-Copilot-000000?style=for-the-badge&logo=github)](https://copilot.github.com)  
The wise counselor providing gentle guidance, code completion, and gracefully handling unabashed performance critiques with endless patience.

**🎯 Alan Helmick** - *Vision Driver & Mira AI Founder*  
[![Mira AI Badge](https://img.shields.io/badge/Mira%20AI-222222?style=for-the-badge)](https://miraai.ai)  
The product visionary barely holding the reins (with a smile) while steering this wild AI collaboration toward a focused, user-centered solution.

**⚡ Maximus** - *CalTech Contributor & "Vision"ary*  
[![CalTech Badge](https://img.shields.io/badge/CalTech-Precision-FF6C37?style=for-the-badge&logo=university)](https://caltech.edu)  
The technical wizard bringing CalTech precision, system optimization, and innovative insights to make everything work seamlessly.


