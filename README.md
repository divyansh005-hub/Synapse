# Real-Time Monitoring of Critical Production Machine's Spare Parts and Production Process Consumables

## Project Overview
A comprehensive real-time monitoring system for industrial machines that tracks sensor data, predicts failures, monitors consumables, and provides alerts through a web dashboard with live WebSocket streaming.

## Technology Stack
- **Backend**: Node.js (WebSocket streaming)
- **Data Source**: CSV files with synthetic sensor data
- **Frontend**: HTML5, CSS3, JavaScript (Chart.js, TailwindCSS)
- **Real-time**: WebSocket (ws library)
- **Alternative Backend**: Java 11+ with REST API (optional)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 14 or higher ([Download](https://nodejs.org/))
- Modern web browser (Chrome, Firefox, Edge)

### One-Click Run (Recommended)

**Windows:**
1. Double-click `run_all.bat` in the project root
2. Dashboard opens automatically at `http://localhost:8081`
3. Live data streams to your browser!

**Or create a desktop shortcut:**
1. Double-click `create_shortcut.bat` (one-time setup)
2. Use the "Synapse Dashboard" icon on your desktop

### Manual Run

```bash
# Install dependencies
npm install

# Start the data streamer
node csv-streamer.js

# Open dashboard in browser
# Navigate to: http://localhost:8081/index.html
```

## 📚 Documentation

- **One-Click Run:** See `ONE_CLICK_RUN.md` for complete guide
- **Quick Start:** See `QUICK_START.md` for setup instructions
- **Setup Help:** See `SETUP.md` for troubleshooting
- **Next Steps:** See `NEXT_STEPS.md` for detailed guide

## ✅ What's Included

- ✅ Real-time WebSocket data streaming
- ✅ 30 machines with synthetic sensor data
- ✅ Interactive dashboard with live charts
- ✅ Temperature, vibration, pressure, humidity sensors
- ✅ Consumables monitoring (oil, coolant, filters)
- ✅ Spare parts wear tracking
- ✅ Anomaly detection and alerts
- ✅ Modern glassmorphism UI with dark mode

## 🎯 Features

- **Real-time Monitoring**: Live sensor data updates every second
- **Multi-Machine Support**: Monitor 30 machines simultaneously
- **Sensor Types**: Temperature, Vibration, Pressure, RPM, Load, Humidity, Power
- **Consumables Tracking**: Oil, Coolant, Hydraulic Oil, Brake Fluid, Filters
- **Spare Parts**: Bearing wear, Drive belt wear, Motor health
- **Alerts**: Automatic anomaly detection with severity levels
- **Performance Metrics**: Efficiency tracking and KPIs

## 🌐 Access

- **Dashboard**: `http://localhost:8081/index.html`
- **WebSocket**: `ws://localhost:8081`
- **Data Source**: CSV files in `machine_feed/` directory

## 📁 Project Structure

```
Synapse/
├── run_all.bat              # One-click launcher
├── create_shortcut.bat      # Desktop shortcut creator
├── csv-streamer.js          # WebSocket data streamer
├── package.json             # Node.js dependencies
├── machine_feed/            # CSV data files (30 machines)
├── src/main/resources/static/
│   ├── index.html           # Main dashboard
│   ├── dashboard.js         # Dashboard logic
│   ├── dashboard_ws.js      # WebSocket connection
│   ├── styles.css           # Custom styles
│   └── *.js                 # Other modules
└── docs/                    # Documentation

```

## 🔧 Alternative: Java Backend

If you prefer the Java REST API backend:

### Prerequisites
- Java 11 or higher
- Maven 3.6+

### Build & Run

```bash
# Build
mvn clean install

# Start server (Terminal 1)
java -cp "target/classes;target/dependency/*" com.synapse.api.Server

# Start simulator (Terminal 2)
java -cp "target/classes;target/dependency/*" com.synapse.simulation.SensorSimulator

# Open dashboard
# Navigate to: src/main/resources/static/index.html
```

## 📖 Need Help?

- See `ONE_CLICK_RUN.md` for complete one-click setup guide
- See `TROUBLESHOOTING.md` for common issues
- See `docs/` folder for detailed documentation
