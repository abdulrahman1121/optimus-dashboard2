import React from 'react'
import { useTelemetryStore } from '../state/store'
import { Wifi, WifiOff, Activity, Clock } from 'lucide-react'

const StatusBar: React.FC = () => {
  const { connectionStatus, telemetry } = useTelemetryStore()

  const getConnectionStatus = () => {
    if (connectionStatus.connected) {
      return { icon: Wifi, text: 'Connected', color: 'text-success' }
    }
    return { icon: WifiOff, text: 'Disconnected', color: 'text-error' }
  }

  const getLastFrameAge = () => {
    if (!connectionStatus.lastMessage) return 'N/A'
    const age = Date.now() - connectionStatus.lastMessage
    if (age < 1000) return `${age}ms`
    return `${Math.round(age / 1000)}s`
  }

  const connectionStatusInfo = getConnectionStatus()
  const ConnectionIcon = connectionStatusInfo.icon

  return (
    <div className="status-bar">
      <div className="status-item">
        <ConnectionIcon size={16} />
        <span className={connectionStatusInfo.color}>{connectionStatusInfo.text}</span>
      </div>
      
      <div className="status-item">
        <Activity size={16} />
        <span>{connectionStatus.fps} FPS</span>
      </div>
      
      <div className="status-item">
        <Clock size={16} />
        <span>Last: {getLastFrameAge()}</span>
      </div>
      
      {telemetry && (
        <div className="status-item">
          <span className="text-secondary">Robot:</span>
          <span className="text-accent">{telemetry.robot_id}</span>
        </div>
      )}
      
      {telemetry && (
        <div className="status-item">
          <span className="text-secondary">Status:</span>
          <span className={
            telemetry.status === 'OK' ? 'text-success' : 'text-warning'
          }>
            {telemetry.status}
          </span>
        </div>
      )}
    </div>
  )
}

export default StatusBar
