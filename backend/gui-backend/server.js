const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, '..');
const CONFIG_FILE = path.join(ROOT_DIR, 'esp32_config.json');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'water_monitor.log');
const SERVICE_SCRIPT = path.join(ROOT_DIR, 'monitor_service.py');

let pythonProcess = null;

// Initialize MongoDB
let dbConnected = false;
let dbModels = {};

async function connectToDb(uri) {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        dbConnected = true;
        console.log('Connected to MongoDB');
        
        const tankSchema = new mongoose.Schema({}, { strict: false });
        const alertSchema = new mongoose.Schema({}, { strict: false });
        
        dbModels.Tank = mongoose.models.Tank || mongoose.model('Tank', tankSchema, 'tanks');
        dbModels.Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema, 'alerts');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        dbConnected = false;
    }
}

// Read hardcoded MongoDB URI from the python script to establish connection if .env is missing
const scriptContent = fs.readFileSync(SERVICE_SCRIPT, 'utf-8');
const mongoUriMatch = scriptContent.match(/MONGO_URI\s*=\s*"([^"]+)"/);
let defaultMongoUri = process.env.MONGO_URI;
if (!defaultMongoUri && mongoUriMatch) {
    defaultMongoUri = mongoUriMatch[1];
}
if (defaultMongoUri) {
    connectToDb(defaultMongoUri);
}

// API: Config Management
app.get('/api/config', (req, res) => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.json({ devices: [] });
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to read config file', details: e.message });
    }
});

app.post('/api/config', (req, res) => {
    try {
        const configData = req.body;
        // Basic validation
        if (!configData || !Array.isArray(configData.devices)) {
            return res.status(400).json({ error: 'Invalid config format' });
        }
        
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
        res.json({ success: true, message: 'Configuration saved' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save config file', details: e.message });
    }
});

// API: Service Control
app.get('/api/service/status', (req, res) => {
    res.json({ running: pythonProcess !== null, pid: pythonProcess ? pythonProcess.pid : null });
});

app.post('/api/service/start', (req, res) => {
    if (pythonProcess) {
        return res.json({ success: true, message: 'Service is already running', pid: pythonProcess.pid });
    }

    try {
        pythonProcess = spawn('python', [SERVICE_SCRIPT], { cwd: ROOT_DIR });
        
        pythonProcess.on('exit', (code) => {
            console.log(`Service exited with code ${code}`);
            pythonProcess = null;
        });

        pythonProcess.on('error', (err) => {
            console.error('Failed to start service:', err);
            pythonProcess = null;
        });

        res.json({ success: true, message: 'Service started', pid: pythonProcess.pid });
    } catch (e) {
        res.status(500).json({ error: 'Failed to start service', details: e.message });
    }
});

app.post('/api/service/stop', (req, res) => {
    if (!pythonProcess) {
        return res.json({ success: true, message: 'Service is not running' });
    }

    try {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
            pythonProcess = null;
            res.json({ success: true, message: 'Service stopped' });
        } else {
            pythonProcess.kill('SIGTERM');
            setTimeout(() => {
                if (pythonProcess) {
                    pythonProcess.kill('SIGKILL');
                }
                pythonProcess = null;
                res.json({ success: true, message: 'Service stopped' });
            }, 1000);
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to stop service', details: e.message });
    }
});

// API: Clear Logs
app.post('/api/logs/clear', (req, res) => {
    try {
        fs.writeFileSync(LOG_FILE, '');
        res.json({ success: true, message: 'Logs cleared' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to clear logs', details: e.message });
    }
});

// API: Settings Management
app.get('/api/settings', (req, res) => {
    try {
        const content = fs.readFileSync(SERVICE_SCRIPT, 'utf-8');
        const mongoUriMatch = content.match(/MONGO_URI\s*=\s*"([^"]+)"/);
        const intervalMatch = content.match(/FETCH_INTERVAL\s*=\s*([\d.]+)/);
        const thresholdMatch = content.match(/ALERT_THRESHOLD_LOW\s*=\s*(\d+)/);

        res.json({
            mongoUri: '', // Intentionally not sending credentials to frontend
            fetchInterval: intervalMatch ? parseFloat(intervalMatch[1]) : 0.02,
            alertThreshold: thresholdMatch ? parseInt(thresholdMatch[1]) : 20
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to read settings', details: e.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const { mongoUri, fetchInterval, alertThreshold } = req.body;
        let content = fs.readFileSync(SERVICE_SCRIPT, 'utf-8');
        
        if (mongoUri) content = content.replace(/MONGO_URI\s*=\s*"[^"]+"/, `MONGO_URI = "${mongoUri}"`);
        if (fetchInterval !== undefined) content = content.replace(/FETCH_INTERVAL\s*=\s*[\d.]+/, `FETCH_INTERVAL = ${fetchInterval}`);
        if (alertThreshold !== undefined) content = content.replace(/ALERT_THRESHOLD_LOW\s*=\s*\d+/, `ALERT_THRESHOLD_LOW = ${alertThreshold}`);
        
        fs.writeFileSync(SERVICE_SCRIPT, content);
        res.json({ success: true, message: 'Settings saved successfully. Restart the python service to apply.' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to save settings', details: e.message });
    }
});

// API: Shutdown System
app.post('/api/system/shutdown', (req, res) => {
    if (pythonProcess) {
        try {
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
            } else {
                pythonProcess.kill('SIGKILL');
            }
        } catch(e) {}
    }
    res.json({ success: true, message: 'Backend shutting down...' });
    setTimeout(() => {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/FI', 'WindowTitle eq Water Tank Monitor GUI*', '/T', '/F']);
        }
        process.exit(0);
    }, 1000);
});

// API: Dashboard Data (MongoDB)
app.get('/api/data/tanks', async (req, res) => {
    if (!dbConnected) return res.status(500).json({ error: 'Database not connected' });
    try {
        const tanks = await dbModels.Tank.find();
        res.json(tanks);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch tanks', details: e.message });
    }
});

app.get('/api/data/alerts', async (req, res) => {
    if (!dbConnected) return res.status(500).json({ error: 'Database not connected' });
    try {
        const limit = parseInt(req.query.limit) || 50;
        const alerts = await dbModels.Alert.find().sort({ timestamp: -1 }).limit(limit);
        res.json(alerts);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch alerts', details: e.message });
    }
});

// Create HTTP server
const server = app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});

// WebSocket for Log Streaming
const wss = new WebSocket.Server({ server });

let lastLogSize = 0;
if (fs.existsSync(LOG_FILE)) {
    lastLogSize = fs.statSync(LOG_FILE).size;
}

// Global log watcher (polls every 500ms for reliability across platforms)
setInterval(() => {
    if (!fs.existsSync(LOG_FILE)) return;
    
    try {
        const currentSize = fs.statSync(LOG_FILE).size;
        if (currentSize > lastLogSize) {
            const stream = fs.createReadStream(LOG_FILE, {
                start: lastLogSize,
                end: currentSize
            });
            
            let newLogs = '';
            stream.on('data', (chunk) => {
                newLogs += chunk.toString();
            });
            
            stream.on('end', () => {
                lastLogSize = currentSize;
                const newLines = newLogs.split('\n').filter(Boolean);
                if (newLines.length > 0) {
                    const message = JSON.stringify({ type: 'update', lines: newLines });
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(message);
                        }
                    });
                }
            });
        } else if (currentSize < lastLogSize) {
            lastLogSize = currentSize; // File was truncated/cleared
        }
    } catch (e) {
        console.error('Log read error:', e);
    }
}, 500);

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket for logs');
    
    // Send last 100 lines immediately
    if (fs.existsSync(LOG_FILE)) {
        try {
            const data = fs.readFileSync(LOG_FILE, 'utf-8');
            const lines = data.split('\n').filter(Boolean).slice(-100);
            ws.send(JSON.stringify({ type: 'init', lines }));
        } catch (e) {
            console.error('Initial log read error:', e);
        }
    }

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });
});