// Alerts Management Module
const Alerts = {
    alerts: [],

    init() {
        console.log('Alerts module initialized');
    },

    process(updates) {
        // Process incoming machine data for alerts
        const criticalAlerts = updates.filter(m => m.anomaly && m.anomaly.severity === 'CRITICAL');
        document.getElementById('kpi-alerts').textContent = criticalAlerts.length;
    },

    addAlert(alert) {
        this.alerts.push(alert);
    },

    getAlerts() {
        return this.alerts;
    },

    clearAlerts() {
        this.alerts = [];
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Alerts.init());
} else {
    Alerts.init();
}
