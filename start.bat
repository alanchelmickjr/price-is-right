@echo off
REM Simply eBay - Quick Start Script for Windows

echo 🚀 Simply eBay - Quick Start
echo ===============================

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Error: Please run this script from the project directory ^(where index.html is located^)
    pause
    exit /b 1
)

echo 📋 Checking requirements...

REM Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    echo ✅ Python found
) else (
    python3 --version >nul 2>&1
    if %errorlevel% == 0 (
        set PYTHON_CMD=python3
        echo ✅ Python3 found
    ) else (
        echo ❌ Python not found. Please install Python to run a local server.
        echo    Or open index.html directly in your browser ^(some features may be limited^)
        pause
        exit /b 1
    )
)

REM Check for llama-server and install if needed
llama-server --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ llama-server found
    set AI_SERVER=true
) else (
    echo 🤖 Setting up your personal AI assistant ^(this keeps you safe!^)
    echo 📥 Installing llama.cpp automatically...
    echo 🔒 This protects your privacy - everything stays on your device
    echo ⏱️  One-time setup takes 2-3 minutes, then it's instant forever
    echo.
    
    REM Create temp directory for download
    mkdir "%TEMP%\llama-cpp-install" 2>nul
    cd "%TEMP%\llama-cpp-install"
    
    echo 📦 Downloading llama.cpp...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/ggerganov/llama.cpp/releases/latest/download/llama-b3-win-x64.zip' -OutFile 'llama.zip'}"
    
    if exist llama.zip (
        echo 📂 Extracting files...
        powershell -Command "& {Expand-Archive -Path 'llama.zip' -DestinationPath 'llama' -Force}"
        
        echo 🔧 Installing to Program Files...
        mkdir "C:\Program Files\llama.cpp" 2>nul
        xcopy /Y /E /I "llama\*" "C:\Program Files\llama.cpp"
        
        echo 🔨 Adding to PATH...
        setx PATH "%PATH%;C:\Program Files\llama.cpp"
        set "PATH=%PATH%;C:\Program Files\llama.cpp"
        
        echo ✅ llama.cpp installed successfully!
        set AI_SERVER=true
        
        REM Clean up
        cd ..
        rmdir /S /Q llama-cpp-install
    ) else (
        echo ❌ Download failed. Please check your internet connection.
        set AI_SERVER=false
    )
    
    cd "%~dp0"
)

REM Set ports
set WEB_PORT=8000
set AI_PORT=8080

echo 🌐 Starting web server on port %WEB_PORT%...
start "Simply eBay Web Server" /min %PYTHON_CMD% -m http.server %WEB_PORT%

if "%AI_SERVER%"=="true" (
    echo 🤖 Preparing AI server...
    
    REM Check if model exists in cache
    set "MODEL_PATH=%USERPROFILE%\.cache\huggingface\hub\models--ggml-org--SmolVLM-500M-Instruct-GGUF\snapshots"
    if not exist "%MODEL_PATH%" (
        echo 📥 Downloading SmolVLM model ^(this may take a few minutes^)...
        echo    Model will be cached for future use
        echo.
        echo ⏳ Progress:
        echo    ⬜ Connecting to Hugging Face
        echo    ⬜ Downloading model files
        echo    ⬜ Verifying download
        echo.
        
        REM First attempt to download the model
        start "Simply eBay AI Model Download" /min llama-server --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF --hf-file SmolVLM-500M-Instruct-Q8_0.gguf --mmproj ggml-org/SmolVLM-500M-Instruct-GGUF/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf --port %AI_PORT% --host 0.0.0.0 --n-gpu-layers 99 --chat-template chatml --log-disable
        
        REM Wait for model download to complete or fail
        :download_loop
        if exist "%MODEL_PATH%" (
            echo ✅ Model downloaded successfully!
            taskkill /f /fi "WINDOWTITLE eq Simply eBay AI Model Download*" >nul 2>&1
            goto download_complete
        )
        
        REM Check if process is still running
        tasklist /fi "WINDOWTITLE eq Simply eBay AI Model Download*" >nul 2>&1
        if errorlevel 1 (
            echo ❌ Model download failed. Please check your internet connection and try again.
            exit /b 1
        )
        
        timeout /t 1 /nobreak >nul
        goto download_loop
        
        :download_complete
    ) else (
        echo ✅ SmolVLM model found in cache
    )
    
    echo.
    echo 🚀 Starting AI server on port %AI_PORT%...
    
    REM Start the server with the downloaded model
    start "Simply eBay AI Server" /min llama-server --hf-repo ggml-org/SmolVLM-500M-Instruct-GGUF --hf-file SmolVLM-500M-Instruct-Q8_0.gguf --mmproj ggml-org/SmolVLM-500M-Instruct-GGUF/mmproj-SmolVLM-500M-Instruct-Q8_0.gguf --port %AI_PORT% --host 0.0.0.0 --n-gpu-layers 99 --chat-template chatml --log-disable
    
    echo ⏳ Waiting for AI server to initialize...
    echo    This may take a few seconds...
    
    REM Wait for server to be ready
    set MAX_RETRIES=30
    set RETRY_COUNT=0
    
    :server_check_loop
    curl -s "http://localhost:%AI_PORT%/health" >nul 2>&1
    if not errorlevel 1 goto server_ready
    
    set /a RETRY_COUNT+=1
    if %RETRY_COUNT% equ %MAX_RETRIES% (
        echo ❌ AI server failed to start. Please check the logs and try again.
        taskkill /f /fi "WINDOWTITLE eq Simply eBay AI Server*" >nul 2>&1
        exit /b 1
    )
    
    <nul set /p ".=."
    timeout /t 1 /nobreak >nul
    goto server_check_loop
    
    :server_ready
    echo.
    echo ✅ AI server ready!
)

echo.
echo 🎉 Servers started successfully!
echo 📱 Open your browser and go to:
echo    👉 http://localhost:%WEB_PORT%
echo.
if "%AI_SERVER%"=="true" (
    echo 🤖 AI Server: http://localhost:%AI_PORT%
    echo    Status: http://localhost:%AI_PORT%/health
) else (
    echo ⚠️  AI Server: Not available ^(install llama.cpp for full functionality^)
)
echo.
echo 🎯 Next steps:
echo    1. Allow camera permissions
echo    2. Start scanning items with AI!
echo    3. Click 'Setup eBay API' for real pricing
echo.
echo 🛑 Close this window to stop servers
echo.

REM Keep the window open
echo Press any key to stop all servers...
pause >nul

REM Kill the servers
taskkill /f /im python.exe /fi "WINDOWTITLE eq Simply eBay Web Server*" >nul 2>&1
taskkill /f /im llama-server.exe /fi "WINDOWTITLE eq Simply eBay AI Server*" >nul 2>&1
