# Water Monitoring API - Render Deployment Guide

Complete guide for deploying the Water Monitoring API to Render.

---

## Render Deployment

Render is a modern cloud platform that makes deployment simple. The API will be deployed as a web service.

### Prerequisites

1. GitHub account with your code repository
2. Render account (https://render.com)
3. MongoDB Atlas account for database

---

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
```bash
cd dashboardwater/backend
git init
git add .
git commit -m "Initial commit - Water Monitoring API"
```

2. **Create `.gitignore`:**
```bash
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
ENV/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Cache
.cache/
.pytest_cache/
```

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/your-username/dashboardwater.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create Web Service on Render

1. **Dashboard → New:**
   - Click "New +" in top right
   - Select "Web Service"

2. **Connect Repository:**
   - Click "Connect a repository"
   - Select your dashboardwater repository
   - Choose branch: `main`

3. **Configure Service:**
   - **Name:** `water-monitoring-api`
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r api/requirements.txt`
   - **Start Command:** `cd api && gunicorn -w 4 -b 0.0.0.0:$PORT "api:create_app()"`

4. **Environment Variables:**
   Add these in the Render dashboard:
   
   ```
   FLASK_ENV = production
   MONGO_URI = mongodb+srv://user:password@cluster.mongodb.net/
   DB_NAME = water_monitoring
   LOG_LEVEL = INFO
   ```

   **For MONGO_URI:**
   - Get from MongoDB Atlas connection string
   - Keep `sync: false` so it's not exposed in yaml

5. **Plan:**
   - Select "Standard" or higher (Free tier may timeout)

6. **Click "Create Web Service"**

Render will automatically:
- Build the application
- Deploy it
- Start the service
- Assign a public URL

### Step 4: Verify Deployment

Once deployed, you'll get a URL like: `https://water-monitoring-api.onrender.com`

**Test the API:**

```bash
# Overall endpoint
curl https://water-monitoring-api.onrender.com/overall

# Specific tank
curl https://water-monitoring-api.onrender.com/data/TANK_B01_01

# Health check
curl https://water-monitoring-api.onrender.com/health
```

---

## Automatic Deployments

### Push-to-Deploy

With the `render.yaml` file:

1. Every push to `main` triggers automatic deployment
2. Render builds and deploys automatically
3. Zero-downtime deployments

### Manual Redeploy

In Render dashboard:
- Service → Manual Redeploy → Latest Commit

---

## Monitoring & Logs

### View Logs

In Render Dashboard:
- Select your service
- Click "Logs" tab
- View real-time logs

### Monitor Performance

- **Metrics:** CPU, Memory, Network usage
- **Status:** Service health indicator
- **Alerts:** Configure email notifications

---

## Environment Variables

### Required Variables

```
MONGO_URI          - MongoDB Atlas connection string (keep secure!)
FLASK_ENV          - Set to "production"
DB_NAME            - "water_monitoring"
```

### Optional Variables

```
LOG_LEVEL          - DEBUG, INFO, WARNING, ERROR (default: INFO)
API_HOST           - Usually set by Render ($PORT)
```

### How to Set

1. Service Settings → Environment
2. Add each variable
3. Save changes
4. Service auto-redeploys

---

## MongoDB Atlas Configuration

### Allow Render's IP

Render uses dynamic IPs. Allow all IPs:

1. MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0`
3. Or use **Render's Static IP:**
   - Go to Render Service Settings
   - Static IPs → Add Static IP
   - Whitelist that IP in MongoDB Atlas

### Get Connection String

1. MongoDB Cluster → Connect
2. Select "Drivers"
3. Copy connection string
4. Replace `<username>` and `<password>`
5. Paste into Render Environment Variables

---

## Troubleshooting

### Service Won't Start

**Check logs:**
```
Render Dashboard → Logs
```

**Common issues:**
- Missing environment variables
- MongoDB connection string invalid
- Port binding error

### Health Check Failing

**Solution:**
- Ensure `/health` endpoint works locally
- Check MongoDB connection
- Review logs for errors

### High Memory Usage

**Reduce workers in start command:**
```
cd api && gunicorn -w 2 -b 0.0.0.0:$PORT "api:create_app()"
```

### Timeout Errors

**Increase timeout:**
```
cd api && gunicorn -w 4 --timeout 120 -b 0.0.0.0:$PORT "api:create_app()"
```

---

## Custom Domain

### Add Custom Domain

1. Service Settings → Custom Domain
2. Enter your domain (e.g., `api.example.com`)
3. Follow DNS instructions
4. SSL certificate auto-provisioned (free)

---

## Scale the Service

### Upgrade Plan

1. Service Settings → Plan
2. Select higher tier:
   - Starter: 0.5 GB RAM
   - Standard: 2 GB RAM
   - Pro: 4 GB RAM+

### Horizontal Scaling

Render handles scaling automatically for Standard+ plans.

---

## Database Backups

### Backup MongoDB

1. MongoDB Atlas → Backup
2. Create on-demand backup
3. View backup history

### Restore from Backup

1. MongoDB Atlas → Backup
2. Select backup
3. Follow restore instructions

---

## Security

### Environment Variables

- Never commit `.env` to git
- Always use Render's environment variables for secrets
- Use strong MongoDB credentials
- Regenerate credentials if compromised

### HTTPS

- Automatic SSL certificate (https://water-monitoring-api.onrender.com)
- HTTP redirects to HTTPS automatically

### API Security

Add to `routes.py` for additional security:

```python
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

---

## Performance Optimization

### Database Indexing

MongoDB already has indexes. To verify:

```python
db['tanks'].create_index('unit_id')
db['alerts'].create_index([('unit_id', 1), ('timestamp', -1)])
```

### Response Caching

Add Redis caching for repeated requests:

```bash
pip install redis
```

---

## Cost Estimation

**Render Pricing (as of 2026):**
- Web Service: $7-12/month (Standard)
- Static site: Free tier available
- Database: External (MongoDB Atlas)

**MongoDB Atlas:**
- Free tier: 512MB (demo only)
- $57/month basic cluster

---

## Auto-Redeploy on Code Push

Already configured with `render.yaml`:

1. Push to main branch
2. Render detects change
3. Auto-builds and deploys
4. Zero downtime

---

## Contact Support

**Render Support:**
- https://render.com/support
- Email: support@render.com

**For API Issues:**
- Check logs in Render dashboard
- Verify MongoDB connection
- Test endpoints locally first

---

## Next Steps

1. ✅ Prepare repository
2. ✅ Deploy to Render
3. ✅ Test endpoints
4. ✅ Add custom domain
5. ✅ Monitor performance
6. ✅ Set up alerts

---

## Quick Links

- Render Dashboard: https://dashboard.render.com
- Service Logs: Dashboard → Service → Logs
- Environment Variables: Dashboard → Service → Settings
- MongoDB Atlas: https://cloud.mongodb.com
