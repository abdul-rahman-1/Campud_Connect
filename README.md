<div align="center">
  <img src="dashboardwater/client/public/fav.png" width="100" alt="HydroPulse TankWatch Logo" />
  <h1>🚀 HydroPulse // TankWatch v2.0</h1>
  <p><strong>Mission-Critical IoT Water Telemetry System</strong></p>
  
  [![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=for-the-badge&logo=python)](https://www.python.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38b2ac?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Animations-Framer_Motion-ff0055?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
</div>

---

## ⚡ Tactical Overview

**HydroPulse // TankWatch** is a next-generation industrial monitoring system designed for the Integral University campus. It manages a fleet of 16+ distributed IoT nodes, providing millisecond-precise telemetry via a tactical mission-control interface.

```bash
tankwatch@integral-university:~$ connect --all-tanks
Initializing HydroPulse TelemetryCore v2.0...
Scanning campus network nodes...
[OK]  TANK_01  |  Level: 87.3%  |  243.8 L  |  STATUS: NOMINAL
[OK]  TANK_02  |  Level: 61.9%  |  173.3 L  |  STATUS: NOMINAL
[OK]  TANK_03  |  Level: 45.1%  |  126.3 L  |  STATUS: LOW
[16/16] nodes online. Fleet uptime: 99.9%
All systems operational. Ready for telemetry.
```

---

## 💎 The Tactical Interface (UI)

The frontend is built with a **Terminal-Core Aesthetic**, prioritizing data density and high-contrast visualization.

### 🎨 Design Tokens
- **Aesthetic**: Deep Space Glassmorphism with glowing neon accents.
- **Typography**: `Space Mono` for data readouts, `Space Grotesk` for high-impact headlines.
- **Visuals**:
  - **Animated Water Visualization**: Real-time fluid dynamics using Framer Motion.
  - **Tactical Data Tickers**: Live system status pulses and millisecond latency tracking.
  - **Mission Control Charts**: High-fidelity 24-hour trends via Recharts.
  - **Glass Panels**: Multi-layered backdrop blurs with #00d4ff (Neon Cyan) glowing borders.

---

## 🏗️ Full-Stack Architecture

A robust five-layer stack ensures 24/7 reliability and scalability:

1.  **🔌 Hardware Layer**: ESP32 microcontrollers with I2C pressure sensors (0.5-4.5V) and ADS1115 ADC converters.
2.  **📦 Collection Layer**: Python-based Monitor Service performing H/V/P calculations every 30 seconds.
3.  **🗄️ Database Layer**: MongoDB Atlas cluster managing `tanks`, `alerts`, and `history` collections.
4.  **🚀 API Layer**: Flask REST Server providing 10+ endpoints for real-time and historical data access.
5.  **🌐 Presentation Layer**: React 19 + TypeScript dashboard with tactical animations and responsive layouts.

---

## 📊 Core Capabilities

- **16+ Distributed Nodes**: Centralized management for the entire campus network.
- **Real-Time Telemetry**: Millisecond-precise updates for Pressure (MPa), Height (m), and Volume (L).
- **Predictive Alerts**: Smart threshold monitoring (Critical < 5%, Warning < 20%) with pulse-red UI notifications.
- **Historical Analysis**: 24-hour historical sparklines and interactive charts for usage pattern tracking.
- **Tactical Console**: Integrated terminal simulator for system diagnostics.

---

## 🛠️ Quick Start

### 1. Backend Monitor (Data Ingestion)
```bash
cd dashboardwater/backend
pip install -r requirements.txt
python monitor_service.py
```

### 2. API Server (Data Access)
```bash
cd dashboardwater/api
pip install -r requirements.txt
python run.py
```

### 3. Frontend Dashboard (UI)
```bash
cd dashboardwater/client
npm install
npm run dev
```

---

## 👤 Developer

**Abdul Rahman**  
*Lead Systems Architect | Integral University*

---
<div align="center">
  <p>HydroPulse // TankWatch — v2.0.0 — 2026</p>
  <img src="dashboardwater/client/public/vite.svg" width="20" />
</div>
