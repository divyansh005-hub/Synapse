# System Architecture Documentation

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              Web Dashboard (HTML/CSS/JS + TailwindCSS)               │  │
│  │  • Real-time charts (Chart.js)                                       │  │
│  │  • Machine status cards with glassmorphism                           │  │
│  │  • Live alert notifications                                          │  │
│  │  • Consumable level indicators                                       │  │
│  │  • Dark mode with gradients & micro-animations                       │  │
│  │  • WebSocket client (dashboard_ws.js)                                │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────────┘
                                    │ WebSocket (ws://)
                                    │ HTTP (static files)
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         APPLICATION LAYER (Node.js)                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    CSV Streamer (csv-streamer.js)                     │  │
│  │  • HTTP Server (serves static files on port 8081)                    │  │
│  │  • WebSocket Server (real-time data streaming)                       │  │
│  │  • CSV Parser (reads machine_feed/*.csv)                             │  │
│  │  • Data Broadcaster (1-second intervals)                             │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│  ┌───────────────────────────────▼──────────────────────────────────────┐  │
│  │                      Real-Time Data Pipeline                          │  │
│  │  1. Load CSV data into memory                                         │  │
│  │  2. Track cursor position for each machine                            │  │
│  │  3. Read next row every second                                        │  │
│  │  4. Determine machine status (OPERATIONAL/WARNING/CRITICAL)           │  │
│  │  5. Detect anomalies (overheating, vibration, low oil)                │  │
│  │  6. Broadcast via WebSocket to all connected clients                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                              DATA SOURCE LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    CSV Files (machine_feed/)                          │  │
│  │  • 30 machine CSV files with synthetic data                           │  │
│  │  • Columns: temperature, vibration, rpm, load, pressure, humidity     │  │
│  │  • Consumables: oil_pct, coolant_pct, hydraulic_oil_pct, etc.        │  │
│  │  • Spare parts: bearing_wear, drive_belt_wear, motor_health_pct      │  │
│  │  • KPIs: efficiency_pct, usage_hours                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow

```
CSV Files (machine_feed/) 
    ↓
CSV Parser (loads into memory)
    ↓
Cursor-based Row Reader (1-second interval)
    ↓
Status Determination & Anomaly Detection
    ↓
WebSocket Broadcast
    ↓
Dashboard UI (real-time updates)
```

## 3. Component Interactions

### 3.1 CSV Data Source → Node.js Backend
- **Storage**: CSV files in `machine_feed/` directory
- **Format**: 30 CSV files (one per machine)
- **Loading**: All data loaded into memory at startup
- **Streaming**: Cursor-based sequential reading with loop-back

**CSV Structure:**
```csv
temperature,vibration,rpm,load,pressure,humidity,oil_pct,coolant_pct,hydraulic_oil_pct,brake_fluid_pct,filter_clog_pct,bearing_wear,drive_belt_wear,motor_health_pct,efficiency_pct,usage_hours
75.5,2.3,1500,65.2,101.2,45.0,85.0,90.0,88.0,95.0,15.0,12.5,8.0,92.0,87.5,1250.5
```

### 3.2 Backend → Frontend (WebSocket Protocol)
- **Protocol**: WebSocket (ws://)
- **Port**: 8081
- **Frequency**: 1-second broadcasts
- **Auto-reconnect**: Frontend reconnects on disconnect

**Message Types:**

**1. Initial Connection (type: 'init'):**
```json
{
  "type": "init",
  "machines": [
    { "machineId": "Machine 1", "status": "OFFLINE" },
    { "machineId": "Machine 2", "status": "OFFLINE" }
  ]
}
```

**2. Data Updates (type: 'update'):**
```json
{
  "type": "update",
  "data": [
    {
      "machineId": "Machine 1",
      "timestamp": 1700000000000,
      "status": "OPERATIONAL",
      "sensors": {
        "temperature": 75.5,
        "vibration": 2.3,
        "rpm": 1500,
        "load": 65.2,
        "pressure": 101.2,
        "humidity": 45.0,
        "power": 48.9
      },
      "consumables": {
        "oil": 85.0,
        "coolant": 90.0,
        "hydraulic": 88.0,
        "brake_fluid": 95.0,
        "filter": 15.0
      },
      "spares": {
        "bearing_wear": 12.5,
        "drive_belt_wear": 8.0,
        "motor_health": 92.0
      },
      "kpi": {
        "efficiency": 87.5,
        "usage_hours": 1250.5
      },
      "anomaly": null
    }
  ]
}
```

### 3.3 Backend → Static Files (HTTP)
- **Protocol**: HTTP
- **Port**: 8081
- **Directory**: `src/main/resources/static/`
- **Content Types**: HTML, CSS, JavaScript, images

## 4. Status Determination Logic

**Machine Status Levels:**
- **OPERATIONAL**: Normal operation (temp ≤ 90°C, vibration ≤ 5.0 mm/s)
- **WARNING**: Elevated readings (temp > 90°C or vibration > 5.0 mm/s)
- **CRITICAL**: Dangerous levels (temp > 100°C or vibration > 8.0 mm/s)

## 5. Anomaly Detection

**Anomaly Types:**
1. **Overheating**: Temperature > 105°C (CRITICAL)
2. **High Vibration**: Vibration > 9.0 mm/s (CRITICAL)
3. **Low Oil**: Oil level < 10% (WARNING)
4. **Motor Wear**: Motor health < 40% (WARNING)

## 6. Technology Stack

- **Backend**: Node.js 14+
- **WebSocket**: ws library
- **CSV Parsing**: csv-parse/sync
- **HTTP Server**: Node.js built-in http module
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: TailwindCSS (via CDN)
- **Charts**: Chart.js
- **Real-time**: WebSocket API

## 7. Scalability Considerations

- **In-Memory Data**: All CSV data loaded at startup (suitable for 30 machines)
- **Stateless Broadcasting**: WebSocket server broadcasts to all clients
- **Horizontal Scaling**: Can add load balancer for multiple Node.js instances
- **Future Enhancements**: 
  - Database integration for historical data
  - Redis for distributed caching
  - Message queue for high-volume data ingestion
  - Microservices architecture for prediction/analytics

## 8. Deployment Architecture

**Local Development:**
```
run_all.bat → Starts csv-streamer.js → Opens browser at localhost:8081
```

**Network Access:**
```
csv-streamer.js binds to 0.0.0.0:8081
Clients connect via: ws://[HOST_IP]:8081
Dashboard accessible via: http://[HOST_IP]:8081
```

