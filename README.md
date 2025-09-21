# Optimus Telemetry & Pose Dashboard

A real-time dashboard for visualizing robot telemetry data, pose information, and system alerts using WebSocket communication and 3D visualization.

## Features

- **Real-time 3D Pose Visualization**: Three.js-based 3D robot model with live pose updates
- **Telemetry Charts**: Live charts for battery level, temperature, and joint currents
- **Alert System**: Rule-based alerts with acknowledgment and history
- **WebSocket Streaming**: Real-time data streaming at 10Hz
- **Metrics Endpoint**: Prometheus-compatible metrics for monitoring
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### System Overview
```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Frontend      │◄─────────────────┤   Backend       │
│   (React)       │                  │   (FastAPI)     │
│                 │                  │                 │
│ • 3D Visualization│                │ • Telemetry Sim │
│ • Real-time Charts│                │ • Alert Engine  │
│ • Alert Panel   │                  │ • WebSocket API │
│ • Status Bar    │                  │ • REST API      │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   Browser       │                  │   Prometheus    │
│   (Three.js)    │                  │   Metrics       │
└─────────────────┘                  └─────────────────┘
```

### Backend Architecture (FastAPI)
- **FastAPI** with WebSocket support for real-time communication
- **Prometheus metrics** for monitoring and observability
- **Rule-based alert system** with configurable thresholds
- **Telemetry simulation** generating realistic robot data at 10Hz
- **REST API** for configuration, health checks, and data retrieval
- **In-memory ring buffer** for telemetry history (last 300 seconds)
- **CORS middleware** for cross-origin requests

**Key Components:**
- `app/main.py` - Main FastAPI application with WebSocket and REST endpoints
- `app/metrics.py` - Prometheus metrics collection and export
- `app/rules.py` - Alert rule engine with evaluation logic

### Frontend Architecture (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Zustand** for lightweight state management
- **Three.js** for 3D robot visualization and pose rendering
- **Recharts** for real-time telemetry charts
- **Vite** for fast development and optimized builds
- **WebSocket client** for real-time data streaming
- **Responsive design** with CSS Grid and Flexbox

**Key Components:**
- `components/Pose3D.tsx` - 3D robot visualization with Three.js
- `components/Charts.tsx` - Real-time telemetry charts
- `components/Alerts.tsx` - Alert management and history
- `components/StatusBar.tsx` - Connection status and metrics
- `state/store.ts` - Zustand state management
- `api/ws.ts` - WebSocket connection management
- `api/rest.ts` - REST API client

### Data Flow
1. **Backend** generates simulated telemetry data every 100ms
2. **Alert Engine** evaluates rules against each data point
3. **WebSocket** streams data and alerts to connected clients
4. **Frontend** receives data and updates 3D model, charts, and alerts
5. **State Management** maintains telemetry history and alert state
6. **Metrics** are collected and exposed for monitoring

## Quick Start

### Prerequisites
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **npm** or **yarn** (package manager)
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd optimus-dashboard2
```

2. **Backend Setup:**
```bash
cd backend
pip install -e .
```

3. **Frontend Setup:**
```bash
cd ../frontend
npm install
```

### Running the Application

**Option 1: Development Mode (Recommended)**

1. **Start the backend server:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. **Start the frontend development server (in a new terminal):**
```bash
cd frontend
npm run dev
```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

**Option 2: Production Mode**

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Run the backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Verification

1. **Check backend health:**
```bash
curl http://localhost:8000/health
```

2. **Check metrics endpoint:**
```bash
curl http://localhost:8000/metrics
```

3. **Test WebSocket connection:**
```bash
# The frontend will automatically connect to the WebSocket
# You should see real-time telemetry data in the dashboard
```

### Troubleshooting

**Common Issues:**

1. **Port already in use:**
   - Backend: Change port with `--port 8001`
   - Frontend: Vite will automatically suggest an alternative port

2. **CORS errors:**
   - Ensure backend is running on `0.0.0.0:8000`
   - Check that frontend proxy is configured correctly in `vite.config.ts`

3. **WebSocket connection failed:**
   - Verify backend is running and accessible
   - Check browser console for connection errors
   - Ensure no firewall is blocking port 8000

## API Endpoints

### REST Endpoints
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /config/alert-rules` - Get alert rules
- `POST /config/alert-rules` - Update alert rules
- `GET /telemetry/history` - Get telemetry history

### WebSocket
- `WS /stream/telemetry` - Real-time telemetry stream

## Data Model

```json
{
  "robot_id": "optimus_sim_01",
  "ts": 1736800123.250,
  "pose": {
    "x": 0.2,
    "y": 0.0,
    "z": 0.95,
    "roll": 0.0,
    "pitch": 0.05,
    "yaw": 1.57
  },
  "battery_pct": 82.4,
  "temp_c": 41.2,
  "joints": {
    "shoulder_l": 2.1,
    "elbow_l": 1.4,
    "knee_l": 1.9,
    "shoulder_r": 2.0
  },
  "status": "OK"
}
```

## Alert Rules

Default alert rules:
- **Low Battery**: Battery < 20%
- **Overheat**: Temperature > 60°C
- **High Current**: Any joint current > 3.0A

## Development

### Backend Development
```bash
cd backend
pip install -e ".[dev]"
pytest  # Run tests
```

### Frontend Development
```bash
cd frontend
npm run lint    # Lint code
npm run build   # Build for production
npm run preview # Preview production build
```

## Docker Support

Build and run with Docker:

```bash
# Backend
cd backend
docker build -t optimus-backend .
docker run -p 8000:8000 optimus-backend

# Frontend
cd frontend
docker build -t optimus-frontend .
docker run -p 3000:3000 optimus-frontend
```

## Monitoring

The backend exposes Prometheus metrics at `/metrics`:
- HTTP request counts and latencies
- WebSocket message counts
- Alert trigger counts
- System health metrics

## License

MIT License
