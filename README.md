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

### Backend (FastAPI)
- **FastAPI** with WebSocket support
- **Prometheus metrics** for monitoring
- **Rule-based alert system**
- **Telemetry simulation** for demo purposes
- **REST API** for configuration and health checks

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Zustand** for state management
- **Three.js** for 3D visualization
- **Recharts** for data visualization
- **Vite** for fast development and building

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -e .
```

3. Run the backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

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