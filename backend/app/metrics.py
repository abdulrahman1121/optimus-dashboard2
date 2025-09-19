from prometheus_client import Counter, Histogram, Gauge, generate_latest, CollectorRegistry, REGISTRY

# Create a custom registry for our metrics
registry = CollectorRegistry()

# HTTP request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint'],
    registry=registry
)

# WebSocket metrics
telemetry_messages_total = Counter(
    'telemetry_messages_total',
    'Total telemetry messages sent',
    registry=registry
)

# Alert metrics
alerts_total = Counter(
    'alerts_total',
    'Total alerts triggered',
    ['alert_name', 'severity'],
    registry=registry
)

# Handler latency
handler_latency_seconds = Histogram(
    'handler_latency_seconds',
    'Handler latency in seconds',
    ['handler'],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=registry
)

# System metrics
connected_clients = Gauge(
    'websocket_connected_clients',
    'Number of connected WebSocket clients',
    registry=registry
)

telemetry_buffer_size = Gauge(
    'telemetry_buffer_size',
    'Current size of telemetry buffer',
    registry=registry
)

def setup_metrics():
    """Setup and return metrics registry"""
    return registry

def record_http_request(endpoint: str, method: str = "GET"):
    """Record an HTTP request"""
    http_requests_total.labels(method=method, endpoint=endpoint).inc()

def record_telemetry_message():
    """Record a telemetry message"""
    telemetry_messages_total.inc()

def record_alert(alert_name: str, severity: str = "warning"):
    """Record an alert"""
    alerts_total.labels(alert_name=alert_name, severity=severity).inc()

def update_connected_clients(count: int):
    """Update connected clients count"""
    connected_clients.set(count)

def update_telemetry_buffer_size(size: int):
    """Update telemetry buffer size"""
    telemetry_buffer_size.set(size)
