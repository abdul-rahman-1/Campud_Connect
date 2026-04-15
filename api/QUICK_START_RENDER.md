# Quick Render Deployment Guide

Deploy Water Monitoring API to Render in 5 minutes.

---

## What is Render?

Render is a cloud platform (like Heroku) that automatically deploys your code from GitHub. Perfect for production API hosting.

---

## 5-Minute Quick Start

### 1. Prepare Your Code

```bash
cd dashboardwater/backend
git init
git add .
git commit -m "Water Monitoring API"
git remote add origin https://github.com/your-username/repo.git
git push -u origin main
```

### 2. Create Render Account

- Go to https://render.com
- Sign up with GitHub
- Authorize access to your repository

### 3. Deploy Service

1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - Name: `water-monitoring-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r api/requirements.txt`
   - Start Command: `cd api && gunicorn -w 4 -b 0.0.0.0:$PORT "api:create_app()"`

### 4. Add Environment Variables

In Service Environment Settings, add:

```
FLASK_ENV = production
MONGO_URI = mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME = water_monitoring
LOG_LEVEL = INFO
```

### 5. Deploy

- Click "Create Web Service"
- Wait for build (2-3 minutes)
- Get your URL: `https://water-monitoring-api.onrender.com`

---

## Test Your API

```bash
# Replace URL with your Render service URL
curl https://water-monitoring-api.onrender.com/health
curl https://water-monitoring-api.onrender.com/overall
```

---

## MongoDB Setup

### Get MongoDB URI

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Database → Connect
3. Select "Drivers"
4. Copy connection string
5. Replace placeholders:
   - `<username>` - Your db user
   - `<password>` - Your db password
   - `<cluster>` - Already in URL

Example:
```
mongodb+srv://admin:mypass123@cluster0.abc.mongodb.net/
```

### Whitelist Render's IP

Option A (Easier):
- MongoDB Atlas → Network Access
- Add IP Address: `0.0.0.0/0`

Option B (Recommended - Static IP):
1. Render Dashboard → Service Settings
2. Static IPs → Add Static IP
3. Copy the IP address
4. MongoDB Atlas → Network Access → Add this IP

---

## Auto-Deploy on Push

Every push to `main` automatically:
- Builds your code
- Deploys new version
- Zero downtime

```bash
# Just push and it deploys!
git push origin main
```

---

## View Logs

Render Dashboard → Select Service → Logs Tab

See real-time output and errors.

---

## Make Changes

1. Edit code locally
2. Test locally: `python api/run.py`
3. Push to GitHub: `git push origin main`
4. Render auto-deploys (1-2 minutes)

---

## Useful Commands

```bash
# Test API locally before pushing
cd api
python run.py

# Check status
curl https://your-api-url.onrender.com/health

# View all endpoints
curl https://your-api-url.onrender.com/overall
```

---

## Pricing

- **Render Web Service:** $7-12/month (Standard)
- **MongoDB Atlas:** Free tier (512MB) or $57+/month
- **Total:** Starting ~$60/month for production setup

---

## Full Documentation

For detailed information, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| Service won't start | Check logs, verify MONGO_URI is correct |
| MongoDB connection fails | Whitelist Render's IP in MongoDB Atlas |
| Timeout errors | Check logs, increase gunicorn timeout |
| 404 errors | Verify route syntax: `/overall`, `/data/<id>` |

---

## Support

- Render Support: https://render.com/support
- MongoDB Support: https://cloud.mongodb.com
- API Documentation: See [README.md](./README.md)
