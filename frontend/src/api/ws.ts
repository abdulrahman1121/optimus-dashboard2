import { useTelemetryStore, TelemetryData, Alert } from '../state/store'

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private store = useTelemetryStore.getState()

  connect(url: string = 'ws://localhost:8000/stream/telemetry') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.store.updateConnectionStatus({ connected: true })
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.store.updateConnectionStatus({ connected: false })
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.store.updateConnectionStatus({ connected: false })
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'telemetry':
        if (message.data) {
          this.store.updateTelemetry(message.data as TelemetryData)
        }
        if (message.alerts) {
          message.alerts.forEach((alert: Alert) => {
            if (alert.action === 'cleared') {
              this.store.clearAlert(alert.name)
            } else {
              this.store.addAlert(alert)
            }
          })
        }
        break
      
      case 'initial_data':
        if (message.data) {
          // Add initial data to history
          message.data.forEach((data: TelemetryData) => {
            this.store.updateTelemetry(data)
          })
        }
        break
      
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.store.updateConnectionStatus({ connected: false })
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
}

// Singleton instance
export const wsManager = new WebSocketManager()