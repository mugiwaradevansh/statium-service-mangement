<div align="center">

<br/>

```
 █████╗  ██████╗ ██╗         ███████╗ █████╗ ███╗   ██╗
██╔══██╗██╔════╝ ██║         ██╔════╝██╔══██╗████╗  ██║
███████║██║  ███╗██║         █████╗  ███████║██╔██╗ ██║
██╔══██║██║   ██║██║         ██╔══╝  ██╔══██║██║╚██╗██║
██║  ██║╚██████╔╝███████╗    ██║     ██║  ██║██║ ╚████║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝
```

### **AGL Premier League — Fan Experience Platform**
*A real-time, full-stack stadium operations system built for Google Cloud's Premier League showcase.*

<br/>

![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-Run_Ready-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## 🏟️ What Is This?

**AGL Fan** is a **real-time, dual-view stadium management platform** that seamlessly connects fans on the ground with operations teams in the control room — all through a single, WebSocket-powered application.

Built for the **Google Cloud Premier League event**, this project demonstrates how **modern full-stack engineering** can solve real-world sports venue challenges: crowd control, live match tracking, and queue management — all happening **simultaneously, in real time**.

> Think of it as a live stadium brain — one server, two interfaces, zero delay.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🏏 **Live Match Ticker** | Real-time IPL/T20 scores via CricketData.org API with smart caching |
| 🗺️ **Venue Heat Map** | Zone-by-zone crowd density visualization (North/South/East/West) |
| 🎟️ **Smart Queue System** | Join, track, and get called from stadium queues — with ticket IDs |
| ⚡ **Ops Dashboard** | Full operations control panel with surge simulation and incident log |
| 🔔 **Live Toast Alerts** | Real-time push notifications when your queue ticket is ready |
| 🔁 **Persistent Sessions** | `sessionStorage`-backed user IDs survive page refreshes |
| 📦 **Docker + Cloud Run** | Multi-stage Dockerfile, ready for production deployment on GCP |
| 🛡️ **Smart API Caching** | 2-minute live cache, 6-hour fallback cache to respect API limits |

---

## 🧱 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Clients                       │
│                                                          │
│   ┌──────────────────┐     ┌──────────────────────┐     │
│   │   Fan View        │     │   Ops Dashboard       │     │
│   │  /?role=fan       │     │   /?role=ops          │     │
│   │                   │     │                       │     │
│   │ • Match Ticker    │     │ • Zone Controls       │     │
│   │ • Zone Heatmap    │     │ • Queue Manager       │     │
│   │ • Queue Panel     │     │ • Incident Log        │     │
│   │ • Routing Banner  │     │ • Surge Simulator     │     │
│   └────────┬─────────┘     └──────────┬────────────┘     │
│            │   Socket.IO (WebSockets) │                  │
└────────────┼─────────────────────────┼──────────────────┘
             │                         │
             ▼                         ▼
┌─────────────────────────────────────────────────────────┐
│              Express + Socket.IO Server                  │
│                                                          │
│  ├── /api/matches   — Live cricket data (REST)           │
│  ├── /api/health    — Health check endpoint              │
│  ├── density_update — Zone crowd % broadcast             │
│  ├── queue_update   — Live queue state broadcast         │
│  ├── ticket_ready   — Direct fan notification            │
│  └── incident       — Ops log push event                 │
│                                                          │
│  External: CricketData.org API → 2min/6h cache layer     │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
agl-app/
├── 📄 Dockerfile                  # Multi-stage build (builder → production)
├── 📄 .env.example                # Environment variable template
├── 📄 package.json                # Root scripts (concurrently dev/server)
│
├── 📁 client/                     # React + Vite frontend
│   └── src/
│       ├── App.jsx                # Root — role-based routing (fan | ops)
│       ├── socket.js              # Singleton Socket.IO client
│       ├── components/
│       │   ├── FanApp.jsx         # Fan experience shell
│       │   ├── OpsDashboard.jsx   # Operations control shell
│       │   ├── MatchTicker.jsx    # Live cricket score strip
│       │   ├── VenueHeatmap.jsx   # Zone density visualizer
│       │   ├── QueuePanel.jsx     # Fan queue join/leave UI
│       │   ├── QueueManager.jsx   # Ops queue control panel
│       │   ├── ZoneControls.jsx   # Ops crowd density sliders
│       │   ├── RoutingBanner.jsx  # Fan routing alerts
│       │   └── IncidentLog.jsx    # Ops real-time event log
│
└── 📁 server/
    └── server.js                  # Express + Socket.IO + Cricket API
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **npm** v9+
- (Optional) A free [CricketData.org API key](https://cricketdata.org/member.aspx) for live scores

### 1. Clone & Install

```bash
git clone https://github.com/mugiwaradevansh/statium-service-mangement.git
cd statium-service-mangement/agl-app

# Install all dependencies (root + client + server) in one shot
npm run install:all
```

### 2. Configure Environment

```bash
# Inside agl-app/server/ — create your .env
cp ../.env.example server/.env
```

Edit `server/.env`:
```env
CRICKET_API_KEY=your_api_key_here   # Free at cricketdata.org
PORT=3001
```

### 3. Run in Development

```bash
npm run dev
```

This spins up **both** the Express/Socket.IO server and the Vite dev server concurrently with color-coded terminal output.

| Interface | URL |
|---|---|
| 🎟️ Fan View | `http://localhost:5173/?role=fan` |
| ⚙️ Ops Dashboard | `http://localhost:5173/?role=ops` |

---

## 🐳 Docker & Cloud Run Deployment

The app ships with a **production-grade multi-stage Dockerfile**:

- **Stage 1 (Builder):** Compiles the React/Vite frontend into static assets
- **Stage 2 (Production):** Minimal Node.js image, serves the compiled frontend + Socket.IO server

```bash
# Build the image
docker build -t agl-fan-app .

# Run locally
docker run -p 8080:8080 -e CRICKET_API_KEY=your_key agl-fan-app
```

### Deploy to Google Cloud Run

```bash
# Authenticate & configure
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and push via Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/agl-fan-app

# Deploy to Cloud Run
gcloud run deploy agl-fan-app \
  --image gcr.io/YOUR_PROJECT_ID/agl-fan-app \
  --platform managed \
  --region us-central1 \
  --set-env-vars CRICKET_API_KEY=your_key \
  --allow-unauthenticated
```

> Cloud Run automatically injects `PORT=8080` — no configuration needed.

---

## ⚡ Real-Time Event Reference

### Socket.IO Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Server → All | `density_update` | `{ zones }` | Crowd % for all 4 zones |
| Server → All | `queue_update` | `{ queues }` | Live queue state broadcast |
| Server → All | `match_update` | `{ ...matchData }` | IPL score + events |
| Server → All | `incident` | `{ timestamp, message }` | Ops log push |
| Server → Fan | `ticket_assigned` | `{ ticketNumber, queueName }` | Queue ticket confirmation |
| Server → Fan | `ticket_ready` | `{ station, queueName }` | Called to the counter |
| Fan → Server | `join_queue` | `{ queueId, userId }` | Fan joins a queue |
| Fan → Server | `leave_queue` | `{ queueId, userId }` | Fan exits a queue |
| Ops → Server | `update_density` | `{ zone, value }` | Manual zone density update |
| Ops → Server | `call_next` | `{ queueId }` | Call next person in queue |
| Ops → Server | `toggle_queue` | `{ queueId, status }` | Pause/resume a queue |
| Ops → Server | `simulate_surge` | — | Trigger 10s crowd surge test |

---

## 🧠 Engineering Highlights

### Smart Cricket API Cache
```
Live match  → 2-minute cache   (fresh data without hammering the API)
API limit   → 6-hour cache     (graceful degradation, stale data > no data)
No API key  → Fallback mode    (demo data, zero crashes)
```

### Role-Based Dual Interface
The same React app renders two completely different UIs based on a URL query param:
```
/?role=fan  →  FanApp (Queue + Heatmap + Match Ticker)
/?role=ops  →  OpsDashboard (Zone Controls + Queue Manager + Incident Log)
```
Zero routing libraries. Zero page reloads. Pure conditional rendering.

### Persistent Fan Identity
Each fan gets a stable session ID (`fan_xxxxx`) stored in `sessionStorage`. This survives page refreshes and allows the server to restore queue ticket state across reconnections.

### High-Density Zone Alerts
When ops update a zone past 75% occupancy, the server **automatically** fires an incident log entry — no client-side logic required.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server uptime + API key status |
| `GET` | `/api/matches` | Current match data (cached) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Backend** | Node.js 20, Express.js |
| **Real-time** | Socket.IO 4.x (WebSockets) |
| **Live Data** | CricketData.org REST API |
| **Container** | Docker (multi-stage build) |
| **Cloud** | Google Cloud Run |
| **Dev Tooling** | Concurrently, ESLint, Vite HMR |

---

## 👨‍💻 About the Builder

Built with ❤️ by **Devansh** as part of the **Google Cloud Premier League event**.

This project was engineered solo — from WebSocket architecture to Cloud Run deployment — as a demonstration of building real-world, production-grade systems under event conditions.

> *"Real-time isn't a feature. It's a foundation."*

---

<div align="center">

**AGL Fan Experience** — Built for the pitch. Powered by the cloud.

![Made with Node.js](https://img.shields.io/badge/Made_with-Node.js-339933?style=flat-square&logo=nodedotjs)
![Powered by Socket.IO](https://img.shields.io/badge/Powered_by-Socket.IO-010101?style=flat-square&logo=socketdotio)
![Deployed on GCP](https://img.shields.io/badge/Deployed_on-Google_Cloud-4285F4?style=flat-square&logo=googlecloud)

</div>
