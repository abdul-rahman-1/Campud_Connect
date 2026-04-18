# Water Tank Monitoring System GUI

A local desktop-style web GUI built with React, Vite, Tailwind CSS, and Express.js to manage and monitor the Python-based water tank monitoring service.

## Features
- **Dashboard:** Real-time metrics on connected ESP32 devices and critical alerts.
- **Config Manager:** Add, edit, or delete devices in `esp32_config.json`.
- **Live Logs:** View real-time output from the Python monitoring service, with search and filtering.
- **Alerts Panel:** Review and trace system alerts directly from MongoDB.
- **Service Control:** Start and stop the background `monitor_service.py` programmatically.

## Prerequisites
- **Python 3.8+** (with `pip` in your PATH)
- **Node.js 18+** (with `npm` in your PATH)

## Setup & Launch
1. Ensure `monitor_service.py` and `esp32_config.json` are in the main backend folder.
2. Double-click the **`start.bat`** file.
3. The launcher script will automatically:
   - Install required Python dependencies (`requests`, `pymongo`).
   - Install required Node.js dependencies for the backend and frontend.
   - Start the backend server on port `3001`.
   - Start the frontend server on port `5173`.
   - Open your default web browser to the GUI at `http://localhost:5173/`.

### Manual Start (Alternative)
If you prefer not to use the `.bat` file:

**Terminal 1 (Backend)**
```sh
cd gui-backend
npm install
node server.js
```

**Terminal 2 (Frontend)**
```sh
cd gui-frontend
npm install
npm run dev
```

## System Architecture
- **gui-backend/**: Express.js server that spawns `monitor_service.py` as a child process. It streams the `logs/water_monitor.log` file over WebSockets and connects to MongoDB to fetch live data.
- **gui-frontend/**: React + Vite application using Tailwind CSS for UI components and GSAP for animations.

## Contact
Developed by **Abdul Rahman**
- GitHub: [abdul-rahman-1](https://github.com/abdul-rahman-1)
- Email: [abdalrahmankhankhan@gmail.com](mailto:abdalrahmankhankhan@gmail.com)
