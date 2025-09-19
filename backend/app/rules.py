from typing import List, Dict, Any
from dataclasses import dataclass
import time

@dataclass
class AlertRule:
    name: str
    condition: str  # field name to check
    threshold: float
    enabled: bool = True
    severity: str = "warning"
    cooldown_seconds: int = 30  # Prevent spam

class AlertManager:
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.last_triggered: Dict[str, float] = {}
        self.active_alerts: Dict[str, Dict[str, Any]] = {}
    
    def update_rules(self, rules: List[AlertRule]):
        """Update alert rules"""
        self.rules = rules
        # Clear old active alerts that no longer have rules
        rule_names = {rule.name for rule in rules}
        self.active_alerts = {
            name: alert for name, alert in self.active_alerts.items()
            if name in rule_names
        }
    
    def get_rules(self) -> List[Dict[str, Any]]:
        """Get current rules as dictionaries"""
        return [
            {
                "name": rule.name,
                "condition": rule.condition,
                "threshold": rule.threshold,
                "enabled": rule.enabled,
                "severity": rule.severity
            }
            for rule in self.rules
        ]
    
    def evaluate_rules(self, telemetry: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Evaluate all rules against telemetry data"""
        current_time = time.time()
        triggered_alerts = []
        
        for rule in self.rules:
            if not rule.enabled:
                continue
            
            # Check cooldown
            if rule.name in self.last_triggered:
                if current_time - self.last_triggered[rule.name] < rule.cooldown_seconds:
                    continue
            
            # Evaluate rule
            if self._evaluate_rule(rule, telemetry):
                alert_data = {
                    "name": rule.name,
                    "severity": rule.severity,
                    "message": f"{rule.condition} {self._get_operator(rule)} {rule.threshold}",
                    "value": self._get_field_value(telemetry, rule.condition),
                    "threshold": rule.threshold,
                    "timestamp": current_time
                }
                
                triggered_alerts.append(alert_data)
                self.last_triggered[rule.name] = current_time
                self.active_alerts[rule.name] = alert_data
        
        # Check for cleared alerts
        cleared_alerts = []
        for rule_name in list(self.active_alerts.keys()):
            rule = next((r for r in self.rules if r.name == rule_name), None)
            if rule and rule.enabled:
                if not self._evaluate_rule(rule, telemetry):
                    cleared_alerts.append({
                        "name": rule_name,
                        "action": "cleared",
                        "timestamp": current_time
                    })
                    del self.active_alerts[rule_name]
        
        return triggered_alerts + cleared_alerts
    
    def _evaluate_rule(self, rule: AlertRule, telemetry: Dict[str, Any]) -> bool:
        """Evaluate a single rule"""
        value = self._get_field_value(telemetry, rule.condition)
        if value is None:
            return False
        
        # For joint currents, check if any joint exceeds threshold
        if rule.condition == "joint_current":
            joints = telemetry.get("joints", {})
            return any(current > rule.threshold for current in joints.values())
        
        # For other fields, direct comparison
        return value > rule.threshold
    
    def _get_field_value(self, telemetry: Dict[str, Any], field: str) -> float:
        """Get field value from telemetry data"""
        if field in telemetry:
            return telemetry[field]
        
        # Handle nested fields
        if "." in field:
            parts = field.split(".")
            value = telemetry
            for part in parts:
                if isinstance(value, dict) and part in value:
                    value = value[part]
                else:
                    return None
            return value
        
        return None
    
    def _get_operator(self, rule: AlertRule) -> str:
        """Get operator string for display"""
        if rule.condition == "joint_current":
            return ">"
        return ">"
    
    def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get currently active alerts"""
        return list(self.active_alerts.values())
