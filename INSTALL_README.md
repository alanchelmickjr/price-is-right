# Simply eBay - One-Click Installation 📱

**The easiest way to get Simply eBay running on your Mac, iPhone, iPad, or Android device!**

## 🚀 Quick Start (Dummy-Proof!)

1. **Download this folder** to your Mac
2. **Open Terminal** and navigate to the folder
3. **Run the installer:**
   ```bash
   ./install.sh
   ```
4. **That's it!** The installer does everything automatically.

## 📱 What You Get

- ✅ **Automatic dependency installation** (Homebrew, Node.js, Python, AI tools)
- ✅ **HTTPS setup** for camera permissions
- ✅ **Desktop shortcut** for easy launching
- ✅ **Mobile-ready PWA** that installs like a native app
- ✅ **Self-contained** - works offline after first setup

## 🖥️ Using Simply eBay

### On Your Mac:
- Double-click **"Simply eBay.command"** on your Desktop
- OR run `./launch-simply-ebay.sh` in the app folder

### On Mobile Devices:
1. Make sure your phone/tablet is on the **same WiFi** as your Mac
2. When you launch the app, it will show a URL like: `https://192.168.1.100:8000`
3. **Open that URL** on your mobile device
4. **Accept the security warning** (it's safe - it's your local server)
5. Look for **"Add to Home Screen"** or **"Install App"** 
6. **Tap it** to install Simply eBay as a native app!

## 🔧 What the Installer Does

The installer automatically:
- Installs Homebrew (if needed)
- Installs Node.js for the database
- Installs Python for the web server  
- Installs llama.cpp for AI processing
- Generates SSL certificates for camera access
- Creates launch scripts and desktop shortcuts
- Downloads the AI model (happens on first run)

## 📋 System Requirements

- **macOS** (10.15 or later)
- **Internet connection** (for initial setup and AI model download)
- **5GB free space** (for AI model)

## 🆘 Troubleshooting

### "Permission Denied" Error
```bash
chmod +x install.sh
./install.sh
```

### Camera Not Working
- Make sure you're using **HTTPS** (the installer sets this up automatically)
- **Allow camera permissions** when your browser asks

### Can't Access on Mobile
- Make sure devices are on the **same WiFi network**
- Try the IP address shown when the app starts
- **Accept the security warning** - it's safe for local development

### AI Model Download Fails
- Check your internet connection
- The model is 2GB+ so it may take time
- It only downloads once and is cached

## 🔄 Updates

To update Simply eBay:
1. Download the new version
2. Run `./install.sh` again
3. It will update everything automatically

## 🛑 Uninstalling

To remove Simply eBay:
- Delete the app folder
- Remove the Desktop shortcut
- Dependencies (Homebrew, Node.js, etc.) remain for other apps

## 📞 Support

- **Camera issues**: Make sure HTTPS is working
- **Mobile install**: Look for browser "Add to Home Screen" option
- **Performance**: Close other apps using the camera
- **Port conflicts**: The installer handles port conflicts automatically

---

**Made with ❤️ for easy eBay selling. Point your camera, get AI pricing, list to eBay!**
