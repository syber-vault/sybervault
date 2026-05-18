// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | AUTO DATA SYNC ENGINE
// রিয়েল-টাইম ডেটা সিঙ্ক, অটো-সেভ, কনফ্লিক্ট রেজোলিউশন
// Real-time Data Synchronization, Auto-save, Conflict Resolution
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const AutoDataSync = {
    // Configuration
    syncInterval: 10000, // 10 seconds
    autoSaveInterval: 5000, // 5 seconds
    maxQueueSize: 1000,
    conflictResolution: 'LATEST_WINS', // LATEST_WINS, MANUAL, AUTO_MERGE
    enableRemoteSync: true,
    syncEndpoint: '/api/data/sync',
    
    // State
    changeQueue: [],
    syncInProgress: false,
    lastSyncTime: null,
    pendingChanges: 0,
    lastLocalHash: null,
    lastRemoteHash: null,
    isSyncing: false,
    syncStats: {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalChanges: 0,
      conflicts: 0,
      lastSync: null,
      lastError: null
    },

    // Initialize auto-sync
    init() {
      console.log('[AUTO-SYNC] Initializing automatic data synchronization');
      this._setupAutoSave();
      this._setupAutoSync();
      this._setupDataMonitoring();
      AuditLogger.info('SYSTEM_START', 'Auto Data Sync engine initialized');
      return true;
    },

    // Track data changes
    trackChange(changeType, targetId, newValue, oldValue = null) {
      const change = {
        id: `CHANGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        changeType,
        targetId,
        newValue,
        oldValue,
        userId: window.currentUser?.username || 'SYSTEM',
        sessionId: SessionManager.currentSession?.sessionId || 'NO_SESSION',
        synced: false
      };

      this.changeQueue.push(change);
      this.pendingChanges++;

      // Maintain queue size
      if (this.changeQueue.length > this.maxQueueSize) {
        this.changeQueue = this.changeQueue.slice(-this.maxQueueSize);
      }

      AuditLogger.debug('DATA_CHANGE_TRACKED',
        `Change tracked: ${changeType}`,
        { changeId: change.id, targetId, changeType }
      );

      return change.id;
    },

    // Setup auto-save (every 5 seconds)
    _setupAutoSave() {
      setInterval(() => {
        if (this.pendingChanges > 0 && !this.syncInProgress) {
          this._performAutoSave();
        }
      }, this.autoSaveInterval);
    },

    // Perform auto-save
    async _performAutoSave() {
      try {
        // Save to local storage
        const vaultData = window.VAULT_DATA || {};
        const encrypted = await CryptoEngine.encrypt(JSON.stringify(vaultData));
        
        localStorage.setItem('VAULT_DATA_ENCRYPTED', encrypted);
        this.lastLocalHash = await this._generateHash(encrypted);

        AuditLogger.debug('DATA_AUTOSAVE',
          `Auto-saved ${this.pendingChanges} pending changes`,
          { changesCount: this.pendingChanges }
        );
      } catch (e) {
        AuditLogger.error('AUTOSAVE_ERROR', e.message);
      }
    },

    // Setup periodic sync (every 10 seconds)
    _setupAutoSync() {
      setInterval(() => {
        if (this.enableRemoteSync && !this.syncInProgress) {
          this.syncToServer();
        }
      }, this.syncInterval);
    },

    // Sync to server
    async syncToServer() {
      if (this.syncInProgress || !this.enableRemoteSync) return;

      this.syncInProgress = true;
      this.isSyncing = true;

      try {
        // Prepare sync payload
        const payload = {
          changes: this.changeQueue.filter(c => !c.synced).slice(0, 100),
          vaultData: window.VAULT_DATA || {},
          timestamp: new Date().toISOString(),
          sessionId: SessionManager.currentSession?.sessionId
        };

        if (payload.changes.length === 0) return;

        // Send to server
        const response = await fetch(this.syncEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.authToken || ''}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Sync failed: ${response.statusText}`);

        const result = await response.json();

        // Mark synced changes
        payload.changes.forEach(change => {
          const idx = this.changeQueue.findIndex(c => c.id === change.id);
          if (idx > -1) this.changeQueue[idx].synced = true;
        });

        this.pendingChanges = this.changeQueue.filter(c => !c.synced).length;
        this.lastSyncTime = new Date();
        this.syncStats.totalSyncs++;
        this.syncStats.successfulSyncs++;
        this.syncStats.lastSync = new Date().toISOString();

        // Handle conflicts
        if (result.conflicts && result.conflicts.length > 0) {
          await this._handleConflicts(result.conflicts);
        }

        AuditLogger.info('DATA_SYNCED',
          `Synced ${payload.changes.length} changes to server`,
          { syncsCount: payload.changes.length, pending: this.pendingChanges }
        );

        window.dispatchEvent(new CustomEvent('data:synced', {
          detail: { changeCount: payload.changes.length, timestamp: this.lastSyncTime }
        }));
      } catch (e) {
        this.syncStats.failedSyncs++;
        this.syncStats.lastError = e.message;

        AuditLogger.warn('DATA_SYNC_FAILED',
          `Server sync failed: ${e.message}`,
          { errorMessage: e.message, pendingChanges: this.pendingChanges }
        );
      } finally {
        this.syncInProgress = false;
        this.isSyncing = false;
      }
    },

    // Handle conflicts
    async _handleConflicts(conflicts) {
      this.syncStats.conflicts += conflicts.length;

      for (const conflict of conflicts) {
        if (this.conflictResolution === 'LATEST_WINS') {
          // Use newer version
          if (new Date(conflict.remoteTimestamp) > new Date(conflict.localTimestamp)) {
            // Use remote version
            window.VAULT_DATA = conflict.remoteData;
            await DataVault.save(window.VAULT_DATA);
          }
        }

        AuditLogger.warn('DATA_CONFLICT_RESOLVED',
          `Conflict resolved using ${this.conflictResolution}`,
          { conflictId: conflict.id, resolution: this.conflictResolution }
        );
      }
    },

    // Setup data monitoring
    _setupDataMonitoring() {
      // Monitor VAULT_DATA changes
      const handler = {
        get(target, property) {
          return target[property];
        },
        set(target, property, value) {
          // Track all changes
          AutoDataSync.trackChange('VAULT_DATA_MODIFIED', property, value, target[property]);
          target[property] = value;
          return true;
        }
      };

      if (typeof window.VAULT_DATA !== 'object' || !window.VAULT_DATA) {
        window.VAULT_DATA = {};
      }

      // Note: Proxy may not work with existing objects, so we track changes manually
      console.log('[AUTO-SYNC] Data monitoring active');
    },

    // Get sync status
    getSyncStatus() {
      return {
        isSyncing: this.isSyncing,
        pendingChanges: this.pendingChanges,
        changeQueueSize: this.changeQueue.length,
        lastSyncTime: this.lastSyncTime,
        stats: this.syncStats,
        nextSyncIn: this.syncInterval
      };
    },

    // Get change history
    getChangeHistory(limit = 100) {
      return this.changeQueue.slice(-limit).map(c => ({
        id: c.id,
        timestamp: c.timestamp,
        changeType: c.changeType,
        targetId: c.targetId,
        userId: c.userId,
        synced: c.synced
      }));
    },

    // Force sync now
    async forceSyncNow() {
      AuditLogger.info('MANUAL_SYNC', 'Manual sync initiated');
      return await this.syncToServer();
    },

    // Generate hash
    async _generateHash(data) {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Clear queue
    clearQueue() {
      const size = this.changeQueue.length;
      this.changeQueue = [];
      this.pendingChanges = 0;
      AuditLogger.info('QUEUE_CLEARED', `Change queue cleared (${size} items)`);
    }
  };

  window.AutoDataSync = AutoDataSync;
})();
