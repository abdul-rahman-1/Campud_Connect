@echo off
setlocal
title Water Tank Monitor GUI

echo ===================================================
echo   Water Tank Monitoring System - Startup
echo ===================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

:: Install Python dependencies
echo [1/4] Checking Python dependencies...
python -m pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing requests and pymongo...
    python -m pip install requests pymongo
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

:: Setup Backend
echo [2/4] Setting up Backend...
cd gui-backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
:: Start backend in background
start /B "Backend Server" cmd /c "node server.js"
cd ..

:: Setup Frontend
echo [3/4] Setting up Frontend...
cd gui-frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
:: Start frontend in background
start /B "Frontend Server" cmd /c "npm run dev -- --port 5173"
cd ..

:: Wait for servers to start
echo [4/4] Starting servers... Please wait 3 seconds.
timeout /t 3 /nobreak >nul

:: Open browser
echo Opening browser...
start http://localhost:5173/

echo.
echo ===================================================
echo   System is running. 
echo   Keep this window open to keep the servers alive.
echo   Press any key to close servers and exit.
echo ===================================================
pause >nul

:: Cleanup background processes
echo Shutting down...
taskkill /FI "WindowTitle eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Server*" /T /F >nul 2>&1

exit /b 0
