import asyncio
import json
import time
from typing import Dict, List, Any
from datetime import datetime, timedelta
import random
import math

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from .metrics import setup_metrics, record_telemetry_message, record_alert, record_http_request
from .rules import AlertRule, AlertManager

app = FastAPI(title="Optimus Telemetry API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
connected_clients: List[WebSocket] = []
telemetry_buffer: List[Dict[str, Any]] = []
alert_manager = AlertManager()
metrics = setup_metrics()

# Telemetry data model
class TelemetryData(BaseModel):
    robot_id: str
    ts: float
    pose: Dict[str, float]
    battery_pct: float
    temp_c: float
    joints: Dict[str, float]
    status: str

class AlertRuleModel(BaseModel):
    name: str
    condition: str
    threshold: float
    enabled: bool = True

# Background task for telemetry simulation
async def telemetry_simulator():
    """Simulate robot telemetry data"""
    robot_id = "optimus_sim_01"
    base_time = time.time()
    
    # Initial values
    pose = {"x": 0.2, "y": 0.0, "z": 0.95, "roll": 0.0, "pitch": 0.05, "yaw": 1.57}
    battery_pct = 82.4
    temp_c = 41.2
    joints = {"shoulder_l": 2.1, "elbow_l": 1.4, "knee_l": 1.9, "shoulder_r": 2.0}
    
    while True:
        current_time = time.time()
        elapsed = current_time - base_time
        
        # Simulate realistic robot movement and sensor data
        pose["x"] = 0.2 + 0.1 * math.sin(elapsed * 0.1)
        pose["y"] = 0.0 + 0.05 * math.cos(elapsed * 0.15)
        pose["z"] = 0.95 + 0.02 * math.sin(elapsed * 0.2)
        pose["roll"] = 0.0 + 0.1 * math.sin(elapsed * 0.05)
        pose["pitch"] = 0.05 + 0.08 * math.cos(elapsed * 0.12)
        pose["yaw"] = 1.57 + 0.3 * math.sin(elapsed * 0.08)
        
        # Battery slowly decreases with some variation
        battery_pct = max(10.0, 85.0 - elapsed * 0.01 + random.uniform(-2, 2))
        
        # Temperature varies with activity
        temp_c = 40.0 + 5 * math.sin(elapsed * 0.1) + random.uniform(-1, 1)
        
        # Joint currents vary with movement
        joints["shoulder_l"] = 2.0 + 0.5 * math.sin(elapsed * 0.2) + random.uniform(-0.2, 0.2)
        joints["elbow_l"] = 1.4 + 0.3 * math.cos(elapsed * 0.25) + random.uniform(-0.1, 0.1)
        joints["knee_l"] = 1.9 + 0.4 * math.sin(elapsed * 0.18) + random.uniform(-0.15, 0.15)
        joints["shoulder_r"] = 2.0 + 0.3 * math.cos(elapsed * 0.22) + random.uniform(-0.1, 0.1)
        
        # Determine status
        status = "OK"
        if battery_pct < 20:
            status = "LOW_BATTERY"
        elif temp_c > 60:
            status = "OVERHEAT"
        elif any(current > 3.0 for current in joints.values()):
            status = "HIGH_CURRENT"
        
        # Create telemetry data
        telemetry = {
            "robot_id": robot_id,
            "ts": current_time,
            "pose": pose.copy(),
            "battery_pct": round(battery_pct, 1),
            "temp_c": round(temp_c, 1),
            "joints": {k: round(v, 2) for k, v in joints.items()},
            "status": status
        }
        
        # Add to buffer (keep last 300 seconds at 10Hz = 3000 points)
        telemetry_buffer.append(telemetry)
        if len(telemetry_buffer) > 3000:
            telemetry_buffer.pop(0)
        
        # Check alert rules
        alerts = alert_manager.evaluate_rules(telemetry)
        for alert in alerts:
            record_alert(alert["name"], alert["severity"])
        
        # Broadcast to connected clients
        if connected_clients:
            message = {
                "type": "telemetry",
                "data": telemetry,
                "alerts": alerts
            }
            await broadcast_message(message)
        
        record_telemetry_message()
        await asyncio.sleep(0.1)  # 10Hz

async def broadcast_message(message: dict):
    """Broadcast message to all connected WebSocket clients"""
    if not connected_clients:
        return
    
    message_str = json.dumps(message)
    disconnected = []
    
    for client in connected_clients:
        try:
            await client.send_text(message_str)
        except:
            disconnected.append(client)
    
    # Remove disconnected clients
    for client in disconnected:
        connected_clients.remove(client)

# WebSocket endpoint
@app.websocket("/stream/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    
    try:
        # Send initial data
        if telemetry_buffer:
            recent_data = telemetry_buffer[-100:]  # Last 100 points
            await websocket.send_text(json.dumps({
                "type": "initial_data",
                "data": recent_data
            }))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

# REST endpoints
@app.get("/health")
async def health_check():
    record_http_request("health")
    return {"status": "ok", "timestamp": time.time()}

@app.get("/metrics")
async def get_metrics():
    record_http_request("metrics")
    return PlainTextResponse(metrics.generate_latest())

@app.get("/config/alert-rules")
async def get_alert_rules():
    record_http_request("get_alert_rules")
    return {"rules": alert_manager.get_rules()}

@app.post("/config/alert-rules")
async def update_alert_rules(rules: List[AlertRuleModel]):
    record_http_request("update_alert_rules")
    try:
        alert_manager.update_rules([AlertRule(
            name=rule.name,
            condition=rule.condition,
            threshold=rule.threshold,
            enabled=rule.enabled
        ) for rule in rules])
        return {"status": "success", "rules_count": len(rules)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/telemetry/history")
async def get_telemetry_history(seconds: int = 300):
    record_http_request("get_telemetry_history")
    cutoff_time = time.time() - seconds
    recent_data = [t for t in telemetry_buffer if t["ts"] >= cutoff_time]
    return {"data": recent_data, "count": len(recent_data)}

# Startup event
@app.on_event("startup")
async def startup_event():
    # Start telemetry simulator
    asyncio.create_task(telemetry_simulator())
    
    # Add default alert rules
    default_rules = [
        AlertRule("low_battery", "battery_pct", 20.0),
        AlertRule("overheat", "temp_c", 60.0),
        AlertRule("high_current", "joint_current", 3.0),
    ]
    alert_manager.update_rules(default_rules)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
