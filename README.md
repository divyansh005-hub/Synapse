# Synapse: Industrial IoT Monitoring System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)
![Status](https://img.shields.io/badge/Status-Active-success)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **Real-time industrial asset monitoring with predictive AI and live WebSocket streaming.**

Synapse is a comprehensive dashboard for monitoring critical production machinery. It simulates a factory floor with 30+ machines, tracking sensor data (temperature, vibration, load), monitoring consumables, and predicting failures using AI-driven logic.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **⚡ Real-time Monitoring** | Live sensor data streaming via WebSockets with sub-second latency. |
| **🤖 Failure Prediction** | AI algorithms analyze wear patterns to predict component failures before they happen. |
| **📊 Interactive Dashboard** | Glassmorphism UI with dynamic Chart.js visualizations for deep data analysis. |
| **🏭 Multi-Machine Sim** | Simulates a realistic factory environment with 30+ CNCs, Presses, and Welders. |
| **🚨 Smart Alerts** | Automated anomaly detection system with severity-based alerting. |

## 🛠️ Tech Stack

- **Core**: ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)
- **Frontend**: ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)
- **Visualization**: ![Chart.js](https://img.shields.io/badge/-Chart.js-FF6384?logo=chart.js&logoColor=white)
- **Communication**: WebSocket (`ws`)

## 🏁 Quick Start

### Prerequisites
- **Node.js** 14+ installed.

### One-Click Run (Windows)
Double-click `run_all.bat` in the root directory. This will:
1. Install dependencies.
2. Start the data stream.
3. Launch the dashboard in your browser.

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Start the data streamer
node csv-streamer.js

# 3. Open the dashboard
# Visit http://localhost:8081 in your browser
```

## 📂 Project Structure

```
Synapse/
├── machine_feed/       # Synthetic sensor data (CSV)
├── src/
│   └── main/
│       └── resources/
│           └── static/ # Frontend assets (HTML, JS, CSS)
├── docs/               # Detailed documentation
├── csv-streamer.js     # WebSocket server & Data streamer
└── run_all.bat         # Launcher script
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Project Summary](docs/PROJECT_SUMMARY.md)
- [Module Breakdown](docs/MODULE_BREAKDOWN.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by Divyansh Bhatt*
