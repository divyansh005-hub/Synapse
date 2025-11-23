const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { parse } = require('csv-parse/sync');

const PORT = 8081;
const DATA_DIR = path.join(__dirname, 'machine_feed');

// Store all machine data in memory
const machineData = {};
const machineCursors = {}; // Track current row index for each machine

// Load all CSV files
function loadData() {
    console.log('Loading CSV data...');
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));

    files.forEach(file => {
        const machineId = file.replace(/_/g, ' ').replace('.csv', '');
        const content = fs.readFileSync(path.join(DATA_DIR, file));

        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        machineData[machineId] = records;
        machineCursors[machineId] = 0;
        console.log(`Loaded ${records.length} rows for ${machineId}`);
    });
    console.log(`Total machines loaded: ${Object.keys(machineData).length}`);
}

// Create HTTP Server to serve static files
const server = http.createServer((req, res) => {
    // Default to index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Map to static directory
    const staticDir = path.join(__dirname, 'src', 'main', 'resources', 'static');
    let fullPath = path.join(staticDir, filePath);

    // Get extension
    const extname = path.extname(fullPath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start WebSocket Server attached to HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial machine list
    const machineList = Object.keys(machineData).map(id => ({
        machineId: id,
        status: 'OFFLINE' // Initial state
    }));

    ws.send(JSON.stringify({
        type: 'init',
        machines: machineList
    }));

    ws.on('close', () => console.log('Client disconnected'));
});

server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

// Broadcast loop
setInterval(() => {
    const updates = [];

    Object.keys(machineData).forEach(machineId => {
        const records = machineData[machineId];
        let cursor = machineCursors[machineId];

        // Get current record
        const record = records[cursor];

        // Advance cursor, loop if needed
        cursor++;
        if (cursor >= records.length) {
            cursor = 0;
        }
        machineCursors[machineId] = cursor;

        // Construct payload
        const update = {
            machineId: machineId,
            timestamp: Date.now(),
            status: determineStatus(record),
            sensors: {
                temperature: parseFloat(record.temperature),
                vibration: parseFloat(record.vibration),
                rpm: parseInt(record.rpm),
                load: parseFloat(record.load),
                pressure: parseFloat(record.pressure),
                humidity: parseFloat(record.humidity),
                power: parseFloat(record.load) * 0.75 // Simulated power
            },
            consumables: {
                oil: parseFloat(record.oil_pct),
                coolant: parseFloat(record.coolant_pct),
                hydraulic: parseFloat(record.hydraulic_oil_pct),
                brake_fluid: parseFloat(record.brake_fluid_pct),
                filter: parseFloat(record.filter_clog_pct)
            },
            spares: {
                bearing_wear: parseFloat(record.bearing_wear),
                drive_belt_wear: parseFloat(record.drive_belt_wear),
                motor_health: parseFloat(record.motor_health_pct)
            },
            kpi: {
                efficiency: parseFloat(record.efficiency_pct),
                usage_hours: parseFloat(record.usage_hours)
            },
            anomaly: detectAnomaly(record)
        };

        updates.push(update);
    });

    // Broadcast to all clients
    const payload = JSON.stringify({
        type: 'update',
        data: updates
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });

}, 1000); // 1 second interval

function determineStatus(record) {
    const temp = parseFloat(record.temperature);
    const vib = parseFloat(record.vibration);

    // Less aggressive thresholds
    if (temp > 100 || vib > 8.0) return 'CRITICAL';
    if (temp > 90 || vib > 5.0) return 'WARNING';
    return 'OPERATIONAL';
}

function detectAnomaly(record) {
    const temp = parseFloat(record.temperature);
    const vib = parseFloat(record.vibration);
    const oil = parseFloat(record.oil_pct);
    const motor = parseFloat(record.motor_health_pct);

    if (temp > 105) return { type: 'Overheating', severity: 'CRITICAL', message: `High Temp: ${temp.toFixed(1)}°C` };
    if (vib > 9.0) return { type: 'Vibration', severity: 'CRITICAL', message: `High Vibration: ${vib.toFixed(1)}mm/s` };
    if (oil < 10) return { type: 'Low Oil', severity: 'WARNING', message: 'Oil level critical' };
    if (motor < 40) return { type: 'Motor Wear', severity: 'WARNING', message: 'Motor health low' };

    return null;
}

// Initialize
loadData();
