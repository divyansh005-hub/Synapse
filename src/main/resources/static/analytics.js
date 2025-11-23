// Analytics Module
const Analytics = {
    data: {},

    init() {
        console.log('Analytics module initialized');
    },

    update(updates) {
        // Update analytics with incoming machine data
        const totalMachines = updates.length;
        const avgEfficiency = updates.reduce((sum, m) => sum + m.kpi.efficiency, 0) / totalMachines;

        document.getElementById('kpi-active').textContent = totalMachines;
        document.getElementById('kpi-efficiency').textContent = avgEfficiency.toFixed(1) + '%';
    },

    trackEvent(eventName, data) {
        console.log('Event tracked:', eventName, data);
    },

    getAnalytics() {
        return this.data;
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Analytics.init());
} else {
    Analytics.init();
}
