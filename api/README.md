# 🚀 Water Monitoring API

> **Real-time IoT Water Tank Monitoring & Alert System for Campus Connect**

A lightweight Flask REST API that monitors water tanks across campus buildings, collecting real-time sensor data including voltage, pressure, and device information. Built with Python, MongoDB, and Flask.

---

## ✨ Features

- 📊 **Real-time Monitoring** - Get live water tank data (voltage, pressure, MAC address)
- 🔔 **Alert Management** - Track and manage tank-related alerts
- 🌐 **REST API** - Clean, simple endpoints for frontend integration
- 🛡️ **Secure Configuration** - Environment-based configuration (no hardcoded secrets)
- 📈 **Scalable Architecture** - MongoDB cloud-based data storage
- 🔍 **Health Checks** - Built-in health endpoint for monitoring
- 🐍 **Minimal Dependencies** - Only 3 main dependencies (Flask, PyMongo, python-dotenv)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Flask 3.0.0 |
| **Database** | MongoDB Atlas (Cloud) |
| **Driver** | PyMongo 4.6.0 |
| **Server** | Gunicorn 21.2.0 |
| **Language** | Python 3.10+ |

---

## 📦 Installation

### Prerequisites
- Python 3.10 or higher
- MongoDB Atlas account (or local MongoDB)
- pip package manager

### Step 1: Clone/Setup Project
```bash
cd "d:\Campus Connect\api"
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=water_monitoring
TANKS_COLLECTION=tanks
TEMP_COLLECTION=temp
ALERTS_COLLECTION=alerts

# Flask Configuration
FLASK_ENV=development
API_HOST=0.0.0.0
API_PORT=8338
DEBUG=False

# Logging
LOG_LEVEL=INFO
```

> **Note:** For production, use environment variables instead of `.env` file

---

## 🚀 Running the Server

### Development Mode
```bash
python server.py
```

Server will start on: **http://localhost:8338**

### Production Mode
```bash
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:8338 server:app
```

---

## 📡 API Documentation

### Health Check
**Verify the API is running and database is connected**

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

### Get Tank Data
**Fetch real-time data for a specific tank**

```http
GET /data/<tank_id>
```

**Parameters:**
- `tank_id` (string, required) - The unique tank identifier (e.g., `TANK_B01_01`)

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-04-18T14:24:26.636417",
  "data": {
    "_id": "69d5e4a4d38afbf289edce2d",
    "unit_id": "TANK_B01_01",
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
  "error": "Tank TANK_INVALID not found"
}
```

---

## 📊 Database Schema

### Collections Overview

#### `tanks` Collection
Primary collection for active tank monitoring data.

```javascript
{
  "_id": ObjectId,
  "unit_id": "TANK_B01_01",
  "last_reading": {
    "timestamp": ISODate("2026-04-13T07:00:29.644Z"),
    "voltage_V": 0.76,          // Battery/supply voltage
    "pressure_MPa": 0.01793,    // Water pressure
    "mac_address": "F4:65:0B:48:E1:D8"  // IoT device MAC
  }
}
```

#### `temp` Collection
Temporary/staging data for tanks (15+ documents).

```javascript
{
  "_id": ObjectId,
  "unit_id": "TANK_B08_01_temp",
  "last_reading": { /* same structure */ }
}
```

#### `alerts` Collection
Alert/notification records for monitoring events.

```javascript
{
  "_id": ObjectId,
  "unit_id": "TANK_B01_01",
  "name": "Building B, Floor 1",
  "building": "B",
  "location": "Floor 1",
  "alert_type": "LOW_PRESSURE",
  "severity": "WARNING",
  "level_percentage": 25,
  "volume_liters": 500,
  "timestamp": ISODate("2026-04-18T14:00:00Z"),
  "acknowledged": true,
  "acknowledged_by": "admin",
  "acknowledged_at": ISODate("2026-04-18T14:05:00Z"),
  "message": "Water pressure below threshold"
}
```

---

## 🧪 Testing

### Run Database Test
View all collections and tank data in the database:

```bash
python test_db.py
```

**Output Example:**
```
🔍 MONGODB DATABASE TEST
✓ Connected to MongoDB
📊 Database: water_monitoring

📦 TANKS COLLECTION
Total documents: 1
  - TANK_B01_01

📦 TEMP COLLECTION  
Total documents: 15
  - TANK_B01_01_temp through TANK_B15_01_temp

📦 ALERTS COLLECTION
Total documents: 11
```

### Test API Endpoints

**Test health endpoint:**
```bash
python -c "import requests, json; r = requests.get('http://127.0.0.1:8338/health'); print(json.dumps(r.json(), indent=2))"
```

**Test tank data endpoint:**
```bash
python -c "import requests, json; r = requests.get('http://127.0.0.1:8338/data/TANK_B01_01'); print(json.dumps(r.json(), indent=2))"
```

---

## 📁 Project Structure

```
Campus Connect/api/
├── config.py                 # Configuration management
├── server.py                 # Flask server + API routes
├── test_db.py               # Database testing utility
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (local)
├── .env.example             # Example environment template
├── .gitignore               # Git ignore rules
├── logs/                    # Application logs directory
└── README.md                # This file
```

---

## 🔧 Configuration Details

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
