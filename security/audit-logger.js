// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | AUDIT LOGGER
// Real-time logging, Event tracking, Security audit trail
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const AuditLogger = {
    logs: [],
    maxLogs: 10000,
    logLevel: 'INFO', // DEBUG, INFO, WARN, ERROR, CRITICAL
    enableRemote: true,
    remoteEndpoint: '/api/audit/logs',

    // Log levels
    LEVELS: {
      DEBUG: { level: 1, color: '#888', icon: '🔧' },
      INFO: { level: 2, color: '#00ff41', icon: 'ℹ️' },
      WARN: { level: 3, color: '#ffb800', icon: '⚠️' },
      ERROR: { level: 4, color: '#ff1a1a', icon: '❌' },
      CRITICAL: { level: 5, color: '#ff0000', icon: '🚨' }
    },

    // Event types for security tracking
    EVENTS: {
      LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
      LOGIN_SUCCESS: 'LOGIN_SUCCESS',
      LOGIN_FAILED: 'LOGIN_FAILED',
      LOGOUT: 'LOGOUT',
      FILE_CREATED: 'FILE_CREATED',
      FILE_MODIFIED: 'FILE_MODIFIED',
      FILE_DELETED: 'FILE_DELETED',
      FILE_ACCESSED: 'FILE_ACCESSED',
      FILE_DOWNLOADED: 'FILE_DOWNLOADED',
      USER_CREATED: 'USER_CREATED',
      USER_MODIFIED: 'USER_MODIFIED',
      USER_DELETED: 'USER_DELETED',
      PERMISSION_CHANGED: 'PERMISSION_CHANGED',
      ENCRYPTION_ERROR: 'ENCRYPTION_ERROR',
      SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
      BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
      UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
      DATA_EXPORT: 'DATA_EXPORT',
      SYSTEM_CONFIG_CHANGED: 'SYSTEM_CONFIG_CHANGED'
    },

    // Initialize audit logger
    init() {
      this.logs = this._loadFromStorage() || [];
      console.log(`[AUDIT] Logger initialized with ${this.logs.length} historical logs`);
      this._setupAutoSync();
      return true;
    },

    // Core logging function
    log(eventType, message, data = {}, level = 'INFO') {
      const timestamp = new Date().toISOString();
      const logEntry = {
        id: this._generateLogId(),
        timestamp,
        level,
        eventType,
        message,
        data: { ...data, userAgent: navigator.userAgent },
        userId: window.currentUser?.username || 'ANONYMOUS',
        ipAddress: data.ipAddress || 'CLIENT',
        severity: this.LEVELS[level]?.level || 2,
        status: 'LOGGED'
      };

      this.logs.push(logEntry);
      this._maintainLogSize();
      this._saveToStorage();

      // Console output
      this._consoleOutput(logEntry);

      // Remote sync if enabled
      if (this.enableRemote && level !== 'DEBUG') {
        this._syncToServer(logEntry);
      }

      return logEntry.id;
    },

    // Convenience methods for each level
    debug(eventType, message, data = {}) {
      return this.log(eventType, message, data, 'DEBUG');
    },

    info(eventType, message, data = {}) {
      return this.log(eventType, message, data, 'INFO');
    },

    warn(eventType, message, data = {}) {
      return this.log(eventType, message, data, 'WARN');
    },

    error(eventType, message, data = {}) {
      return this.log(eventType, message, data, 'ERROR');
    },

    critical(eventType, message, data = {}) {
      return this.log(eventType, message, data, 'CRITICAL');
    },

    // Get logs with filtering
    getLogs(filter = {}) {
      let result = [...this.logs];

      if (filter.eventType) {
        result = result.filter(l => l.eventType === filter.eventType);
      }
      if (filter.level) {
        result = result.filter(l => l.level === filter.level);
      }
      if (filter.userId) {
        result = result.filter(l => l.userId === filter.userId);
      }
      if (filter.startDate && filter.endDate) {
        const start = new Date(filter.startDate).getTime();
        const end = new Date(filter.endDate).getTime();
        result = result.filter(l => {
          const time = new Date(l.timestamp).getTime();
          return time >= start && time <= end;
        });
      }
      if (filter.severity) {
        result = result.filter(l => l.severity >= filter.severity);
      }

      return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Get security summary
    getSecuritySummary(hours = 24) {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
      const recentLogs = this.logs.filter(l => new Date(l.timestamp) > cutoff);

      return {
        totalEvents: recentLogs.length,
        errorCount: recentLogs.filter(l => l.level === 'ERROR').length,
        criticalCount: recentLogs.filter(l => l.level === 'CRITICAL').length,
        failedLogins: recentLogs.filter(l => l.eventType === 'LOGIN_FAILED').length,
        suspiciousActivities: recentLogs.filter(l => l.eventType === 'SUSPICIOUS_ACTIVITY').length,
        unauthorizedAttempts: recentLogs.filter(l => l.eventType === 'UNAUTHORIZED_ACCESS').length,
        timeRange: { from: cutoff.toISOString(), to: new Date().toISOString() }
      };
    },

    // Console output with colors
    _consoleOutput(entry) {
      const levelInfo = this.LEVELS[entry.level];
      const style = `color: ${levelInfo.color}; font-weight: bold;`;
      console.log(`%c[${entry.level}] ${entry.timestamp} | ${entry.eventType}`, style, entry.message, entry.data);
    },

    // Generate unique log ID
    _generateLogId() {
      return `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Maintain max log size
    _maintainLogSize() {
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }
    },

    // Save to localStorage
    _saveToStorage() {
      try {
        const compressed = this.logs.slice(-1000); // Save last 1000 logs
        localStorage.setItem('VAULT_AUDIT_LOGS', JSON.stringify(compressed));
      } catch (e) {
        console.error('[AUDIT STORAGE ERROR]', e.message);
      }
    },

    // Load from localStorage
    _loadFromStorage() {
      try {
        const data = localStorage.getItem('VAULT_AUDIT_LOGS');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('[AUDIT LOAD ERROR]', e.message);
        return [];
      }
    },

    // Auto-sync to server every 5 minutes
    _setupAutoSync() {
      setInterval(() => {
        const unsyncedLogs = this.logs.filter(l => l.status === 'LOGGED');
        if (unsyncedLogs.length > 0) {
          this._batchSyncToServer(unsyncedLogs);
        }
      }, 5 * 60 * 1000);
    },

    // Sync single log to server
    _syncToServer(logEntry) {
      if (!this.enableRemote) return;
      fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).then(r => {
        if (r.ok) logEntry.status = 'SYNCED';
      }).catch(e => console.error('[SYNC ERROR]', e.message));
    },

    // Batch sync
    _batchSyncToServer(logEntries) {
      fetch(this.remoteEndpoint + '/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logEntries })
      }).then(r => {
        if (r.ok) logEntries.forEach(l => l.status = 'SYNCED');
      }).catch(e => console.error('[BATCH SYNC ERROR]', e.message));
    },

    // Export logs
    exportLogs(format = 'json') {
      const logs = this.logs;
      let content, filename;

      if (format === 'json') {
        content = JSON.stringify(logs, null, 2);
        filename = `audit-logs-${Date.now()}.json`;
      } else if (format === 'csv') {
        const headers = ['ID', 'Timestamp', 'Level', 'Event Type', 'Message', 'User ID'];
        const rows = logs.map(l => [
          l.id, l.timestamp, l.level, l.eventType, l.message, l.userId
        ]);
        content = [headers, ...rows].map(r => r.join(',')).join('\n');
        filename = `audit-logs-${Date.now()}.csv`;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    // Clear logs (with confirmation)
    clearLogs() {
      if (confirm('This will permanently delete all audit logs. Continue?')) {
        this.logs = [];
        this._saveToStorage();
        this.info('SYSTEM_CONFIG_CHANGED', 'All audit logs cleared', { action: 'CLEAR_LOGS' });
        return true;
      }
      return false;
    }
  };

  window.AuditLogger = AuditLogger;
})();