# Water Monitoring API

RESTful API for water tank monitoring system. Provides endpoints to fetch tank data, water levels, and alert information.

## Features

✓ Real-time tank data aggregation  
✓ Individual tank data retrieval  
✓ Alert information  
✓ Health check endpoint  
✓ CORS enabled for frontend integration  
✓ MongoDB integration  
✓ Environment-based configuration  

## Project Structure

```
api/
├── __init__.py          # Flask app factory
├── config.py            # Configuration management
├── routes.py            # API endpoints
├── run.py              # Entry point
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## Installation

### Prerequisites

- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

### Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```
MONGO_URI=your_mongodb_connection_string
DB_NAME=water_monitoring
API_PORT=8338
FLASK_ENV=development
```

## Running the API

### Local Development

```bash
python run.py
```

The API will start on `http://localhost:8338`

### Production Deployment

1. Set environment to production:
```bash
export FLASK_ENV=production
```

2. Run with production WSGI server (gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8338 "api:create_app()"
```

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=8338

EXPOSE 8338

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8338", "api:create_app()"]
```

Build and run:
```bash
docker build -t water-api .
docker run -p 8338:8338 --env-file .env water-api
```

## API Endpoints

### 1. Get Overall Tank Status
```
GET /overall
```

Returns all tanks with their fill percentages and active alert count.

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-03-24T12:45:00.000000",
  "data": {
    "tank01": "79%",
    "tank02": "48%",
    "tank03": "92%",
    ...
    "alert_no": "02"
  }
}
```

### 2. Get Specific Tank Data
```
GET /data/<tank_id>
```

Returns full tank document with all sensor readings and metadata.

**Example:**
```
GET /data/TANK_B01_01
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-03-24T12:45:00.000000",
  "data": {
    "_id": "69c2393f2309b4c5b944442a",
    "unit_id": "TANK_B01_01",
    "status": "active",
    "building": "Building_A",
    "location": "Roof_Tank_1",
    "diameter_m": 1.829,
    "height_m": 1.829,
    "capacity_liters": 5000,
    "last_reading": {
      "timestamp": "2026-03-24T07:15:12.949Z",
      "voltage_V": 0.509,
      "pressure_MPa": 0,
      "height_m": 0,
      "volume_liters": 0,
      "level_percentage": 0,
      "mac_address": "F4:65:0B:48:E1:D8",
      "http_status": "success"
    },
    "updated_at": "2026-03-24T07:15:12.949Z"
  }
}
```

### 3. Health Check
```
GET /health
```

Check API and MongoDB connectivity.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | MongoDB Atlas URI | MongoDB connection string |
| `DB_NAME` | `water_monitoring` | Database name |
| `TANKS_COLLECTION` | `tanks` | Tanks collection name |
| `TEMP_COLLECTION` | `temp` | Temp collection name |
| `ALERTS_COLLECTION` | `alerts` | Alerts collection name |
| `FLASK_ENV` | `development` | Flask environment |
| `API_HOST` | `0.0.0.0` | API host address |
| `API_PORT` | `8338` | API port |
| `DEBUG` | `False` | Debug mode |
| `LOG_LEVEL` | `INFO` | Logging level |

## Logging

Logs are written to `logs/api.log` and console.

View logs:
```bash
tail -f logs/api.log
```

## Error Handling

All errors return consistent JSON responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `404` - Tank not found
- `500` - Server error

## Testing

Test the API with curl:

```bash
# Get overall status
curl http://localhost:8338/overall

# Get specific tank (replace TANK_B01_01 with actual tank ID)
curl http://localhost:8338/data/TANK_B01_01

# Health check
curl http://localhost:8338/health
```

Or use a tool like Postman or Insomnia for easier testing.

## Integration with Frontend

### React Example
```javascript
// Fetch overall data
fetch('http://localhost:8338/overall')
  .then(res => res.json())
  .then(data => console.log(data.data))

// Fetch specific tank
fetch('http://localhost:8338/data/TANK_B01_01')
  .then(res => res.json())
  .then(data => console.log(data.data))
```

## Performance Considerations

- API queries MongoDB directly without caching
- For high-traffic scenarios, consider adding:
  - Response caching (Redis)
  - Database connection pooling
  - Rate limiting
  - Load balancing (multiple API instances)

## Security Notes

⚠️ In production:
- Use strong MongoDB credentials
- Enable SSL/TLS for MongoDB connections
- Use HTTPS for API endpoints
- Implement authentication/authorization
- Add request validation
- Use security headers
- Enable CORS only for trusted domains

## Troubleshooting

### MongoDB Connection Failed
- Check `MONGO_URI` in `.env`
- Verify MongoDB is running
- Check firewall/network connectivity
- Ensure IP whitelist on MongoDB Atlas

### Port Already in Use
Change `API_PORT` in `.env` or:
```bash
lsof -i :8338  # Find process
kill -9 <PID>
```

### Import Errors
Reinstall dependencies:
```bash
pip install -r requirements.txt --force-reinstall
```

## License

Internal project - Water Monitoring System

## Support

For issues or questions, contact the development team.
