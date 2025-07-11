// Enhanced Logging System for Dragonlance Game
class GameLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 log entries
        this.logLevel = 'DEBUG'; // DEBUG, INFO, WARN, ERROR
        this.sessionId = this.generateSessionId();
        
        // Initialize logging
        this.initializeLogging();
    }
    
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    initializeLogging() {
        // Override console methods to capture all logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        console.log = (...args) => {
            this.log('INFO', ...args);
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.log('ERROR', ...args);
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.log('WARN', ...args);
            originalWarn.apply(console, args);
        };
        
        console.info = (...args) => {
            this.log('INFO', ...args);
            originalInfo.apply(console, args);
        };
        
        // Log session start
        this.log('INFO', '=== GAME SESSION STARTED ===');
        this.log('INFO', 'Session ID:', this.sessionId);
        this.log('INFO', 'Timestamp:', new Date().toISOString());
        this.log('INFO', 'User Agent:', navigator.userAgent);
        this.log('INFO', 'URL:', window.location.href);
    }
    
    log(level, ...args) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            sessionId: this.sessionId,
            message: args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return '[Object - circular reference]';
                    }
                }
                return String(arg);
            }).join(' ')
        };
        
        this.logs.push(logEntry);
        
        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // Immediately save to localStorage and attempt file download
        this.saveToStorage();
        this.periodicSave();
    }
    
    debug(...args) {
        this.log('DEBUG', ...args);
    }
    
    info(...args) {
        this.log('INFO', ...args);
    }
    
    warn(...args) {
        this.log('WARN', ...args);
    }
    
    error(...args) {
        this.log('ERROR', ...args);
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('dragonlance-logs', JSON.stringify({
                sessionId: this.sessionId,
                logs: this.logs
            }));
        } catch (e) {
            console.warn('Could not save logs to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('dragonlance-logs');
            if (stored) {
                const data = JSON.parse(stored);
                return data.logs || [];
            }
        } catch (e) {
            console.warn('Could not load logs from localStorage:', e);
        }
        return [];
    }
    
    exportLogs() {
        const logText = this.logs.map(entry => 
            `[${entry.timestamp}] [${entry.level}] [${entry.sessionId}] ${entry.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dragonlance-debug-${this.sessionId}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.info('Logs exported to file:', a.download);
    }
    
    periodicSave() {
        // Auto-save logs every 30 seconds
        if (!this.saveInterval) {
            this.saveInterval = setInterval(() => {
                this.saveToStorage();
            }, 30000);
        }
    }
    
    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }
    
    clearLogs() {
        this.logs = [];
        this.saveToStorage();
        this.info('Logs cleared');
    }
    
    // Game-specific logging methods
    logGameEvent(event, data = {}) {
        this.info(`GAME_EVENT: ${event}`, data);
    }
    
    logChoice(choice, index) {
        this.info('CHOICE_SELECTED:', {
            choice: choice,
            index: index,
            timestamp: Date.now()
        });
    }
    
    logRaceSelection(raceName, choice) {
        this.info('RACE_SELECTED:', {
            race: raceName,
            choice: choice,
            timestamp: Date.now()
        });
    }
    
    logEntryLoad(entryId) {
        this.info('ENTRY_LOADED:', {
            entryId: entryId,
            timestamp: Date.now()
        });
    }
    
    logError(error, context = '') {
        this.error('GAME_ERROR:', {
            error: error.message || error,
            stack: error.stack || 'No stack trace',
            context: context,
            timestamp: Date.now()
        });
    }
    
    // Create debug panel
    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 10px;
            overflow-y: auto;
            z-index: 10000;
            display: none;
        `;
        
        const header = document.createElement('div');
        header.innerHTML = `
            <strong>Debug Panel - Session: ${this.sessionId.substr(-6)}</strong>
            <button onclick="gameLogger.exportLogs()" style="float: right; margin-left: 5px;">Export</button>
            <button onclick="gameLogger.clearLogs()" style="float: right; margin-left: 5px;">Clear</button>
            <button onclick="document.getElementById('debug-panel').style.display='none'" style="float: right;">Hide</button>
        `;
        
        const logContainer = document.createElement('div');
        logContainer.id = 'debug-logs';
        
        panel.appendChild(header);
        panel.appendChild(logContainer);
        document.body.appendChild(panel);
        
        // Update logs in real-time
        setInterval(() => {
            const lastLogs = this.logs.slice(-10);
            logContainer.innerHTML = lastLogs.map(log => 
                `<div>[${log.level}] ${log.message.substr(0, 200)}</div>`
            ).join('');
        }, 1000);
        
        // Show/hide with Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                const display = panel.style.display === 'none' ? 'block' : 'none';
                panel.style.display = display;
                this.info('Debug panel toggled:', display);
            }
        });
        
        return panel;
    }
}

// Initialize global logger
window.gameLogger = new GameLogger();

// Auto-export logs when page unloads
window.addEventListener('beforeunload', () => {
    gameLogger.info('=== SESSION ENDING ===');
    gameLogger.saveToStorage();
});

// Create debug panel
document.addEventListener('DOMContentLoaded', () => {
    gameLogger.createDebugPanel();
    gameLogger.info('Debug panel created. Press Ctrl+Shift+D to toggle.');
});