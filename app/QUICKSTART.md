# Water Monitoring Dashboard - Complete Setup Guide

## Project Structure

```
dashboardwater/
├── backend/                    # 24/7 monitoring service
│   ├── app.py                 # Monitor service (runs continuously)
│   ├── config.py              # Configuration (ESP32 IPs, MongoDB URI)
│   ├── test_connection.py     # Connection verification
│   └── [documentation files]
│
├── server/                     # 🆕 API Server (NEW)
│   ├── app.py                 # Flask API endpoints
│   ├── requirements.txt        # Dependencies
│   ├── .env                    # Environment variables
│   ├── test_api.py            # API endpoint tests
│   └── README.md              # API documentation
│
└── client/                     # React Dashboard
    ├── src/
    │   ├── App.tsx            # React components
    │   └── index.css           # Styling
    ├── .env                    # API URL configuration
    └── [frontend files]
```

## System Architecture

```
ESP32 Hardware Devices
       ↓
Backend Monitor Service (24x7)
    ↓         ↓
  MongoDB   Flask API Server
       ↓
React Dashboard (Frontend)
```

## Component Overview

### 1. **ESP32 Hardware** (`esp32_quickstart_simple.ino`)
- Collects water pressure data from G 1/4" 1.2MPa sensor
- Sends HTTP responses with: voltage_V, pressure_MPa, mac_address
- Endpoint: `GET http://{esp32_ip}/data`

### 2. **Backend Monitor Service** (`dashboardwater/backend/monitor_service.py`)
- Runs 24x7 on a Linux/Windows server
- Fetches data from ESP32 devices every 30 seconds
- Calculates: Pressure → Height → Volume → Percentage
- Stores readings in MongoDB `tanks` collection
- Generates alerts when water level drops below 20%
- Can be managed as a systemd service

### 3. **Flask API Server** (`dashboardwater/server/app.py`) - *NEW*
- RESTful API wrapper for MongoDB data
- Serves data to the React frontend
- Port: 8003 (configurable)
- Supports CORS (Cross-Origin requests)

### 4. **React Dashboard** (`dashboardwater/client/App.tsx`)
- Interactive web interface
- Real-time tank visualization
- Historical charts
- Settings management
- CSV export

## Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 18+ (for frontend only)
- MongoDB Atlas account
- ESP32 devices on same network

### Step 1: Start the Backend Monitor Service

```bash
# Open terminal 1 - Backend Monitor Service
cd dashboardwater/backend

# Install dependencies (if not done already)
pip install -r requirements.txt

# Configure ESP32 IPs and MongoDB in config.py
# Then run:
python monitor_service.py
```

Expected Output:
```
======================================================================
🚀 WATER MONITORING SYSTEM - 24H MONITORING SERVICE
======================================================================
Starting daily monitoring at 2026-03-24 10:30:00
Database: water_monitoring
Configured tanks: 1 (TANK_B1_01)
======================================================================
Fetching data from 1 configured tank(s)...
✓ TANK_B1_01 - Pressure: 0.625 MPa, Level: 56.8%
✓ Alert check completed
⏳ Next cycle in 30s (Cycle #1)
```

### Step 2: Start the Flask API Server

```bash
# Open terminal 2 - API Server
cd dashboardwater/server

# If dependencies not installed:
pip install -r requirements.txt

# Run the API server:
python app.py
```

Expected Output:
```
======================================================================
🚀 WATER MONITORING DASHBOARD API SERVER
======================================================================
Starting on http://0.0.0.0:8003
Debug mode: False
Database: water_monitoring
======================================================================
 * Running on http://0.0.0.0:8003
```

### Step 3: Test API Endpoints

```bash
# Open terminal 3 - Test
cd dashboardwater/server

# Run tests:
python test_api.py
```

Expected Output:
```
======================================================================
🧪 WATER MONITORING API - TEST SUITE
======================================================================

[TEST] API Status
  URL: GET http://localhost:8003/api
  ✓ Status: 200
  ✓ Response: {"status": "ok", "service": "Water Monitoring API", ...}

[TEST] Get Tank Status (Real)
  URL: GET http://localhost:8003/api/status/TANK_B1_01
  ✓ Status: 200
  ✓ Response: {"unit_id": "TANK_B1_01", "pressure": 0.625, ...}

[TEST] Get Tank History
  URL: GET http://localhost:8003/api/history/TANK_B1_01?hours=24
  ✓ Status: 200
  ✓ Response: List with 24 items

======================================================================
📊 TEST SUMMARY
======================================================================
Passed: 9/9
Failed: 0/9

✅ All tests passed!
======================================================================
```

### Step 4: Start the Frontend Dashboard

```bash
# Open terminal 4 - Frontend
cd dashboardwater/client

# Install dependencies (if not done already)
npm install

# Start development server:
npm run dev
```

Expected Output:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Then open http://localhost:5173 in your browser.

## Testing the Complete System

### Test Case 1: View Real Tank Data
```
1. Open http://localhost:5173
2. Click "View Dashboard"
3. Select "TANK_B1_01" from dropdown
4. Should see:
   - Current water level percentage
   - Pressure reading
   - Height measurement
   - Volume in liters
   - Historical 24-hour chart
```

### Test Case 2: View Test Data
```
1. Open Browser Console (F12)
2. Check Network tab - verify API calls go to http://localhost:8003/api
3. Add ?temp=true to status query to view test tanks
4. API calls should show:
   - Status: 200 OK
   - Content-Type: application/json
   - Response times: <100ms
```

### Test Case 3: Check Monitoring Service
```
1. In the backend monitor terminal, watch for:
   - ✓ symbols for successful fetches
   - Error messages (if any)
   - Timestamp of last cycle
2. Data should update every 30 seconds
```

## API Endpoints Reference

### Read Data
```
GET /api                          # API status
GET /api/health                   # Health check
GET /api/tanks                    # All tanks
GET /api/status/{tankId}          # Current reading
GET /api/history/{tankId}         # 24h history
GET /api/config/{tankId}          # Tank settings
GET /api/alerts                   # Recent alerts
```

### Write Data
```
POST /api/config/{tankId}         # Update tank settings
```

### Query Parameters
```
?temp=true                        # Use test data instead of real
?hours=24                         # For history (default: 24)
```

## Configuration Files

### Backend Monitor: `dashboardwater/backend/config.py`
```python
ESP32_TANKS = {
    "TANK_B1_01": {
        "ip": "172.25.52.247",           # ESP32 IP address
        "port": 80,
        "endpoint": "/data",
        "building": "Building_A",
        "location": "Roof_Tank_1",
        "diameter_m": 1.829,             # Tank diameter
        "height_m": 1.829,               # Tank height
        "capacity_liters": 5000,
        "sensor_offset_V": 0.0
    }
}
```

### API Server: `dashboardwater/server/.env`
```
MONGO_URI=mongodb+srv://...your...connection...string...
API_PORT=8003
DEBUG=False
```

### Frontend: `dashboardwater/client/.env`
```
VITE_API_URL=http://localhost:8003/api
```

## Common Issues & Solutions

### Issue: "Connection refused" on port 8003
**Solution**: Check if API server is running
```bash
# In server terminal, restart:
python app.py
```

### Issue: MongoDB connection error
**Solution**: Verify MONGO_URI in both config files
```bash
# Backend config:
cat dashboardwater/backend/config.py | grep MONGO_URI

# Server config:
cat dashboardwater/server/.env | grep MONGO_URI
```

### Issue: Frontend shows "API Error"
**Solution**: Check .env file and ensure API server is running
```bash
# Verify API is responding:
curl http://localhost:8003/api

# Check frontend .env:
cat dashboardwater/client/.env
```

### Issue: No data appearing in dashboard
**Solutions**:
1. Check monitor service is running: Look for ✓ symbols in backend terminal
2. Verify MongoDB has data: MongoDB Compass or MongoDB Atlas dashboard
3. Check ESP32 is online: Ping the IP address
4. Review test data: Add ?temp=true to API calls

## Deployment Checklist

- [ ] Backend monitor service running 24x7
- [ ] API server accessible on port 8003
- [ ] Frontend dashboard loading at correct API URL
- [ ] All test cases passing
- [ ] No errors in browser console
- [ ] MongoDB Atlas credentials secured (use .env files)
- [ ] ESP32 devices configured with correct IPs
- [ ] Systemd service configured (Linux servers)

## File Tree Verification

```
dashboardwater/
├── backend/                              ✓
│   ├── monitor_service.py               ✓ (450 lines)
│   ├── config.py                        ✓ Config
│   ├── test_connection.py               ✓ Tests
│   ├── requirements.txt                 ✓
│   ├── .env.example                     ✓
│   ├── README.md                        ✓ (400 lines)
│   ├── ESP32_FIRMWARE_GUIDE.md          ✓ (400 lines)
│   ├── DEPLOYMENT_GUIDE.md              ✓ (300 lines)
│   ├── ARCHITECTURE.md                  ✓ (200 lines)
│   ├── SUMMARY.md                       ✓
│   └── water-monitor.service            ✓ (systemd)
│
├── server/                               ✓ NEW
│   ├── app.py                           ✓ API (650 lines)
│   ├── requirements.txt                 ✓ Dependencies
│   ├── .env                             ✓ Config  
│   ├── test_api.py                      ✓ Tests
│   └── README.md                        ✓ API Docs (400 lines)
│
└── client/                               ✓
    ├── src/
    │   ├── App.tsx                      ✓ (1000 lines)
    │   ├── main.tsx                     ✓
    │   └── index.css                    ✓
    ├── .env                             ✓ API URL
    ├── package.json                     ✓
    └── [other React files]              ✓
```

## What's Happening Behind the Scenes

### Data Flow: Reading to Dashboard

```
1. ESP32 sensors read pressure
   └─→ Sends HTTP: {"voltage_V": 2.5, "pressure_MPa": 0.625}

2. Backend Monitor Service fetches every 30s
   └─→ Converts: Pressure → Height → Volume → Percentage
   └─→ Stores in MongoDB: tanks.TANK_B1_01.last_reading

3. API Server reads from MongoDB
   └─→ Returns JSON: {"fillPercent": 56.8, "pressure": 0.625, ...}

4. React Dashboard polls API every 5s
   └─→ Updates component state
   └─→ Renders animated water tank visualization

5. User sees real-time dashboard
   └─→ With historical charts
   └─→ With alert indicators
```

## Next Steps

1. ✅ Backend monitor running → Data flowing to MongoDB
2. ✅ API server running → Frontend can fetch data
3. ✅ Frontend dashboard running → See live water levels
4. 📋 Add more ESP32 devices → Edit config.py ESP32_TANKS
5. 📋 Configure alerts → Email/SMS when water is low
6. 📋 Deploy to production server → Linux box with systemd

---

**Status**: ✅ Complete System Ready for Testing
**Version**: 1.0
**Last Updated**: March 24, 2026
