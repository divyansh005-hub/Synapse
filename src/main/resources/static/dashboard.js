const Navigation = {
    currentView: 'dashboard',

    switch(viewId) {
        this.currentView = viewId;

        // Update Sidebar Active State
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('bg-blue-600/10', 'text-blue-400', 'border', 'border-blue-600/20');
            el.classList.add('text-gray-400', 'hover:bg-gray-800/50', 'hover:text-gray-200');
        });

        const activeNav = document.getElementById(`nav-${viewId}`);
        if (activeNav) {
            activeNav.classList.remove('text-gray-400', 'hover:bg-gray-800/50', 'hover:text-gray-200');
            activeNav.classList.add('bg-blue-600/10', 'text-blue-400', 'border', 'border-blue-600/20');
        }

        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

        // Show current view
        document.getElementById(`view-${viewId}`).classList.remove('hidden');

        // Update Header
        const titles = {
            'dashboard': ['Production Overview', 'Real-time monitoring of critical assets'],
            'machines': ['Machine Registry', 'Detailed status of all connected units'],
            'performance': ['Performance Analytics', 'Load distribution and efficiency metrics'],
            'consumables': ['Consumables Status', 'Oil, coolant, hydraulic, and brake fluids'],
            'spares': ['Spare Parts Health', 'Component wear and replacement tracking'],
            'predictions': ['Failure Prediction', 'AI-driven insights and risk analysis'],
            'schedule': ['Maintenance Schedule', 'Upcoming planned downtime'],
            'repairs': ['Maintenance Log', 'Recent repairs and automated fixes'],
            'alerts': ['System Alerts', 'History of anomalies and warnings']
        };

        const [title, subtitle] = titles[viewId] || titles['dashboard'];
        document.getElementById('page-title').textContent = title;
        document.getElementById('page-subtitle').textContent = subtitle;

        // Trigger render for the new view immediately if data exists
        if (Dashboard.lastData) {
            Dashboard.renderCurrentView(Dashboard.lastData);
        }
    }
};

const Dashboard = {
    charts: {},
    lastData: null,
    scheduleData: [
        { id: 'CNC Lathe A12', task: 'Coolant Flush', date: 'Tomorrow, 08:00 AM', tech: 'J. Doe' },
        { id: 'Hydraulic Press 07', task: 'Seal Inspection', date: 'Nov 25, 02:00 PM', tech: 'A. Smith' },
        { id: 'Conveyor Line 03', task: 'Belt Tensioning', date: 'Nov 26, 10:00 AM', tech: 'M. Johnson' },
        { id: 'Welding Station 02', task: 'Electrode Check', date: 'Nov 27, 09:30 AM', tech: 'K. Davis' }
    ],

    init() {
        DashboardWS.connect();
        this.initCharts();
    },

    initCharts() {
        // Global Temp Chart
        const ctxTemp = document.getElementById('tempChart').getContext('2d');
        this.charts.temp = new Chart(ctxTemp, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    label: 'Avg Temperature',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 50, max: 100 },
                    x: { display: false }
                },
                animation: false
            }
        });

        // Global Vib Chart
        const ctxVib = document.getElementById('vibChart').getContext('2d');
        this.charts.vib = new Chart(ctxVib, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    label: 'Avg Vibration',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 0, max: 5 },
                    x: { display: false }
                },
                animation: false
            }
        });

        // Performance Charts (Lazy Init)
        this.charts.perfLoad = null;
        this.charts.perfEff = null;
    },

    initMachines(machines) {
        // Called when WebSocket first connects with initial machine list
        console.log('Initializing dashboard with', machines.length, 'machines');
        // No need to render anything yet, wait for first update
    },

    updateMachines(updates) {
        this.lastData = updates;
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString();

        // Always update Dashboard components (KPIs, Charts) as they are global
        this.updateDashboardComponents(updates);

        // Render specific view content
        this.renderCurrentView(updates);
    },

    renderCurrentView(updates) {
        switch (Navigation.currentView) {
            case 'dashboard':
                break;
            case 'machines':
                this.renderMachinesTable(updates);
                break;
            case 'performance':
                this.renderPerformance(updates);
                break;
            case 'consumables':
                this.renderConsumables(updates);
                break;
            case 'spares':
                this.renderSpares(updates);
                break;
            case 'predictions':
                this.renderPredictions(updates);
                break;
            case 'schedule':
                this.renderSchedule(updates);
                break;
            case 'repairs':
                this.renderRepairs(updates);
                break;
            case 'alerts':
                this.renderAlertsView(updates);
                break;
        }
    },

    updateDashboardComponents(updates) {
        let totalTemp = 0;
        let totalVib = 0;
        let running = 0;
        let idle = 0;
        let fault = 0;
        let predictedFailures = 0;

        updates.forEach(data => {
            totalTemp += data.sensors.temperature;
            totalVib += data.sensors.vibration;

            if (data.status === 'OPERATIONAL') running++;
            else if (data.status === 'WARNING') idle++;
            else if (data.status === 'CRITICAL') fault++;

            // Consistent Prediction Logic
            // Bearing Wear > 8% (Scale 0-10) OR Motor Health < 40%
            if (data.spares.bearing_wear > 8.0 || data.spares.motor_health < 40) {
                predictedFailures++;
            }
        });

        // Update KPIs
        document.getElementById('kpi-running').textContent = running;
        document.getElementById('kpi-idle').textContent = idle;
        document.getElementById('kpi-fault').textContent = fault;
        document.getElementById('kpi-failures').textContent = predictedFailures;

        // Update Charts
        const avgTemp = totalTemp / updates.length;
        const avgVib = totalVib / updates.length;

        this.pushData(this.charts.temp, avgTemp);
        this.pushData(this.charts.vib, avgVib);
    },

    renderMachinesTable(updates) {
        const tbody = document.getElementById('machines-table-body');
        tbody.innerHTML = updates.map(m => `
            <tr class="hover:bg-gray-800/50 transition-colors border-b border-gray-800">
                <td class="p-4 font-medium text-white">${m.machineId}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${this.getStatusBadge(m.status)}">${m.status}</span></td>
                <td class="p-4 font-mono">${m.sensors.temperature.toFixed(1)}°C</td>
                <td class="p-4 font-mono">${m.sensors.vibration.toFixed(2)} mm/s</td>
                <td class="p-4 font-mono">${m.sensors.rpm}</td>
                <td class="p-4 font-mono text-blue-400">${m.kpi.efficiency.toFixed(1)}%</td>
                <td class="p-4">
                    <button onclick="MachineDetail.open('${m.machineId}')" class="text-blue-500 hover:text-blue-400 text-sm">Details</button>
                </td>
            </tr>
        `).join('');
    },

    renderPerformance(updates) {
        // Init Charts if needed
        if (!this.charts.perfLoad) {
            const ctxLoad = document.getElementById('perf-load-chart').getContext('2d');
            this.charts.perfLoad = new Chart(ctxLoad, {
                type: 'bar',
                data: {
                    labels: updates.slice(0, 10).map(m => m.machineId.split(' ').pop()), // Short names
                    datasets: [{
                        label: 'Load (%)',
                        data: updates.slice(0, 10).map(m => m.sensors.load),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, max: 100 },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });

            const ctxEff = document.getElementById('perf-eff-chart').getContext('2d');
            this.charts.perfEff = new Chart(ctxEff, {
                type: 'line',
                data: {
                    labels: updates.slice(0, 10).map(m => m.machineId.split(' ').pop()),
                    datasets: [{
                        label: 'Efficiency (%)',
                        data: updates.slice(0, 10).map(m => m.kpi.efficiency),
                        borderColor: '#10b981',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' }, min: 80, max: 100 },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        } else {
            // Update Data
            this.charts.perfLoad.data.datasets[0].data = updates.slice(0, 10).map(m => m.sensors.load);
            this.charts.perfLoad.update('none');

            this.charts.perfEff.data.datasets[0].data = updates.slice(0, 10).map(m => m.kpi.efficiency);
            this.charts.perfEff.update('none');
        }

        // Top Performers Table
        const tbody = document.getElementById('perf-table-body');
        const sorted = [...updates].sort((a, b) => b.kpi.efficiency - a.kpi.efficiency).slice(0, 5);
        tbody.innerHTML = sorted.map(m => `
            <tr class="hover:bg-gray-800/50 transition-colors border-b border-gray-800">
                <td class="p-4 font-medium text-white">${m.machineId}</td>
                <td class="p-4 font-bold text-green-400">${m.kpi.efficiency.toFixed(1)}%</td>
                <td class="p-4 font-mono">${m.kpi.usage_hours.toFixed(0)} h</td>
                <td class="p-4">
                    <div class="flex text-yellow-500 text-xs">
                        <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderConsumables(updates) {
        const grid = document.getElementById('consumables-grid');
        grid.innerHTML = updates.map(m => `
            <div class="bg-[#1e293b] p-5 rounded-xl border border-gray-700">
                <div class="flex justify-between mb-4">
                    <h3 class="font-bold text-white">${m.machineId}</h3>
                    <span class="text-xs text-gray-500">ID: ${m.machineId.substring(0, 3)}</span>
                </div>
                <div class="space-y-4">
                    ${this.renderProgressBar('Oil Level', m.consumables.oil, 'blue')}
                    ${this.renderProgressBar('Coolant', m.consumables.coolant, 'cyan')}
                    ${this.renderProgressBar('Hydraulic Fluid', m.consumables.hydraulic, 'indigo')}
                    ${this.renderProgressBar('Brake Fluid', m.consumables.brake_fluid, 'purple')}
                    ${this.renderProgressBar('Filter Health', 100 - m.consumables.filter, 'green')}
                </div>
            </div>
        `).join('');
    },

    renderProgressBar(label, value, color) {
        return `
            <div>
                <div class="flex justify-between text-xs mb-1 text-gray-400"><span>${label}</span> <span>${value.toFixed(0)}%</span></div>
                <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-${color}-500" style="width: ${value}%"></div></div>
            </div>
        `;
    },

    renderSpares(updates) {
        const grid = document.getElementById('spares-grid');
        grid.innerHTML = updates.map(m => {
            const bearingHealth = 100 - (m.spares.bearing_wear * 100);
            const beltHealth = 100 - (m.spares.drive_belt_wear * 100);
            const motorHealth = m.spares.motor_health;

            return `
            <div class="bg-[#1e293b] p-5 rounded-xl border border-gray-700">
                <h3 class="font-bold text-white mb-4">${m.machineId}</h3>
                <div class="space-y-4">
                    ${this.renderHealthItem('Main Bearing', bearingHealth)}
                    ${this.renderHealthItem('Drive Belt', beltHealth)}
                    ${this.renderHealthItem('Motor Unit', motorHealth)}
                </div>
            </div>
        `}).join('');
    },

    renderHealthItem(label, health) {
        const color = health < 40 ? 'text-red-500' : (health < 70 ? 'text-yellow-500' : 'text-green-500');
        return `
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-400">${label}</span>
                <span class="font-mono font-bold ${color}">${health.toFixed(1)}%</span>
            </div>
        `;
    },

    renderPredictions(updates) {
        const tbody = document.getElementById('predictions-table-body');

        // FIXED LOGIC: bearing_wear is 0-10 scale.
        // > 8.0 is High/Critical. > 5.0 is Medium.

        const risks = updates.map(m => {
            let risk = 'Low';
            let factor = 'None';
            let failureTime = 'N/A';
            let rec = 'Routine Maintenance';

            const bearingWear = m.spares.bearing_wear; // 0-10
            const motorHealth = m.spares.motor_health; // 0-100
            const temp = m.sensors.temperature;

            if (bearingWear > 8.0 || temp > 105 || motorHealth < 40) {
                risk = 'Critical';
                factor = bearingWear > 8.0 ? 'Bearing Failure' : (temp > 105 ? 'Overheating' : 'Motor Failure');
                failureTime = '< 24 Hours';
                rec = 'Immediate Replacement';
            } else if (bearingWear > 5.0 || temp > 95 || motorHealth < 60) {
                risk = 'High';
                factor = bearingWear > 5.0 ? 'Bearing Wear' : (temp > 95 ? 'High Temp' : 'Motor Wear');
                failureTime = '2-3 Days';
                rec = 'Schedule Inspection';
            } else if (bearingWear > 3.0 || temp > 85) {
                risk = 'Medium';
                factor = 'Component Wear';
                failureTime = '1 Week';
                rec = 'Monitor Closely';
            }

            return { ...m, risk, factor, failureTime, rec };
        }).sort((a, b) => {
            const riskScore = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
            return riskScore[b.risk] - riskScore[a.risk];
        });

        tbody.innerHTML = risks.map(m => `
            <tr class="hover:bg-gray-800/50 transition-colors border-b border-gray-800">
                <td class="p-4 font-medium text-white">${m.machineId}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${this.getRiskBadge(m.risk)}">${m.risk}</span></td>
                <td class="p-4 text-gray-400">${m.factor}</td>
                <td class="p-4 font-mono text-white">${m.failureTime}</td>
                <td class="p-4 text-blue-400">${m.rec}</td>
            </tr>
        `).join('');
    },

    renderSchedule(updates) {
        const list = document.getElementById('schedule-list');

        list.innerHTML = this.scheduleData.map(item => `
            <div class="p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-blue-600/10 text-blue-500 font-bold text-center w-16">
                        <div class="text-xs uppercase">Nov</div>
                        <div class="text-lg">25</div>
                    </div>
                    <div>
                        <div class="font-bold text-white">${item.task}</div>
                        <div class="text-sm text-gray-400">${item.id}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-white">${item.date}</div>
                    <div class="text-xs text-gray-500">Tech: ${item.tech}</div>
                </div>
            </div>
        `).join('');
    },

    openScheduleModal() {
        document.getElementById('schedule-modal').classList.remove('hidden');
    },

    closeScheduleModal() {
        document.getElementById('schedule-modal').classList.add('hidden');
    },

    addScheduleTask() {
        const machine = document.getElementById('sched-machine').value;
        const task = document.getElementById('sched-task').value;
        const tech = document.getElementById('sched-tech').value;
        const date = document.getElementById('sched-date').value;

        if (machine && task) {
            this.scheduleData.push({
                id: machine,
                task: task,
                date: date || 'Pending',
                tech: tech || 'Unassigned'
            });
            this.closeScheduleModal();
            this.renderSchedule(); // Re-render
        }
    },

    getRiskBadge(risk) {
        if (risk === 'Critical') return 'bg-red-500/10 text-red-500';
        if (risk === 'High') return 'bg-orange-500/10 text-orange-500';
        if (risk === 'Medium') return 'bg-yellow-500/10 text-yellow-500';
        return 'bg-green-500/10 text-green-500';
    },

    renderRepairs(updates) {
        const list = document.getElementById('repairs-list');

        // 1. Detect "Live" Repairs (Machines in excellent condition)
        const liveRepairs = updates.filter(m => {
            // Relaxed thresholds: Oil > 98% or Bearing Wear < 0.5 (on 0-10 scale)
            return (m.spares.bearing_wear < 0.5) || (m.consumables.oil > 98.0);
        }).slice(0, 5);

        // 2. Mock Historical Repairs (to ensure list isn't empty)
        const history = [
            { id: 'Hydraulic Press 07', action: 'Seal Replacement', date: 'Yesterday, 4:30 PM' },
            { id: 'Conveyor Line 03', action: 'Belt Tensioning', date: 'Yesterday, 2:15 PM' },
            { id: 'CNC Lathe A12', action: 'Coolant Flush', date: 'Yesterday, 11:00 AM' },
            { id: 'Welding Station 02', action: 'Electrode Change', date: 'Yesterday, 09:45 AM' }
        ];

        let html = '';

        // Render Live
        if (liveRepairs.length > 0) {
            html += liveRepairs.map(m => `
                <div class="p-4 flex items-center gap-4 bg-blue-500/5 border-l-2 border-blue-500">
                    <div class="p-2 rounded bg-blue-500/10 text-blue-500">
                        <i class="fa-solid fa-rotate"></i>
                    </div>
                    <div>
                        <div class="font-bold text-white">Recent Maintenance</div>
                        <div class="text-sm text-gray-400">System detected optimal health</div>
                        <div class="text-xs text-gray-500 mt-1">Machine: ${m.machineId}</div>
                    </div>
                    <div class="ml-auto text-xs font-mono text-gray-500">
                        Just Now
                    </div>
                </div>
            `).join('');
        }

        // Render History
        html += history.map(h => `
            <div class="p-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                <div class="p-2 rounded bg-green-500/10 text-green-500">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div>
                    <div class="font-bold text-white">${h.action}</div>
                    <div class="text-sm text-gray-400">Scheduled Maintenance Log</div>
                    <div class="text-xs text-gray-500 mt-1">Machine: ${h.id}</div>
                </div>
                <div class="ml-auto text-xs font-mono text-gray-500">
                    ${h.date}
                </div>
            </div>
        `).join('');

        list.innerHTML = html;
    },

    renderAlertsView(updates) {
        const list = document.getElementById('alerts-list');
        const alerts = updates.filter(m => m.anomaly).map(m => m.anomaly);

        if (alerts.length === 0) {
            list.innerHTML = '<div class="text-center text-gray-500 py-10">No active alerts</div>';
            return;
        }

        list.innerHTML = updates.filter(m => m.anomaly).map(m => `
            <div class="p-4 rounded-lg border bg-gray-800/50 border-gray-700 flex items-start gap-4">
                <div class="p-2 rounded bg-gray-800 text-red-500">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                    <div class="font-bold text-white">${m.anomaly.type}</div>
                    <div class="text-sm text-gray-400">${m.anomaly.message}</div>
                    <div class="text-xs text-gray-500 mt-1">Machine: ${m.machineId}</div>
                </div>
                <div class="ml-auto text-xs font-bold px-2 py-1 rounded bg-red-500/10 text-red-500">
                    ${m.anomaly.severity}
                </div>
            </div>
        `).join('');
    },

    getStatusBadge(status) {
        if (status === 'CRITICAL') return 'bg-red-500/10 text-red-500';
        if (status === 'WARNING') return 'bg-yellow-500/10 text-yellow-500';
        return 'bg-green-500/10 text-green-500';
    },

    setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    pushData(chart, value) {
        if (!chart) return;
        const data = chart.data.datasets[0].data;
        if (data.length > 20) data.shift();
        data.push(value);
        chart.update('none');
    }
};

// Start
Dashboard.init();
