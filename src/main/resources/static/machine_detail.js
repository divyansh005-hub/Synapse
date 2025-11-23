// Machine Detail Module
const MachineDetail = {
    currentMachine: null,

    init() {
        console.log('Machine Detail module initialized');
    },

    open(machineId) {
        console.log('Opening machine detail for:', machineId);
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
        console.log('Updating machine detail data:', data);

        // Update modal content if elements exist
        const statusEl = document.getElementById('modal-status');
        const efficiencyEl = document.getElementById('modal-efficiency');
        const oilEl = document.getElementById('modal-oil');
        const coolantEl = document.getElementById('modal-coolant');
        const filterEl = document.getElementById('modal-filter');
        const bearingEl = document.getElementById('modal-bearing');

        if (statusEl) statusEl.textContent = data.status;
        if (efficiencyEl) efficiencyEl.textContent = data.kpi.efficiency.toFixed(1) + '%';
        if (oilEl) oilEl.textContent = data.consumables.oil.toFixed(0) + '%';
        if (coolantEl) coolantEl.textContent = data.consumables.coolant.toFixed(0) + '%';
        if (filterEl) filterEl.textContent = (100 - data.consumables.filter).toFixed(0) + '%';
        if (bearingEl) bearingEl.textContent = (100 - data.spares.bearing_wear * 10).toFixed(0) + '%';

        // Update progress bars
        const barOil = document.getElementById('bar-oil');
        const barCoolant = document.getElementById('bar-coolant');
        const barFilter = document.getElementById('bar-filter');

        if (barOil) barOil.style.width = data.consumables.oil + '%';
        if (barCoolant) barCoolant.style.width = data.consumables.coolant + '%';
        if (barFilter) barFilter.style.width = (100 - data.consumables.filter) + '%';
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MachineDetail.init());
} else {
    MachineDetail.init();
}
