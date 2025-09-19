import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useTelemetryStore } from '../state/store'

const Charts: React.FC = () => {
  const { telemetryHistory } = useTelemetryStore()

  // Transform data for charts
  const chartData = useMemo(() => {
    return telemetryHistory.map((data, index) => ({
      time: new Date(data.ts * 1000).toLocaleTimeString(),
      timestamp: data.ts,
      battery: data.battery_pct,
      temperature: data.temp_c,
      shoulderL: data.joints.shoulder_l,
      elbowL: data.joints.elbow_l,
      kneeL: data.joints.knee_l,
      shoulderR: data.joints.shoulder_r,
    }))
  }, [telemetryHistory])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="charts-container">
        <div className="no-data">
          <p>No telemetry data available</p>
          <p className="text-secondary">Waiting for data from robot...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-container">
      <div className="chart-grid">
        <div className="chart-item">
          <h3>Battery Level</h3>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="battery"
                stroke="#00ff88"
                fill="#00ff88"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Temperature</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ffaa00"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Joint Currents - Left Side</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="shoulderL"
                stroke="#00d4ff"
                strokeWidth={2}
                dot={false}
                name="Shoulder L"
              />
              <Line
                type="monotone"
                dataKey="elbowL"
                stroke="#ff4444"
                strokeWidth={2}
                dot={false}
                name="Elbow L"
              />
              <Line
                type="monotone"
                dataKey="kneeL"
                stroke="#ff00ff"
                strokeWidth={2}
                dot={false}
                name="Knee L"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Joint Currents - Right Side</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="shoulderR"
                stroke="#00d4ff"
                strokeWidth={2}
                dot={false}
                name="Shoulder R"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Charts
