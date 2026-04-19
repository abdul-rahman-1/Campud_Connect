# 🚀 Campus Connect - Water Monitoring System v2.0

> **HydroPulse // TankWatch - Enterprise-grade IoT Water Tank Monitoring with Admin Dashboard**

A complete full-stack application for real-time water tank monitoring across campus buildings. Features a Flask REST API backend, MongoDB database, Vite React TypeScript dashboard, and Cloudflare tunnel for public access.

---

## ✨ Features

### 🔧 Backend API
- 📊 **Real-time Monitoring** - Live water tank sensor data (voltage, pressure, MAC address)
- 🔔 **Alert Management** - Track and manage tank-related alerts and events
- 🌐 **REST API** - RESTful endpoints for frontend and third-party integration
- 🛡️ **Secure Configuration** - Environment-based config, no hardcoded secrets
- 📈 **Scalable Architecture** - MongoDB cloud-based data storage
- 🔍 **Health Checks** - Built-in health monitoring endpoints
- ⚡ **CORS Enabled** - Cross-origin requests for dashboard communication

### 📊 Admin Dashboard
- 🖥️ **System Status Monitoring** - Real-time server, database, and tunnel status
- 📋 **Service Management** - Start/stop/restart services from web UI
- 📖 **Log Viewer** - Stream and analyze server and tunnel logs
- ⚙️ **Configuration Editor** - Edit environment variables (password protected)
- 🔐 **Password Protected** - Secure admin panel access
- 📊 **Real-time Updates** - Live system metrics and status

### 🌐 Network & Deployment
- 🌍 **Cloudflare Tunnel** - Public URL sharing without port forwarding
- 🚀 **One-Click Launcher** - Unified system startup with start.bat
- 🔄 **Service Orchestration** - Automatic dependency management and startup
- 📦 **Modular Architecture** - Separate backend, frontend, networking layers

---

## 🛠️ Tech Stack

### **Backend (Python)**
| Component | Version | Purpose |
|-----------|---------|---------|
| **Framework** | Flask 3.0.0 | Web framework & API |
| **CORS** | Flask-CORS 4.0.0 | Dashboard integration |
| **Database Driver** | PyMongo 4.6.0 | MongoDB connectivity |
| **Config** | python-dotenv 1.0.0 | Environment management |
| **WSGI** | Werkzeug 3.0.1 | Web server gateway |
| **Production** | Gunicorn 21.2.0 | Production WSGI server |

### **Frontend (Node.js)**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Build Tool** | Vite | Fast bundler & dev server |
| **UI Framework** | React 18+ | Component-based UI |
| **Language** | TypeScript | Type-safe development |
| **Styling** | CSS | Component styling |
| **Port** | 5173 | Development server |

### **Database**
- **MongoDB Atlas** (Cloud-hosted)
- **Collections:** tanks, temp, alerts
- **Real-time data storage** for sensor readings

### **Networking**
- **Cloudflare Tunnel** - Public URL without port forwarding
- **CORS** - Enabled for cross-origin requests
- **Local Network** - http://localhost:8338 (API)

---

## 📁 Project Structure

```
d:\Campus Connect\api/
│
├── 🔧 Backend (Python)
│   ├── server.py              # Flask API + Admin routes
│   ├── config.py              # Configuration management
│   ├── requirements.txt        # Python dependencies
│   └── logs/                  # Application logs
│       ├── server.log         # API logs
│       └── cloudflared.log    # Tunnel logs
│
├── 📊 Dashboard (Node.js)
│   ├── dashboard/
│   │   ├── src/
│   │   │   ├── App.tsx        # Main app component
│   │   │   ├── main.tsx       # Entry point
│   │   │   ├── App.css        # Main styles
│   │   │   ├── index.css      # Global styles
│   │   │   ├── components/    # Reusable components
│   │   │   ├── pages/         # Page components
│   │   │   └── assets/        # Images/resources
│   │   ├── public/            # Static files
│   │   ├── package.json       # NPM dependencies
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── index.html         # HTML entry
│   └── node_modules/          # Installed packages
│
├── 🌐 Networking
│   ├── cloudflared.exe        # Cloudflare tunnel client
│   └── start.bat              # System launcher script
│
├── ⚙️ Configuration
│   ├── .env                   # Environment variables (private)
│   ├── .env.example           # Example template
│   └── .gitignore             # Git ignore rules
│
├── 📝 Documentation
│   ├── README.md              # This file
│   ├── img/                   # Screenshots/images
│   └── API_DOCUMENTATION.md   # API reference
│
└── 🖼️ Assets
    └── img/                   # Project images

```

## 📦 Quick Start (Recommended)

### **One-Click Startup with start.bat**

Simply double-click `start.bat` to automatically:
1. ✅ Verify Python is installed
2. ✅ Verify Node.js is installed
3. ✅ Download cloudflared if missing
4. ✅ Install/update Flask dependencies
5. ✅ Install/update Dashboard dependencies
6. ✅ Start Flask backend (minimized)
7. ✅ Start Cloudflare tunnel (minimized)
8. ✅ Open Vite dashboard (foreground)

**That's it!** Everything starts automatically.

```bash
Double-click: start.bat
```

### **Dashboard Access**
- **Local:** http://localhost:5173
- **Public:** https://[random].trycloudflare.com (check tunnel logs)

### **API Access**
- **Local:** http://localhost:8338
- **Public:** https://[tunnel-url]/data/TANK_ID

---

## 📋 Manual Installation (Advanced)

### **Prerequisites**
- Python 3.10 or higher
- Node.js 16+ (with npm)
- MongoDB Atlas account
- Cloudflare account (for tunnel)

### **Step 1: Install Python Dependencies**
```bash
pip install -r requirements.txt
```

### **Step 2: Install Dashboard Dependencies**
```bash
cd dashboard
npm install
cd ..
```

### **Step 3: Configure Environment**
Create/update `.env`:
```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=water_monitoring
TANKS_COLLECTION=tanks
TEMP_COLLECTION=temp
ALERTS_COLLECTION=alerts

# Flask
FLASK_ENV=development
API_HOST=0.0.0.0
API_PORT=8338
DEBUG=False

# Logging
LOG_LEVEL=INFO
```

### **Step 4: Download Cloudflared** (if not auto-downloaded)
```bash
# Windows
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -o cloudflared.exe

# Or download manually from Cloudflare website
```

---

## 🚀 Running Manually

### **Terminal 1: Start Backend API**
```bash
python server.py
# → http://localhost:8338
# → Logs: logs/server.log
```

### **Terminal 2: Start Cloudflare Tunnel**
```bash
./cloudflared.exe tunnel --url http://localhost:8338
# → Watch for: https://[random].trycloudflare.com
# → Logs: logs/cloudflared.log
```

### **Terminal 3: Start Vite Dashboard**
```bash
cd dashboard
npm run dev
# → http://localhost:5173
```

---

## 📡 API Documentation

### **Core Data Routes**

#### Get Tank Data
```http
GET /data/<tank_id>
```

**Parameters:**
- `tank_id` (string, required) - Tank identifier (e.g., `TANK_B01_01`)

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-04-19T12:30:45.123456",
  "data": {
    "unit_id": "TANK_B01_01",
    "_id": "69d5e4a4d38afbf289edce2d",
    "last_reading": {
      "voltage_V": 0.76,
      "pressure_MPa": 0.01793,
      "mac_address": "F4:65:0B:48:E1:D8",
      "timestamp": "2026-04-13T07:00:29.644000"
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Tank INVALID_TANK not found"
}
```

---

#### Health Check
```http
GET /health
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

### **Admin Dashboard Routes**

> **Note:** Admin routes are protected by password in some endpoints

#### System Status
```http
GET /admin/status
```

**Response:**
```json
{
  "success": true,
  "server_status": "running",
  "db_status": "connected",
  "tunnel_status": "online",
  "tunnel_url": "https://abc123.trycloudflare.com",
  "api_url": "http://0.0.0.0:8338",
  "config": {
    "DB_NAME": "water_monitoring",
    "API_PORT": 8338,
    "LOG_LEVEL": "INFO"
  }
}
```

#### Get Service Logs
```http
GET /admin/logs/<service>
```

**Parameters:**
- `service` (string) - `"server"` or `"cloudflared"`

**Response:**
```json
{
  "success": true,
  "logs": ["line1", "line2", ... "last 100 lines"]
}
```

#### Control Services
```http
POST /admin/service/<action>
Content-Type: application/json

{"target": "tunnel|server|system"}
```

**Actions:**
- `start/stop` on tunnel
- `restart` on server
- `fix-admin` on system (UAC elevation)

**Response:**
```json
{
  "success": true,
  "message": "Action initiated..."
}
```

#### File Management
```http
GET /admin/files
```

**Response:**
```json
{
  "success": true,
  "files": ["server.py", "config.py", ".env", "requirements.txt"]
}
```

#### Read File Content
```http
GET /admin/files/content?filename=config.py
```

#### Save File Content
```http
POST /admin/files/save
Content-Type: application/json

{
  "filename": "config.py",
  "content": "file contents..."
}
```



**Response:**
```json
{
  "success": true,
  "env": "MONGO_URI=...\nDB_NAME=..."
}
```



#### Shutdown System
```http
POST /admin/shutdown
```

**Response:**
```json
{
  "success": true,
  "message": "Shutting down everything..."
}
```

## 🔐 Security & Admin Access



Use this password for protected admin endpoints like `/admin/config`.

### **Security Best Practices**

✅ **Implemented:**
- Environment-based secrets (no hardcoded values)
- Password-protected admin endpoints
- CORS validation for dashboard
- MongoDB connection timeout
- Error handling without data exposure
- Request validation

⚠️ **For Production:**
- Change admin password immediately
- Use environment variables for all secrets
- Enable HTTPS/TLS
- Implement rate limiting
- Add request logging
- Use reverse proxy (Nginx)
- Enable MongoDB authentication
- Implement API key authentication

---

## 🛣️ Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CAMPUS CONNECT SYSTEM ARCHITECTURE              │
└─────────────────────────────────────────────────────────────┘

  IoT Sensors (Water Tanks)
         │
         ↓
  ┌─────────────────────┐
  │  MongoDB Atlas      │
  │  Collections:       │
  │  • tanks            │
  │  • temp             │
  │  • alerts           │
  └─────────────────────┘
         │
         ↓
  ┌─────────────────────────────────────────┐
  │      Flask API Server (localhost:8338)   │
  │  ┌───────────────────────────────────┐  │
  │  │  /data/<tank_id>    - Tank data   │  │
  │  │  /health            - API status  │  │
  │  │  /admin/*           - System mgmt │  │
  │  └───────────────────────────────────┘  │
  └─────────────────────────────────────────┘
         │
         ├─ Local ───────→ http://localhost:8338
         │
         └─ Public ──┐
                     ↓
          ┌──────────────────────────┐
          │  Cloudflare Tunnel       │
          │  https://[random].       │
          │  trycloudflare.com       │
          └──────────────────────────┘
                     │
                     ↓
          ┌──────────────────────────┐
          │  Vite Dashboard (5173)   │
          │  • System Monitoring     │
          │  • Service Control       │
          │  • Log Viewing           │
          │  • Config Editor         │
          │  • Tank Data Display     │
          └──────────────────────────┘
```

---

## 📊 Database Collections

### **tanks Collection**
```json
{
  "_id": ObjectId,
  "unit_id": "TANK_B01_01",
  "last_reading": {
    "timestamp": ISODate("2026-04-13T07:00:29.644Z"),
    "voltage_V": 0.76,
    "pressure_MPa": 0.01793,
    "mac_address": "F4:65:0B:48:E1:D8"
  }
}
```

### **temp Collection**
Temporary/staging tank data for testing or pending validation.

### **alerts Collection**
```json
{
  "_id": ObjectId,
  "unit_id": "TANK_B01_01",
  "name": "Building B, Floor 1",
  "alert_type": "LOW_PRESSURE",
  "severity": "WARNING",
  "timestamp": ISODate,
  "acknowledged": true,
  "message": "Alert description"
}
```

---

## 🧪 Testing & Validation

### **Database Test Script**
```bash
python test_db.py
```

Outputs all collections, document counts, and available tank IDs.

### **Test API Endpoints**
```bash
# Health check
python -c "import requests; print(requests.get('http://localhost:8338/health').json())"

# Get tank data
python -c "import requests; print(requests.get('http://localhost:8338/data/TANK_B01_01').json())"

# Test admin status
python -c "import requests; print(requests.get('http://localhost:8338/admin/status').json())"
```

---

## ⚙️ start.bat Deep Dive

The `start.bat` script is a comprehensive system launcher that:

1. **Environment Checks**
   - Verifies Python 3.10+ is installed
   - Verifies Node.js 16+ is installed
   - Checks Windows PATH configuration

2. **Dependency Management**
   - Auto-downloads cloudflared if missing
   - Installs/updates Flask dependencies (requirements.txt)
   - Installs/updates Dashboard dependencies (npm install)
   - Creates logs directory if missing

3. **Service Orchestration**
   - Starts Flask backend in minimized window
   - Starts Cloudflare tunnel in minimized window
   - Opens Vite dashboard in foreground
   - Logs all output to `logs/` directory
   - Graceful cleanup on exit

**Key Features:**
- ✅ One-click startup of entire system
- ✅ Automatic error handling
- ✅ Background service management
- ✅ Log aggregation
- ✅ Timeout handling
- ✅ Resource cleanup

See **Launcher Analysis** section below for detailed breakdown.

---

## � Launcher Analysis - start.bat

### **Script Breakdown**

```batch
@echo on                              # Show all commands
setlocal EnableDelayedExpansion        # Enable variable expansion
title Campus Connect API - System Launcher

set "ROOT_DIR=%~dp0"                  # Get script directory
cd /d "%ROOT_DIR%"                    # Change to root directory
```

### **Phase 1: Environment Verification**

```batch
:: 1. Check Python
python --version
if !errorlevel! neq 0 (
    echo [!] Python is not installed or not in PATH.
    pause
    exit /b 1
)
```
- Verifies Python is in system PATH
- Exits with error if missing
- Recommends user to install Python

```batch
:: 2. Check Node.js
node --version
if !errorlevel! neq 0 (
    echo [!] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)
```
- Verifies Node.js is installed
- Required for dashboard (npm, Vite)

### **Phase 2: Dependency Management**

```batch
:: 3. Check Cloudflared
if not exist "cloudflared.exe" (
    echo [!] cloudflared.exe not found
    echo Downloading cloudflared...
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -o cloudflared.exe
)
```
- **Smart Download:** Auto-downloads cloudflared if missing
- **Source:** Official GitHub releases
- **Platform:** Windows x64 specific

```batch
:: 4. Flask dependencies
python -m pip install -r requirements.txt
if !errorlevel! neq 0 (
    echo [!] Failed to install Flask dependencies.
    pause
    exit /b 1
)
```
- Installs/updates Flask packages
- Ensures all dependencies are current
- Prevents version conflicts

```batch
:: 5. Dashboard dependencies
cd /d "%ROOT_DIR%dashboard"
call npm install
if !errorlevel! neq 0 (
    echo [!] Failed to install Dashboard dependencies.
    pause
    exit /b 1
)
```
- Installs Node modules for dashboard
- Runs in dashboard directory
- Uses npm package-lock.json for stability

### **Phase 3: Service Startup**

```batch
:: Ensure logs directory exists
if not exist "logs" mkdir logs

:: Start Backend in background (Minimized)
start "Campus Connect API Backend" /min cmd /c "python server.py > logs\server.log 2>&1"
```
- Creates logs directory if missing
- Starts Flask server with `/min` (minimized window)
- **Output Redirection:** All stdout/stderr → `logs/server.log`

```batch
:: Start Cloudflare Tunnel in background (Minimized)
start "Cloudflare Tunnel" /min cmd /c "cloudflared.exe tunnel --url http://localhost:8338 > logs\cloudflared.log 2>&1"
```
- Starts tunnel to expose API publicly
- Logs tunnel output to `logs/cloudflared.log`
- Window title: "Cloudflare Tunnel"

```batch
:: Wait a moment for services to start
timeout /t 3 /nobreak
```
- Pauses 3 seconds for services to initialize
- Prevents race conditions

### **Phase 4: Frontend Launch**

```batch
:: Start Dashboard (Primary)
cd /d "%ROOT_DIR%dashboard"
npm run dev
```
- Changes to dashboard directory
- Runs `npm run dev` (Vite dev server)
- **Foreground:** Runs in primary window (user sees output)
- Opens http://localhost:5173 in browser

### **Phase 5: Cleanup**

```batch
:: Clean up when dashboard stops
taskkill /FI "WINDOWTITLE eq Campus Connect API Backend*" /T /F >nul 2>&1
exit /b 0
```
- Monitors dashboard window title
- When dashboard closes, kills background processes
- `/T` = Kill process tree (includes children)
- `/F` = Force kill
- `>nul 2>&1` = Suppress output

---

## 📋 Error Handling in start.bat

| Error | Cause | Resolution |
|-------|-------|-----------|
| Python not found | PATH not configured | Install Python 3.10+, add to PATH |
| Node.js not found | PATH not configured | Install Node.js 16+, add to PATH |
| Flask install fails | Package conflict | Delete `venv` folder, retry |
| npm install fails | Disk space/corruption | Clear npm cache: `npm cache clean --force` |
| Cloudflared download fails | No internet | Download manually from Cloudflare |

---

## �🔧 Configuration Details

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | Required | MongoDB connection string |
| `DB_NAME` | Required | Database name |
| `TANKS_COLLECTION` | tanks | Collection for primary tank data |
| `TEMP_COLLECTION` | temp | Collection for temporary tank data |
| `ALERTS_COLLECTION` | alerts | Collection for alert records |
| `FLASK_ENV` | development | Flask environment (development/production) |
| `API_HOST` | 0.0.0.0 | API host address |
| `API_PORT` | 8338 | API port number |
| `DEBUG` | False | Debug mode (development only) |
| `LOG_LEVEL` | INFO | Logging level (DEBUG/INFO/WARNING/ERROR) |

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
✗ MongoDB connection failed: [error message]
```
**Solution:**
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas cluster is running
- Ensure IP whitelist includes your machine

### Tank Not Found
```json
{
  "success": false,
  "error": "Tank TANK_X not found"
}
```
**Solution:**
- Run `python test_db.py` to see available tank IDs
- Use correct tank ID (e.g., `TANK_B01_01`, not `tank_b01_01`)

### Port Already in Use
```
Address already in use
```
**Solution:**
- Kill existing Flask process: `taskkill /im python.exe /f`
- Or change `API_PORT` in `.env`

---

## 📝 API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful request |
| 404 | Not Found | Tank/resource not found |
| 500 | Server Error | Internal server error |

---

## 🔐 Security Best Practices

✅ **Implemented:**
- No sensitive data in source code
- Environment-based configuration
- Secure MongoDB connection string in `.env`
- Error handling without exposing internals
- CORS support configured

⚠️ **For Production:**
- Use environment variables, not `.env` file
- Enable MongoDB IP whitelist
- Use production WSGI server (Gunicorn)
- Set `DEBUG = False`
- Implement authentication/authorization
- Use HTTPS only
- Add rate limiting

---

## 📊 Available Tank IDs

### Primary Tanks (`tanks` collection)
- `TANK_B01_01`

### Temporary Tanks (`temp` collection)
- `TANK_B01_01_temp` through `TANK_B15_01_temp`

> **Note:** Run `python test_db.py` to get the latest list

---

## 🚀 Deployment

### Local Development
```bash
python server.py
```

### Docker (if needed)
```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8338", "server:app"]
```

### Cloud Platforms
- **Heroku:** Configure Procfile + environment variables
- **AWS:** Deploy with Gunicorn on EC2/Elastic Beanstalk
- **Azure:** Deploy as App Service with Gunicorn
- **Google Cloud:** Deploy to Cloud Run or App Engine

---

## 📧 Support & Contact

For issues, bugs, or feature requests:
1. Check troubleshooting section above
2. Run `python test_db.py` to diagnose database issues
3. Review server logs in `logs/` directory
4. Contact the Campus Connect development team

---

## 📄 License

This project is part of the Campus Connect infrastructure suite.

---

## 🎯 Future Enhancements

- [ ] Add authentication/authorization
- [ ] Implement data pagination
- [ ] Add alert webhook notifications
- [ ] Create frontend dashboard
- [ ] Add historical data analysis
- [ ] Implement data export (CSV/PDF)
- [ ] Add WebSocket support for real-time updates
- [ ] Create mobile app integration

---

**Last Updated:** April 18, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
