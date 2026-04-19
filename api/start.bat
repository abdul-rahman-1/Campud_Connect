@echo on
if not "%1"=="max" start "" /max "%~f0" max & exit
chcp 65001 >nul
mode con: cols=140 lines=45
setlocal EnableDelayedExpansion
title Campus Connect API - System Launcher

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: CRITICAL: Admin Permission Check - MUST RUN FIRST
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

cls
net session >nul 2>&1
if !errorlevel! neq 0 (
    cls
    echo.
    echo.
    echo   ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
    echo   ║                                                                                                                              ║
    echo   ║                                   ⚠️  ADMINISTRATOR PERMISSION REQUIRED ⚠️                                                    ║
    echo   ║                                                                                                                              ║
    echo   ║   This script REQUIRES elevated Administrator privileges to function properly.                                            ║
    echo   ║   Running without admin permissions will cause startup failures.                                                           ║
    echo   ║                                                                                                                              ║
    echo   ║   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  ║
    echo   ║                                                                                                                              ║
    echo   ║   SOLUTION:                                                                                                                ║
    echo   ║                                                                                                                              ║
    echo   ║   1. Close this window                                                                                                     ║
    echo   ║   2. Locate start.bat in file explorer                                                                                     ║
    echo   ║   3. RIGHT-CLICK on start.bat                                                                                              ║
    echo   ║   4. Select "Run as Administrator"                                                                                         ║
    echo   ║   5. Click "Yes" when User Account Control prompt appears                                                                   ║
    echo   ║                                                                                                                              ║
    echo   ║   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  ║
    echo   ║                                                                                                                              ║
    echo   ║   This is REQUIRED for:                                                                                                    ║
    echo   ║      • Installing Windows Terminal                                                                                         ║
    echo   ║      • Managing services and processes                                                                                     ║
    echo   ║      • Network tunnel access                                                                                               ║
    echo   ║                                                                                                                              ║
    echo   ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
    echo.
    echo.
    pause
    exit /b 1
)

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: Admin Check Passed - Continue Initialization
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

cls
echo.
echo   ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
echo   ║                                                                                                                              ║
echo   ║                          Campus Connect API Server // TankWatch v2.0 - Initialization                                       ║
echo   ║                                                                                                                              ║
echo   ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
echo.
echo   [✓] Administrator privileges confirmed
echo   [✓] Fullscreen mode enabled (140x45 columns)
echo   [✓] UTF-8 encoding enabled
echo.
echo   ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
echo.

set "ROOT_DIR=%~dp0"
set "CLOUDFLARED_PATH=C:\cloudflared.exe"
cd /d "%ROOT_DIR%"

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 1. Check Python Installation
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [1/8] Verifying Python installation...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo   [✗] Python is not installed or not in system PATH
    echo.
    echo   SOLUTION:
    echo   • Download Python 3.10+ from https://www.python.org/downloads/
    echo   • IMPORTANT: Check "Add Python to PATH" during installation
    echo   • Restart your computer
    echo   • Run this script again
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo   [✓] !%%i! found
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 2. Check Node.js Installation
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [2/8] Verifying Node.js installation...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo   [✗] Node.js is not installed or not in system PATH
    echo.
    echo   SOLUTION:
    echo   • Download Node.js 16+ from https://nodejs.org/
    echo   • Run the installer
    echo   • Restart your computer
    echo   • Run this script again
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   [✓] Node.js !%%i! found
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 3. Check/Download Cloudflared to C:\ Drive
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [3/8] Checking Cloudflare Tunnel client...
if exist "%CLOUDFLARED_PATH%" (
    echo   [✓] cloudflared.exe found at C:\
) else (
    echo   [!] cloudflared.exe not found at C:\
    echo   [*] Downloading cloudflared.exe to C:\...
    echo.
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -o "%CLOUDFLARED_PATH%"
    if !errorlevel! neq 0 (
        echo.
        echo   [✗] Failed to download cloudflared.exe
        echo.
        echo   SOLUTION:
        echo   • Check your internet connection
        echo   • Download manually from:
        echo     https://github.com/cloudflare/cloudflared/releases
        echo   • Save as: C:\cloudflared.exe
        echo   • Run this script again
        echo.
        pause
        exit /b 1
    )
    echo   [✓] cloudflared.exe downloaded successfully to C:\
)
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 4. Skip Windows Terminal Check (Optional)
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [4/8] Windows Terminal check (optional)...
echo   [✓] Skipped (Windows Terminal is optional)
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 5. Install Flask Dependencies
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [5/8] Installing Python dependencies...
python -m pip install -r requirements.txt >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo   [✗] Failed to install Flask dependencies
    echo.
    echo   SOLUTION:
    echo   • Delete the 'venv' folder if it exists
    echo   • Clear pip cache: python -m pip cache purge
    echo   • Run this script again
    echo.
    pause
    exit /b 1
)
echo   [✓] Flask dependencies installed successfully
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 6. Create Logs Directory
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [6/8] Preparing logs directory...
if not exist "logs" mkdir logs
echo   [✓] Logs directory ready
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 7. Install Dashboard Dependencies
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [7/8] Installing Dashboard dependencies...
cd /d "%ROOT_DIR%dashboard"
call npm install >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo   [✗] Failed to install Dashboard dependencies
    echo.
    echo   SOLUTION:
    echo   • Clear npm cache: npm cache clean --force
    echo   • Delete node_modules folder
    echo   • Run this script again
    echo.
    pause
    exit /b 1
)
echo   [✓] Dashboard dependencies installed successfully
echo.

:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
:: 8. Start All Services
:: ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

echo   [8/8] Starting services...
echo.

cd /d "%ROOT_DIR%"

echo   [*] Starting Flask Backend API (http://localhost:8338)...
start "Campus Connect API Backend" /min cmd /c "python server.py > logs\server.log 2>&1"
echo   [✓] Flask server started in background
echo.

echo   [*] Starting Cloudflare Tunnel (check console for public URL)...
start "Cloudflare Tunnel" /min cmd /c "%CLOUDFLARED_PATH% tunnel --url http://localhost:8338 > logs\cloudflared.log 2>&1"
echo   [✓] Tunnel started in background
echo.

echo   [*] Waiting for services to initialize...
timeout /t 3 /nobreak

echo.
echo   ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
echo.
echo   [✓] All services initialized successfully!
echo.
echo   Dashboard URL: http://localhost:5173
echo   API URL:      http://localhost:8338
echo.
echo   [*] Opening browser and starting Vite Dashboard...
echo.

cd /d "%ROOT_DIR%dashboard"
timeout /t 2 /nobreak
start http://localhost:5173
npm run dev

:: Cleanup when dashboard stops
echo.
echo   [*] Dashboard stopped. Cleaning up background processes...
echo.
taskkill /FI "WINDOWTITLE eq Campus Connect API Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Cloudflare Tunnel*" /T /F >nul 2>&1
echo   [✓] Cleanup complete. System shutdown.
echo.
pause
exit /b 0
