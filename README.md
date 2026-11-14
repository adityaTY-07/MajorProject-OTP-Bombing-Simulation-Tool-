# OTP Security Sandbox & Simulation Tool

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-Render-10b981?style=for-the-badge&logo=render&logoColor=white)](https://majorproject-otp-bombing-simulation-tool-2trl.onrender.com/)

> 🌐 **Live Demo:** [https://majorproject-otp-bombing-simulation-tool-2trl.onrender.com/](https://majorproject-otp-bombing-simulation-tool-2trl.onrender.com/)

A modern educational security benchmarking and simulation sandbox. The tool demonstrates SMS/OTP high-frequency request bursts, token-bucket rate limiting, exponential backoff, and defensive controls with real-time WebSocket telemetry and analytics. No real external OTPs or SMS messages are sent.

---

## Features

- **Interactive Simulation Sandbox:** Test manual simulated OTP calls or generate controlled synthetic bursts.
- **Defensive Security Controls:** Live toggleable token-bucket rate limiting, exponential backoff penalties, and autonomous IP blacklisting.
- **Real-Time Telemetry:** Instant WebSocket stream displaying accepted vs limited request volumes, latency graphs, and system resource metrics.
- **Modern React & Vite Architecture:** High-tech cybersecurity HUD dark theme with responsive layouts and component architecture.

---

## Tech Stack

- **Frontend:** React 18, Vite, Custom Cyber Dark Theme CSS, WebSockets API
- **Backend:** Node.js, Express, Helmet, CORS, `ws` (WebSocket Server), In-memory Token Bucket State Engine
- **Deployment:** Render Web Service (Node.js runtime with reverse proxy trust)

---

## Getting Started Locally

### Requirements
- Node.js 20 or newer
- npm

### 1. Install & Build Frontend
```sh
cd frontend
npm install
npm run build
cd ..
```

### 2. Install & Start Backend
```sh
cd backend
npm install
npm start
```

Open **`http://127.0.0.1:8080`** in your browser to interact with the dashboard.

---

## Defensive Behaviors

- **Token Bucket Algorithm:** 5 tokens burst capacity per client, smoothly refilled at 5 tokens per minute.
- **Exponential Backoff:** Progressively multiplies Retry-After delay windows for repeated burst triggers.
- **Autonomous IP Blacklisting:** Temporarily denies clients that exceed sustained denial thresholds.
- **Safe Local Isolation:** All traffic is simulated in-memory; no third-party SMS providers, carrier charges, or external network requests are made.

---

## API Endpoints

- `GET /healthz` — Service health status
- `GET /api/config` — Current defensive security settings
- `PUT /api/config` — Update active defensive rules
- `POST /api/request-otp` — Evaluate a mock request (`{"recipient":"+1-555-0199"}`)
- `POST /api/demo/start` — Start synthetic local burst stream
- `POST /api/demo/stop` — Stop synthetic stream
- `GET /api/demo/status` — Status of synthetic demo
- `WS /ws` — Real-time telemetry snapshot and event stream
