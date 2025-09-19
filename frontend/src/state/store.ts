import { create } from 'zustand'

export interface TelemetryData {
  robot_id: string
  ts: number
  pose: {
    x: number
    y: number
    z: number
    roll: number
    pitch: number
    yaw: number
  }
  battery_pct: number
  temp_c: number
  joints: {
    shoulder_l: number
    elbow_l: number
    knee_l: number
    shoulder_r: number
  }
  status: string
}

export interface Alert {
  name: string
  severity: 'info' | 'warning' | 'error'
  message: string
  value: number
  threshold: number
  timestamp: number
  action?: 'cleared'
}

export interface ConnectionStatus {
  connected: boolean
  lastMessage: number | null
  fps: number
  frameCount: number
  lastFrameTime: number
}

interface TelemetryStore {
  // Data
  telemetry: TelemetryData | null
  telemetryHistory: TelemetryData[]
  alerts: Alert[]
  connectionStatus: ConnectionStatus
  
  // Actions
  updateTelemetry: (data: TelemetryData) => void
  addAlert: (alert: Alert) => void
  clearAlert: (alertName: string) => void
  updateConnectionStatus: (status: Partial<ConnectionStatus>) => void
  clearHistory: () => void
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  // Initial state
  telemetry: null,
  telemetryHistory: [],
  alerts: [],
  connectionStatus: {
    connected: false,
    lastMessage: null,
    fps: 0,
    frameCount: 0,
    lastFrameTime: 0
  },

  // Actions
  updateTelemetry: (data: TelemetryData) => {
    const state = get()
    const now = Date.now()
    
    // Calculate FPS
    const fps = state.connectionStatus.lastFrameTime > 0 
      ? 1000 / (now - state.connectionStatus.lastFrameTime)
      : 0
    
    set((state) => ({
      telemetry: data,
      telemetryHistory: [...state.telemetryHistory.slice(-299), data], // Keep last 300 points
      connectionStatus: {
        ...state.connectionStatus,
        lastMessage: now,
        fps: Math.round(fps * 10) / 10,
        frameCount: state.connectionStatus.frameCount + 1,
        lastFrameTime: now
      }
    }))
  },

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts.filter(a => a.name !== alert.name)].slice(0, 50) // Keep last 50 alerts
    }))
  },

  clearAlert: (alertName: string) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.name !== alertName)
    }))
  },

  updateConnectionStatus: (status: Partial<ConnectionStatus>) => {
    set((state) => ({
      connectionStatus: { ...state.connectionStatus, ...status }
    }))
  },

  clearHistory: () => {
    set({ telemetryHistory: [], alerts: [] })
  }
}))