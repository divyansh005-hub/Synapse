# Integration Design: Simulation → Backend → UI

## Overview
This document describes how the three main components (Simulation, Backend, UI) integrate and communicate.

## 1. Simulation → Backend Integration

### Communication Method
**Option A: HTTP POST (Recommended)**
- Simulator sends HTTP POST requests to backend
- Simple, stateless, easy to debug
- Can run on different machines

**Option B: TCP Socket**
- Direct socket connection
- Lower latency
- More complex error handling

**Option C: Message Queue (Future)**
- For distributed systems
- Better scalability

### Data Format
```json
{
  "machineId": "M001",
  "timestamp": 1703123456789,
  "sensors": {
    "temperature": {
      "value": 75.5,
      "unit": "Celsius",
      "threshold": 80.0
    },
    "vibration": {
      "value": 2.3,
      "unit": "mm/s",
      "threshold": 5.0
    },
    "pressure": {
      "value": 101.2,
      "unit": "PSI",
      "threshold": 120.0
    },
    "rpm": {
      "value": 1500,
      "unit": "RPM",
      "threshold": 2000
    }
  },
  "consumables": {
    "oil": {
      "level": 85.0,
      "maxLevel": 100.0,
      "minLevel": 20.0,
      "consumptionRate": 0.1
    },
    "coolant": {
      "level": 90.0,
      "maxLevel": 100.0,
      "minLevel": 30.0,
      "consumptionRate": 0.05
    },
    "filterClog": {
      "level": 15.0,
      "maxLevel": 100.0,
      "minLevel": 0.0,
      "consumptionRate": 0.2
    }
  }
}
```

### Integration Flow
```
┌─────────────────┐
│   Simulator     │
│  (Every 1 sec)  │
└────────┬────────┘
         │ HTTP POST /api/data
         │ JSON payload
         ▼
┌─────────────────┐
│  Backend API    │
│  /api/data      │
└────────┬────────┘
         │
         ├─→ Data Pipeline
         │   ├─→ Update Machine State
         │   ├─→ Update Consumables
         │   ├─→ Run Prediction
         │   └─→ Generate Alerts
         │
         └─→ Storage
             ├─→ SQLite DB
             └─→ JSON Logs
```

### Implementation
```java
// Simulator side
public void sendDataToBackend(Machine machine) {
    JSONObject data = generateMachineData(machine);
    
    try {
        URL url = new URL("http://localhost:8080/api/data");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = data.toString().getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        
        int responseCode = conn.getResponseCode();
        if (responseCode != 200) {
            System.err.println("Failed to send data: " + responseCode);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}

// Backend side
@POST
@Path("/data")
@Consumes(MediaType.APPLICATION_JSON)
public Response receiveSensorData(JSONObject data) {
    try {
        // Parse incoming data
        String machineId = data.getString("machineId");
        Machine machine = machineManager.getMachine(machineId);
        
        // Process through pipeline
        dataPipeline.process(data);
        
        return Response.ok().build();
    } catch (Exception e) {
        return Response.status(500).entity(e.getMessage()).build();
    }
}
```

---

## 2. Backend → UI Integration

### Communication Method
**REST API with Polling**
- UI polls backend every 2 seconds
- Simple to implement
- Works with any HTTP client

**Future: WebSocket (Optional)**
- Real-time push updates
- Lower latency
- More efficient for high-frequency updates

### API Endpoints

#### GET /api/machines
```json
Response:
[
  {
    "machineId": "M001",
    "name": "Production Line 1",
    "status": "OPERATIONAL",
    "healthScore": 0.85,
    "sensors": [
      {
        "sensorId": "TEMP001",
        "type": "TEMPERATURE",
        "value": 75.5,
        "threshold": 80.0,
        "status": "NORMAL"
      }
    ],
    "lastUpdate": 1703123456789
  }
]
```

#### GET /api/alerts
```json
Response:
[
  {
    "alertId": "A001",
    "machineId": "M001",
    "severity": "HIGH",
    "type": "THRESHOLD_EXCEEDED",
    "message": "Temperature exceeded threshold",
    "timestamp": 1703123456789,
    "acknowledged": false
  }
]
```

#### GET /api/predictions?machineId=M001
```json
Response:
{
  "machineId": "M001",
  "failureProbability": 0.15,
  "survivalProbability": 0.85,
  "meanTimeToFailure": 5000,
  "anomalyScore": 0.2,
  "lastUpdated": 1703123456789
}
```

#### GET /api/trends?machineId=M001&sensorType=TEMPERATURE&hours=24
```json
Response:
{
  "machineId": "M001",
  "sensorType": "TEMPERATURE",
  "dataPoints": [
    {
      "timestamp": 1703123456789,
      "value": 75.5
    },
    {
      "timestamp": 1703123456790,
      "value": 75.8
    }
  ],
  "average": 75.6,
  "min": 74.2,
  "max": 77.1
}
```

#### GET /api/consumables?machineId=M001
```json
Response:
{
  "machineId": "M001",
  "consumables": [
    {
      "type": "OIL",
      "currentLevel": 85.0,
      "maxLevel": 100.0,
      "percentage": 85.0,
      "needsRefill": false
    },
    {
      "type": "COOLANT",
      "currentLevel": 25.0,
      "maxLevel": 100.0,
      "percentage": 25.0,
      "needsRefill": true
    }
  ]
}
```

### Integration Flow
```
┌─────────────────┐
│   Dashboard UI  │
│  (Every 2 sec)  │
└────────┬────────┘
         │ HTTP GET requests
         │
         ├─→ GET /api/machines
         ├─→ GET /api/alerts
         ├─→ GET /api/predictions
         ├─→ GET /api/trends
         └─→ GET /api/consumables
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  REST Endpoints │
└────────┬────────┘
         │
         ├─→ Machine Manager
         ├─→ Alert Manager
         ├─→ Prediction Engine
         ├─→ Data Repository
         └─→ Return JSON
```

### Frontend Implementation
```javascript
// dashboard.js
class Dashboard {
    constructor() {
        this.apiBase = 'http://localhost:8080/api';
        this.updateInterval = 2000; // 2 seconds
    }
    
    start() {
        this.updateDashboard();
        setInterval(() => this.updateDashboard(), this.updateInterval);
    }
    
    async updateDashboard() {
        try {
            // Fetch all data in parallel
            const [machines, alerts, predictions, consumables] = await Promise.all([
                this.fetchMachines(),
                this.fetchAlerts(),
                this.fetchPredictions(),
                this.fetchConsumables()
            ]);
            
            // Update UI
            this.renderMachines(machines);
            this.renderAlerts(alerts);
            this.renderPredictions(predictions);
            this.renderConsumables(consumables);
            
            // Update charts
            this.updateCharts(machines);
        } catch (error) {
            console.error('Failed to update dashboard:', error);
        }
    }
    
    async fetchMachines() {
        const response = await fetch(`${this.apiBase}/machines`);
        return await response.json();
    }
    
    async fetchAlerts() {
        const response = await fetch(`${this.apiBase}/alerts`);
        return await response.json();
    }
    
    async fetchPredictions(machineId = 'M001') {
        const response = await fetch(`${this.apiBase}/predictions?machineId=${machineId}`);
        return await response.json();
    }
    
    async fetchTrends(machineId, sensorType, hours = 24) {
        const response = await fetch(
            `${this.apiBase}/trends?machineId=${machineId}&sensorType=${sensorType}&hours=${hours}`
        );
        return await response.json();
    }
    
    async fetchConsumables(machineId = 'M001') {
        const response = await fetch(`${this.apiBase}/consumables?machineId=${machineId}`);
        return await response.json();
    }
}
```

---

## 3. Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMULATION LAYER                          │
│                                                              │
│  Sensor Simulator                                            │
│  ├─ Generate temperature data                                │
│  ├─ Generate vibration data                                  │
│  ├─ Generate pressure data                                   │
│  ├─ Generate RPM data                                        │
│  └─ Generate consumable usage                                │
│                                                              │
│  Every 1 second → HTTP POST /api/data                        │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                            │
│                                                              │
│  REST API Endpoint: /api/data                                │
│  ├─ Parse JSON data                                          │
│  ├─ Validate data                                            │
│  └─ Trigger Data Pipeline                                    │
│                                                              │
│  Data Pipeline                                               │
│  ├─ Update Machine State                                     │
│  │   └─→ Machine Manager                                     │
│  ├─ Update Consumables                                       │
│  │   └─→ Consumable Updater                                  │
│  ├─ Run Prediction Engine                                    │
│  │   ├─→ Anomaly Detection (Z-score)                         │
│  │   ├─→ Poisson Failure Prediction                          │
│  │   └─→ Survival Analysis                                   │
│  ├─ Generate Alerts                                          │
│  │   └─→ Alert Manager (Priority Queue)                      │
│  └─ Store Data                                               │
│      ├─→ SQLite Database                                     │
│      └─→ JSON Log Files                                      │
│                                                              │
│  REST API Endpoints (for UI)                                 │
│  ├─ GET /api/machines                                        │
│  ├─ GET /api/alerts                                          │
│  ├─ GET /api/predictions                                     │
│  ├─ GET /api/trends                                          │
│  └─ GET /api/consumables                                     │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTP GET (polling every 2 sec)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      UI LAYER                                │
│                                                              │
│  Dashboard HTML/CSS/JS                                       │
│  ├─ Machine Health Cards                                     │
│  ├─ Real-time Charts (Chart.js)                              │
│  │   ├─ Temperature graph                                    │
│  │   ├─ Vibration graph                                      │
│  │   └─ Pressure graph                                       │
│  ├─ Alert List                                               │
│  ├─ Failure Probability Display                              │
│  └─ Consumable Level Indicators                              │
│                                                              │
│  JavaScript                                                  │
│  ├─ Fetch data from REST API                                 │
│  ├─ Update DOM elements                                      │
│  └─ Update charts                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Error Handling

### Simulation → Backend
- **Connection Error**: Retry with exponential backoff
- **Timeout**: Log and continue with next reading
- **Invalid Response**: Log error, continue simulation

### Backend → UI
- **Network Error**: Show error message, retry automatically
- **Invalid Data**: Display "No data available"
- **Server Error**: Show error notification

### Implementation
```java
// Backend error handling
@POST
@Path("/data")
public Response receiveSensorData(JSONObject data) {
    try {
        dataPipeline.process(data);
        return Response.ok().build();
    } catch (IllegalArgumentException e) {
        return Response.status(400).entity(e.getMessage()).build();
    } catch (Exception e) {
        logger.error("Error processing sensor data", e);
        return Response.status(500).entity("Internal server error").build();
    }
}
```

```javascript
// Frontend error handling
async fetchMachines() {
    try {
        const response = await fetch(`${this.apiBase}/machines`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch machines:', error);
        this.showError('Failed to load machine data');
        return []; // Return empty array on error
    }
}
```

---

## 5. Performance Considerations

### Backend Optimization
- Use connection pooling for database
- Cache frequently accessed data
- Use async processing for non-critical operations
- Batch database writes

### Frontend Optimization
- Debounce chart updates
- Use requestAnimationFrame for smooth animations
- Implement data pagination for large datasets
- Cache API responses when appropriate

### Scalability
- Stateless API design allows horizontal scaling
- Database can be migrated to PostgreSQL/MySQL
- Add load balancer for multiple backend instances
- Use message queue (RabbitMQ/Kafka) for high-volume data

