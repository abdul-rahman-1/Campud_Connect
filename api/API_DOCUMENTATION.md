# Water Monitoring API Documentation

## Overview
The Water Monitoring API provides real-time access to water tank sensor data including voltage, pressure readings, and MAC addresses.

## Base URL
```
http://localhost:8338
```

---

## Endpoints

### 1. **GET /data/<tank_id>**
Fetch complete data for a specific tank.

**Request:**
```
GET http://localhost:8338/data/TANK_B08_01_temp
```

**Response (200 OK):**
```json
{
  "success": true,
  "timestamp": "2026-04-09T10:30:45.123456",
  "data": {
    "_id": "69c23a09d685484bf94dd862",
    "unit_id": "TANK_B08_01_temp",
    "last_reading": {
      "timestamp": "2026-03-24T07:13:21.560000",
      "voltage_V": 0.511,
      "pressure_MPa": 0.003437,
      "mac_address": "93:41:38:78:24:13"
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

**Field Descriptions:**
- `unit_id` - Unique tank identifier
- `voltage_V` - Battery voltage (Volts)
- `pressure_MPa` - Water pressure (Megapascals)
- `mac_address` - Device MAC address
- `timestamp` - Reading timestamp (ISO 8601 format)

---

### 2. **GET /health**
Health check endpoint - verify API and database connection.

**Request:**
```
GET http://localhost:8338/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

**Response (500 Error):**
```json
{
  "success": false,
  "status": "unhealthy",
  "error": "MongoDB connection failed"
}
```

---

## Frontend Integration Examples

### **JavaScript (Fetch API)**

```javascript
// Get tank data
async function getTankData(tankId) {
  try {
    const response = await fetch(`http://localhost:8338/data/${tankId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      const tank = data.data;
      console.log('Tank ID:', tank.unit_id);
      console.log('Voltage:', tank.last_reading.voltage_V, 'V');
      console.log('Pressure:', tank.last_reading.pressure_MPa, 'MPa');
      console.log('MAC Address:', tank.last_reading.mac_address);
      return tank;
    } else {
      console.error('API Error:', data.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Check API health
async function checkHealth() {
  try {
    const response = await fetch('http://localhost:8338/health');
    const data = await response.json();
    
    if (data.success && data.status === 'healthy') {
      console.log('✅ API is healthy');
    }
  } catch (error) {
    console.error('❌ API is down:', error);
  }
}

// Usage
getTankData('TANK_B08_01_temp');
checkHealth();
```

---

### **JavaScript (Axios)**

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:8338';

// Get tank data
async function getTankData(tankId) {
  try {
    const response = await axios.get(`${API_BASE}/data/${tankId}`);
    
    if (response.data.success) {
      const { unit_id, last_reading } = response.data.data;
      console.log(`Tank: ${unit_id}`);
      console.log(`Voltage: ${last_reading.voltage_V} V`);
      console.log(`Pressure: ${last_reading.pressure_MPa} MPa`);
      return response.data.data;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Tank not found');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Usage
getTankData('TANK_B08_01_temp');
```

---

### **React Component Example**

```jsx
import React, { useState, useEffect } from 'react';

function TankData({ tankId }) {
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTank = async () => {
      try {
        const response = await fetch(
          `http://localhost:8338/data/${tankId}`
        );
        const data = await response.json();
        
        if (data.success) {
          setTank(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch tank data');
      } finally {
        setLoading(false);
      }
    };

    fetchTank();
  }, [tankId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const { last_reading } = tank;

  return (
    <div>
      <h2>{tank.unit_id}</h2>
      <p>Voltage: {last_reading.voltage_V} V</p>
      <p>Pressure: {last_reading.pressure_MPa} MPa</p>
      <p>MAC: {last_reading.mac_address}</p>
      <p>Updated: {new Date(last_reading.timestamp).toLocaleString()}</p>
    </div>
  );
}

export default TankData;
```

---

### **cURL Examples**

```bash
# Get tank data
curl -X GET "http://localhost:8338/data/TANK_B08_01_temp" \
  -H "Content-Type: application/json"

# Pretty print JSON
curl -X GET "http://localhost:8338/data/TANK_B08_01_temp" | python -m json.tool

# Check health
curl -X GET "http://localhost:8338/health"
```

---

## Error Handling

**Always check `success` field:**

```javascript
fetch('http://localhost:8338/data/TANK_ID')
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Process data.data
    } else {
      // Handle error: data.error
      console.error('API Error:', data.error);
    }
  });
```

---

## Common Tank IDs

Available tanks in the database:
- `TANK_B08_01_temp`
- `TANK_B09_01_temp`
- `TANK_B01_01_temp`
- `TANK_B01_01`
- And more...

---

## Testing

**Start the API:**
```bash
cd "d:\Campus Connect\dashboardwater\api"
python run.py
```

**Test endpoints:**
```bash
curl http://localhost:8338/data/TANK_B08_01_temp
curl http://localhost:8338/health
```

---

## Notes

- API runs on port **8338**
- All timestamps are in **ISO 8601 format**
- Voltage is in **Volts (V)**
- Pressure is in **Megapascals (MPa)**
- Add CORS headers if frontend runs on different domain
