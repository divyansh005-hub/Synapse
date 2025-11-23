// Machine Detail Module
const MachineDetail = {
    currentMachine: null,
    charts: {},

    init() {
        console.log('Machine Detail module initialized');
        this.initCharts();
    },

    initCharts() {
        // Main Real-time Metrics Chart (Temp & Vibration)
        const ctxMain = document.getElementById('detail-chart-main').getContext('2d');
        this.charts.main = new Chart(ctxMain, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#ef4444', // Red
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Vibration (mm/s)',
                        data: [],
                        borderColor: '#f59e0b', // Orange
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { display: false },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                        min: 0,
                        max: 120
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#94a3b8' },
                        min: 0,
                        max: 10
                    }
                },
                animation: false
            }
        });

        // Secondary Power Analysis Chart (Efficiency & Load)
        const ctxSec = document.getElementById('detail-chart-secondary').getContext('2d');
        this.charts.secondary = new Chart(ctxSec, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [
                    {
                        label: 'Efficiency (%)',
                        data: [],
                        borderColor: '#10b981', // Green
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Load (%)',
                        data: [],
                        borderColor: '#3b82f6', // Blue
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { display: false },
                    y: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                        min: 0,
                        max: 100
                    }
                },
                animation: false
            }
        });
    },

    open(machineId) {
        console.log('Opening machine detail for:', machineId);

        // Reset charts if opening a new machine
        if (this.currentMachine !== machineId) {
            this.resetCharts();
        }

        this.currentMachine = machineId;
        const modal = document.getElementById('machine-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },

    close() {
        console.log('Closing machine detail');
        this.currentMachine = null;
        const modal = document.getElementById('machine-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    updateIfOpen(updates) {
        // Update machine detail modal if it's open
        if (!this.currentMachine) return;

        const machineData = updates.find(m => m.machineId === this.currentMachine);
        if (machineData) {
            this.updateData(machineData);
        }
    },

    updateData(data) {
        if (!this.currentMachine) return;
        // console.log('Updating machine detail data:', data);

        // Update modal content if elements exist
        const statusEl = document.getElementById('modal-status');
        const efficiencyEl = document.getElementById('modal-efficiency');
        const oilEl = document.getElementById('modal-oil');
        const coolantEl = document.getElementById('modal-coolant');
        const filterEl = document.getElementById('modal-filter');
        const bearingEl = document.getElementById('modal-bearing');
        const uptimeEl = document.getElementById('modal-uptime');

        if (statusEl) {
            statusEl.textContent = data.status;
            statusEl.className = `text-2xl font-bold ${data.status === 'CRITICAL' ? 'text-red-500' : (data.status === 'WARNING' ? 'text-yellow-500' : 'text-green-500')}`;
        }

        const statusDot = document.getElementById('modal-status-dot');
        if (statusDot) {
            statusDot.className = `h-3 w-3 rounded-full ${data.status === 'CRITICAL' ? 'bg-red-500' : (data.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500')}`;
        }

        if (efficiencyEl) efficiencyEl.textContent = data.kpi.efficiency.toFixed(1) + '%';
        if (oilEl) oilEl.textContent = data.consumables.oil.toFixed(0) + '%';
        if (coolantEl) coolantEl.textContent = data.consumables.coolant.toFixed(0) + '%';
        if (filterEl) filterEl.textContent = (100 - data.consumables.filter).toFixed(0) + '%';
        if (bearingEl) bearingEl.textContent = (100 - data.spares.bearing_wear * 10).toFixed(0) + '%';
        if (uptimeEl) uptimeEl.textContent = data.kpi.usage_hours.toFixed(1) + ' h';

        // Update progress bars
        const barOil = document.getElementById('bar-oil');
        const barCoolant = document.getElementById('bar-coolant');
        const barFilter = document.getElementById('bar-filter');

        if (barOil) barOil.style.width = data.consumables.oil + '%';
        if (barCoolant) barCoolant.style.width = data.consumables.coolant + '%';
        if (barFilter) barFilter.style.width = (100 - data.consumables.filter) + '%';

        // Update Ring Chart for Bearing
        const ringBearing = document.getElementById('ring-bearing');
        if (ringBearing) {
            // Circumference is ~251.2
            const bearingHealth = 100 - (data.spares.bearing_wear * 10);
            const offset = 251.2 - (251.2 * bearingHealth / 100);
            ringBearing.style.strokeDashoffset = offset;
            ringBearing.classList.remove('text-green-500', 'text-yellow-500', 'text-red-500');
            ringBearing.classList.add(bearingHealth < 40 ? 'text-red-500' : (bearingHealth < 70 ? 'text-yellow-500' : 'text-green-500'));
        }

        // Update Charts
        this.pushData(this.charts.main, 0, data.sensors.temperature);
        this.pushData(this.charts.main, 1, data.sensors.vibration);

        this.pushData(this.charts.secondary, 0, data.kpi.efficiency);
        this.pushData(this.charts.secondary, 1, data.sensors.load);
    },

    resetCharts() {
        if (this.charts.main) {
            this.charts.main.data.datasets.forEach(ds => ds.data = []);
            this.charts.main.update();
        }
        if (this.charts.secondary) {
            this.charts.secondary.data.datasets.forEach(ds => ds.data = []);
            this.charts.secondary.update();
        }
    },

    pushData(chart, datasetIndex, value) {
        if (!chart) return;
        const data = chart.data.datasets[datasetIndex].data;
        if (data.length > 20) data.shift();
        data.push(value);
        chart.update('none');
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MachineDetail.init());
} else {
    MachineDetail.init();
}
