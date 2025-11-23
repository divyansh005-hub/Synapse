// Shared API and WebSocket utilities
const API_BASE = '/api';
const WS_BASE = 'ws://localhost:8081/ws';

// API Helper Functions
const API = {
    async getMachines() {
        try {
            const response = await fetch(`${API_BASE}/machines`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched machines:', data);
            return data;
        } catch (error) {
            console.error('Error fetching machines:', error);
            return [];
        }
    },

    async getMachine(id) {
        const response = await fetch(`${API_BASE}/machines/${id}`);
        return response.json();
    },

    async getMachineSpares(id) {
        const response = await fetch(`${API_BASE}/machines/${id}/spares`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async getMachineConsumables(id) {
        const response = await fetch(`${API_BASE}/machines/${id}/consumables`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    },

    async getAlerts(severity = null) {
        const url = severity
            ? `${API_BASE}/alerts/live?severity=${severity}`
            : `${API_BASE}/alerts/live`;
        const response = await fetch(url);
        return response.json();
    },

    async acknowledgeAlert(alertId) {
        const response = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
            method: 'POST'
        });
        return response.ok;
    },

    async getConsumables(machineId) {
        const response = await fetch(`${API_BASE}/consumables?machineId=${machineId}`);
        return response.json();
    },

    async getConsumableForecast(machineId, days = 7) {
        const response = await fetch(`${API_BASE}/consumables/forecast?machineId=${machineId}&days=${days}`);
        return response.json();
    },

    async getSparePartsRemainingLife(machineId = null) {
        const url = machineId
            ? `${API_BASE}/spares/remaining-life?machineId=${machineId}`
            : `${API_BASE}/spares/remaining-life`;
        const response = await fetch(url);
        return response.json();
    },

    async getSparePartsRecommendations() {
        const response = await fetch(`${API_BASE}/spares/recommendations`);
        return response.json();
    },

    async getAnalyticsEfficiency() {
        const response = await fetch(`${API_BASE}/analytics/efficiency`);
        return response.json();
    },

    async getAnalyticsFailurePatterns() {
        const response = await fetch(`${API_BASE}/analytics/failure-patterns`);
        return response.json();
    },

    async getAnalyticsUptime() {
        const response = await fetch(`${API_BASE}/analytics/uptime`);
        return response.json();
    },

    async getAnalyticsMTBF() {
        const response = await fetch(`${API_BASE}/analytics/mtbf`);
        return response.json();
    }
};

// WebSocket Manager
class WebSocketManager {
    constructor(url, onMessage) {
        this.url = url;
        this.onMessage = onMessage;
        this.socket = null;
        this.reconnectInterval = 3000;
        this.shouldReconnect = true;
    }

    connect() {
        try {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log('WebSocket connected:', this.url);
                if (this.onOpen) this.onOpen();
            };

            this.socket.onmessage = (event) => {
                if (this.onMessage) {
                    this.onMessage(JSON.parse(event.data));
                }
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected:', this.url);
                if (this.shouldReconnect) {
                    setTimeout(() => this.connect(), this.reconnectInterval);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (this.onError) this.onError(error);
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            if (this.shouldReconnect) {
                setTimeout(() => this.connect(), this.reconnectInterval);
            }
        }
    }

    disconnect() {
        this.shouldReconnect = false;
        if (this.socket) {
            this.socket.close();
        }
    }

    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }
}

// Navigation Helper
const Navigation = {
    navigate(page) {
        window.location.href = page;
    },

    setActiveNavItem(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-gray-700', 'text-white');
            item.classList.add('text-gray-400');
        });

        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.remove('text-gray-400');
            activeItem.classList.add('bg-gray-700', 'text-white');
        }
    }
};

// Chart Helper
const ChartHelper = {
    createLineChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#9CA3AF' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                    },
                    y: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                    }
                },
                ...options
            }
        });
    },

    createBarChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#9CA3AF' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                    },
                    y: {
                        grid: { color: '#374151' },
                        ticks: { color: '#9CA3AF' }
                    }
                },
                ...options
            }
        });
    },

    createPieChart(ctx, data, options = {}) {
        return new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#9CA3AF' }
                    }
                },
                ...options
            }
        });
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, WebSocketManager, Navigation, ChartHelper };
}


