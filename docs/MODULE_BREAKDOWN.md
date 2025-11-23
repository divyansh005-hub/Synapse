# Module-by-Module Breakdown

## Module 1: WebSocket Server (`csv-streamer.js`)

### Purpose
Core Node.js server that handles WebSocket connections, CSV data streaming, and HTTP file serving.

### Functionality
1. **CSV Data Loading**
   - Reads all CSV files from `machine_feed/` directory at startup
   - Parses CSV using `csv-parse/sync` library
   - Stores all data in memory for fast access
   - Tracks cursor position for each machine

2. **HTTP Server**
   - Serves static files from `src/main/resources/static/`
   - Handles content types (HTML, CSS, JS, images)
   - Runs on port 8081

3. **WebSocket Server**
   - Attached to HTTP server
   - Handles client connections
   - Sends initial machine list on connection
   - Broadcasts updates every 1 second

4. **Data Broadcasting**
   - Reads next row from each machine's CSV
   - Determines machine status (OPERATIONAL/WARNING/CRITICAL)
   - Detects anomalies (overheating, vibration, low oil, motor wear)
   - Constructs JSON payload with sensors, consumables, spares, KPIs
   - Broadcasts to all connected WebSocket clients

### Dependencies
- `ws` (WebSocket library)
- `csv-parse/sync` (CSV parsing)
- `fs`, `path`, `http` (Node.js built-in)

---

## Module 2: CSV Data Files (`machine_feed/`)

### Purpose
Synthetic sensor data for 30 production machines.

### Structure
- **Files**: 30 CSV files (Machine_1.csv to Machine_30.csv)
- **Rows**: Variable number of data points per machine
- **Columns**:
  - **Sensors**: temperature, vibration, rpm, load, pressure, humidity
  - **Consumables**: oil_pct, coolant_pct, hydraulic_oil_pct, brake_fluid_pct, filter_clog_pct
  - **Spare Parts**: bearing_wear, drive_belt_wear, motor_health_pct
  - **KPIs**: efficiency_pct, usage_hours

### Data Characteristics
- Realistic sensor ranges
- Gradual wear patterns
- Occasional anomalies
- Consumable depletion over time

---

## Module 3: WebSocket Client (`dashboard_ws.js`)

### Purpose
Frontend WebSocket connection handler.

### Functionality
1. **Connection Management**
   - Establishes WebSocket connection to server
   - Auto-detects hostname (works for localhost and network IP)
   - Handles connection open, close, error events

2. **Auto-Reconnect**
   - Reconnects automatically on disconnect
   - 3-second reconnect interval

3. **Message Handling**
   - Parses incoming JSON messages
   - Routes to appropriate handlers:
     - `init`: Initialize machine list
     - `update`: Update machine data

4. **Status Display**
   - Updates connection status indicator
   - Shows "LIVE STREAM" when connected
   - Shows "OFFLINE" when disconnected

### Dependencies
- Browser WebSocket API
- `Dashboard`, `Analytics`, `Alerts`, `MachineDetail` modules

---

## Module 4: Dashboard Logic (`dashboard.js`)

### Purpose
Main dashboard UI logic and state management.

### Functionality
1. **Machine Initialization**
   - Creates machine cards from initial data
   - Sets up UI elements

2. **Real-time Updates**
   - Updates machine status indicators
   - Updates sensor values
   - Updates consumable levels
   - Updates spare part wear

3. **Machine Cards**
   - Color-coded status (green/yellow/red)
   - Displays key metrics
   - Click to view details

4. **Charts**
   - Real-time sensor charts using Chart.js
   - Historical data visualization
   - Multiple sensor types

### Dependencies
- Chart.js
- TailwindCSS
- `dashboard_ws.js`

---

## Module 5: Analytics Module (`analytics.js`)

### Purpose
Calculate and display system-wide analytics and KPIs.

### Functionality
1. **Active Machines Count**
   - Counts machines in OPERATIONAL status
   - Updates in real-time

2. **Critical Alerts Count**
   - Counts machines in CRITICAL status
   - Highlights urgent issues

3. **Average Efficiency**
   - Calculates mean efficiency across all machines
   - Displays as percentage

4. **Trend Analysis**
   - Tracks metrics over time
   - Identifies patterns

### Dependencies
- Dashboard data

---

## Module 6: Alerts Module (`alerts.js`)

### Purpose
Detect and display anomaly alerts.

### Functionality
1. **Anomaly Detection**
   - Checks for anomalies in incoming data
   - Categorizes by severity (CRITICAL/WARNING)

2. **Alert Display**
   - Shows alert notifications
   - Color-coded by severity
   - Includes machine ID and message

3. **Alert Types**
   - Overheating (temp > 105°C)
   - High Vibration (vib > 9.0 mm/s)
   - Low Oil (oil < 10%)
   - Motor Wear (health < 40%)

### Dependencies
- Dashboard data

---

## Module 7: Machine Detail View (`machine-detail.js`)

### Purpose
Detailed view for individual machine monitoring.

### Functionality
1. **Detail Panel**
   - Shows all sensors for selected machine
   - Displays consumable levels
   - Shows spare part status
   - Displays KPIs

2. **Historical Charts**
   - Sensor trends over time
   - Consumable depletion
   - Efficiency tracking

3. **Update Handling**
   - Updates detail view when machine data changes
   - Only updates if detail panel is open

### Dependencies
- Chart.js
- Dashboard data

---

## Module 8: UI Styling (`styles.css`, TailwindCSS)

### Purpose
Modern, responsive UI design.

### Features
1. **Glassmorphism**
   - Frosted glass effect
   - Backdrop blur
   - Semi-transparent backgrounds

2. **Dark Mode**
   - Dark color scheme
   - High contrast
   - Reduced eye strain

3. **Gradients**
   - Vibrant color gradients
   - Status-based colors
   - Visual hierarchy

4. **Micro-animations**
   - Smooth transitions
   - Hover effects
   - Loading states

5. **Responsive Design**
   - Works on desktop and mobile
   - Flexible layouts
   - Adaptive components

### Dependencies
- TailwindCSS (via CDN)
- Custom CSS

---

## Module 9: One-Click Launcher (`run_all.bat`)

### Purpose
Simplified startup for Windows users.

### Functionality
1. **Dependency Check**
   - Checks if Node.js is installed
   - Checks if npm packages are installed

2. **Auto-Install**
   - Runs `npm install` if needed

3. **Server Start**
   - Starts `csv-streamer.js`
   - Waits for server to be ready

4. **Browser Launch**
   - Opens default browser
   - Navigates to `http://localhost:8081`

### Dependencies
- Node.js
- npm

---

## Module 10: API Utilities (`api.js`)

### Purpose
Helper functions for API communication (legacy/future use).

### Functionality
- HTTP request helpers
- Error handling
- Response parsing

### Note
Currently not actively used since WebSocket handles all real-time communication.

---

## Module Interaction Flow

```
CSV Files (machine_feed/)
    ↓ (loaded at startup)
csv-streamer.js
    ├→ Parses CSV data
    ├→ Stores in memory
    ├→ Tracks cursors
    └→ Broadcasts every 1 second
        ↓ (WebSocket)
dashboard_ws.js
    ├→ Receives messages
    ├→ Routes to handlers
    └→ Updates UI modules
        ├→ dashboard.js (machine cards, charts)
        ├→ analytics.js (KPIs)
        ├→ alerts.js (notifications)
        └→ machine-detail.js (detail view)
```

## Integration Points

1. **CSV → Server**: File system read, CSV parsing
2. **Server → Clients**: WebSocket JSON messages
3. **WebSocket Client → UI Modules**: JavaScript function calls
4. **UI Modules → DOM**: Direct DOM manipulation
5. **Charts → Data**: Chart.js data binding

## Data Flow Summary

1. **Startup**: Load all CSV files into memory
2. **Every Second**: 
   - Read next row for each machine
   - Determine status and anomalies
   - Broadcast via WebSocket
3. **Client Receives**: 
   - Parse JSON message
   - Update machine cards
   - Update charts
   - Update analytics
   - Show alerts if needed

## Technology Stack by Module

| Module | Technology |
|--------|-----------|
| WebSocket Server | Node.js, ws library |
| CSV Parsing | csv-parse/sync |
| HTTP Server | Node.js http module |
| WebSocket Client | Browser WebSocket API |
| Dashboard UI | HTML5, JavaScript (ES6+) |
| Styling | TailwindCSS, Custom CSS |
| Charts | Chart.js |
| Launcher | Windows Batch Script |

