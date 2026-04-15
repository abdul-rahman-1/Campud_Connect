@echo off
REM Water Monitoring System - Quick Start for Windows

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   WATER MONITORING DASHBOARD - COMPLETE SYSTEM STARTUP         ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📋 REQUIRED: Open 4 separate terminals and run commands below...
echo.

echo ┌─ TERMINAL 1: Backend Monitor Service (24x7 Data Collection) ─┐
echo │                                                                 │
echo │  cd dashboardwater\backend                                     │
echo │  python monitor_service.py                                     │
echo │                                                                 │
echo │  Expected: ✓ symbols every 30 seconds                          │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo ┌─ TERMINAL 2: Flask API Server (Data Access) ─┐
echo │                                                │
echo │  cd dashboardwater\server                     │
echo │  python app.py                                │
echo │                                                │
echo │  Expected: Running on http://localhost:8003    │
echo └────────────────────────────────────────────────┘
echo.

echo ┌─ TERMINAL 3: Frontend React Dashboard ─┐
echo │                                          │
echo │  cd dashboardwater\client                │
echo │  npm install  (first time only)          │
echo │  npm run dev                             │
echo │                                          │
echo │  Expected: Local: http://localhost:5173  │
echo └──────────────────────────────────────────┘
echo.

echo ┌─ TERMINAL 4: Optional - Test & Monitor ─┐
echo │                                           │
echo │  cd dashboardwater\server                 │
echo │  python test_api.py                       │
echo │                                           │
echo │  Expected: ✅ All tests passed!           │
echo └───────────────────────────────────────────┘
echo.

echo ═══════════════════════════════════════════════════════════════════
echo 🌐 Once all running:
echo    1. Open browser to http://localhost:5173
echo    2. Click 'View Dashboard'
echo    3. Select a tank from dropdown
echo    4. See real-time water level visualization
echo ═══════════════════════════════════════════════════════════════════
echo.
pause
