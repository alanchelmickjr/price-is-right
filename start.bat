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

echo 🌐 Starting web server on port 8000...
echo.
echo 📱 Open your browser and go to:
echo    👉 http://localhost:8000
echo.
echo 🎯 Next steps:
echo    1. Allow camera permissions
echo    2. Click 'Setup eBay API' for real pricing
echo    3. Start scanning items!
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Start the server
%PYTHON_CMD% -m http.server 8000
