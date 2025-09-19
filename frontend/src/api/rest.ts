const API_BASE = '/api'

export interface AlertRule {
  name: string
  condition: string
  threshold: number
  enabled: boolean
  severity?: string
}

export interface HealthResponse {
  status: string
  timestamp: number
}

export interface TelemetryHistoryResponse {
  data: any[]
  count: number
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  async getMetrics(): Promise<string> {
    const response = await fetch(`${API_BASE}/metrics`)
    return response.text()
  }

  async getAlertRules(): Promise<{ rules: AlertRule[] }> {
    return this.request<{ rules: AlertRule[] }>('/config/alert-rules')
  }

  async updateAlertRules(rules: AlertRule[]): Promise<{ status: string; rules_count: number }> {
    return this.request<{ status: string; rules_count: number }>('/config/alert-rules', {
      method: 'POST',
      body: JSON.stringify(rules),
    })
  }

  async getTelemetryHistory(seconds: number = 300): Promise<TelemetryHistoryResponse> {
    return this.request<TelemetryHistoryResponse>(`/telemetry/history?seconds=${seconds}`)
  }
}

export const apiClient = new ApiClient()