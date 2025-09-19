import React, { useState } from 'react'
import { useTelemetryStore } from '../state/store'
import { AlertTriangle, CheckCircle, X, Clock, Zap } from 'lucide-react'

const Alerts: React.FC = () => {
  const { alerts, clearAlert } = useTelemetryStore()
  const [showCleared, setShowCleared] = useState(false)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle size={16} className="text-error" />
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />
      case 'info':
        return <Zap size={16} className="text-accent" />
      default:
        return <AlertTriangle size={16} className="text-secondary" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'alert-error'
      case 'warning':
        return 'alert-warning'
      case 'info':
        return 'alert-info'
      default:
        return 'alert-default'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  const activeAlerts = alerts.filter(alert => !alert.action)
  const clearedAlerts = alerts.filter(alert => alert.action === 'cleared')

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <div className="alerts-tabs">
          <button 
            className={`tab ${!showCleared ? 'active' : ''}`}
            onClick={() => setShowCleared(false)}
          >
            Active ({activeAlerts.length})
          </button>
          <button 
            className={`tab ${showCleared ? 'active' : ''}`}
            onClick={() => setShowCleared(true)}
          >
            Cleared ({clearedAlerts.length})
          </button>
        </div>
      </div>

      <div className="alerts-content">
        {!showCleared ? (
          <div className="alerts-list">
            {activeAlerts.length === 0 ? (
              <div className="no-alerts">
                <CheckCircle size={32} className="text-success" />
                <p>No active alerts</p>
                <p className="text-secondary">All systems operating normally</p>
              </div>
            ) : (
              activeAlerts.map((alert, index) => (
                <div key={`${alert.name}-${index}`} className={`alert-item ${getSeverityColor(alert.severity)}`}>
                  <div className="alert-icon">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <h4>{alert.name.replace(/_/g, ' ').toUpperCase()}</h4>
                      <button 
                        className="alert-ack"
                        onClick={() => clearAlert(alert.name)}
                        title="Acknowledge alert"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <div className="alert-details">
                      <span className="alert-value">
                        Current: {alert.value.toFixed(1)}
                      </span>
                      <span className="alert-threshold">
                        Threshold: {alert.threshold}
                      </span>
                      <span className="alert-time">
                        <Clock size={12} />
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="alerts-list">
            {clearedAlerts.length === 0 ? (
              <div className="no-alerts">
                <p>No cleared alerts</p>
                <p className="text-secondary">No alerts have been cleared recently</p>
              </div>
            ) : (
              clearedAlerts.map((alert, index) => (
                <div key={`cleared-${alert.name}-${index}`} className="alert-item alert-cleared">
                  <div className="alert-icon">
                    <CheckCircle size={16} className="text-success" />
                  </div>
                  <div className="alert-content">
                    <div className="alert-header">
                      <h4>{alert.name.replace(/_/g, ' ').toUpperCase()}</h4>
                    </div>
                    <p className="alert-message">Alert cleared</p>
                    <div className="alert-details">
                      <span className="alert-time">
                        <Clock size={12} />
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Alerts
