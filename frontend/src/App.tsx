import React, { useEffect } from 'react'
import { useTelemetryStore } from './state/store'
import { wsManager } from './api/ws'
import StatusBar from './components/StatusBar'
import Pose3D from './components/Pose3D'
import Charts from './components/Charts'
import Alerts from './components/Alerts'
import './App.css'

function App() {
  const { connectionStatus } = useTelemetryStore()

  useEffect(() => {
    // Connect to WebSocket when app starts
    wsManager.connect()
    
    // Cleanup on unmount
    return () => {
      wsManager.disconnect()
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Optimus Telemetry Dashboard</h1>
        <StatusBar />
      </header>
      
      <main className="app-main">
        <div className="dashboard-grid">
          <div className="dashboard-section pose-section">
            <h2>3D Pose Visualization</h2>
            <Pose3D />
          </div>
          
          <div className="dashboard-section charts-section">
            <h2>Telemetry Charts</h2>
            <Charts />
          </div>
          
          <div className="dashboard-section alerts-section">
            <h2>Alerts & Events</h2>
            <Alerts />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App