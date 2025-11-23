type Listener = (data: any) => void;

class SSEManager {
    private listeners: Set<Listener> = new Set();

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        console.log(`Client connected. Total clients: ${this.listeners.size}`);
        return () => {
            this.listeners.delete(listener);
            console.log(`Client disconnected. Total clients: ${this.listeners.size}`);
        };
    }

    broadcast(data: any) {
        console.log(`Broadcasting data to ${this.listeners.size} clients`);
        this.listeners.forEach(listener => listener(data));
    }
}

// Persist instance across HMR in development
const globalForSSE = global as unknown as { sseManager: SSEManager };

export const sseManager = globalForSSE.sseManager || new SSEManager();

if (process.env.NODE_ENV !== 'production') globalForSSE.sseManager = sseManager;
