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
