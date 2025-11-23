const DashboardWS = {
    socket: null,
    reconnectInterval: 3000,

    connect() {
        // Use the hostname the page was loaded from (works for localhost and network IP)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '8081';

        this.socket = new WebSocket(`${protocol}//${host}:${port}`);

        this.socket.onopen = () => {
            console.log('Connected to Synapse Streamer');
            this.updateStatus(true);
        };

        this.socket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            this.handleMessage(payload);
        };

        this.socket.onclose = () => {
            console.log('Disconnected. Reconnecting...');
            this.updateStatus(false);
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.socket.close();
        };
    },

    updateStatus(online) {
        const statusEl = document.getElementById('connection-status');
        const textEl = document.getElementById('connection-text');

        if (online) {
            statusEl.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20 transition-colors';
            textEl.textContent = 'LIVE STREAM';
        } else {
            statusEl.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20 transition-colors';
            textEl.textContent = 'OFFLINE';
        }
    },

    handleMessage(payload) {
        if (payload.type === 'init') {
            Dashboard.initMachines(payload.machines);
        } else if (payload.type === 'update') {
            Dashboard.updateMachines(payload.data);
            Analytics.update(payload.data);
            Alerts.process(payload.data);
            MachineDetail.updateIfOpen(payload.data);
        }
    }
};
