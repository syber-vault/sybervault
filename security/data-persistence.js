// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | DATA PERSISTENCE LAYER
// মাল্টি-লেয়ার স্টোরেজ, ডেটা রিকভারি, ইন্টিগ্রিটি চেক
// Multi-layer Storage, Data Recovery, Integrity Verification
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const DataPersistence = {
    // Storage layers
    STORAGE_KEYS: {
      PRIMARY: 'VAULT_DATA_ENCRYPTED',
      BACKUP: 'VAULT_DATA_BACKUP',
      CACHE: 'VAULT_DATA_CACHE',
      METADATA: 'VAULT_METADATA'
    },

    // Initialize persistence
    async init() {
      console.log('[DATA PERSISTENCE] Initializing multi-layer storage');
      
      // Check and recover from storage if needed
      await this._checkStorageIntegrity();
      
      AuditLogger.info('SYSTEM_START', 'Data Persistence layer initialized');
      return true;
    },

    // Save to all layers
    async saveMultilayer(data) {
      try {
        const encrypted = await CryptoEngine.encrypt(JSON.stringify(data));
        const timestamp = new Date().toISOString();
        const hash = await this._generateHash(encrypted);

        // Primary storage
        localStorage.setItem(this.STORAGE_KEYS.PRIMARY, JSON.stringify({
          data: encrypted,
          timestamp,
          hash,
          version: '8.0'
        }));

        // Backup layer
        this._createBackupLayer(encrypted, timestamp, hash);

        // Cache layer (faster access)
        sessionStorage.setItem(this.STORAGE_KEYS.CACHE, encrypted);

        // Metadata
        localStorage.setItem(this.STORAGE_KEYS.METADATA, JSON.stringify({
          lastSaved: timestamp,
          lastHash: hash,
          dataSize: encrypted.length,
          backups: this._getBackupCount()
        }));

        AuditLogger.info('DATA_PERSISTED',
          'Data saved to all storage layers',
          { timestamp, hash: hash.substring(0, 16) + '...' }
        );

        return { success: true, timestamp, hash };
      } catch (e) {
        AuditLogger.error('PERSISTENCE_ERROR', e.message);
        return { success: false, error: e.message };
      }
    },

    // Load with fallback
    async loadWithFallback() {
      try {
        // Try primary storage first
        const primary = localStorage.getItem(this.STORAGE_KEYS.PRIMARY);
        if (primary) {
          const vault = JSON.parse(primary);
          const decrypted = await CryptoEngine.decrypt(vault.data);
          return JSON.parse(decrypted);
        }

        // Fallback to backup
        const backups = this._listBackups();
        if (backups.length > 0) {
          AuditLogger.warn('DATA_RECOVERY', 'Recovering from backup layer');
          const latestBackup = backups[0];
          const backup = localStorage.getItem(latestBackup);
          if (backup) {
            const vault = JSON.parse(backup);
            const decrypted = await CryptoEngine.decrypt(vault.data);
            return JSON.parse(decrypted);
          }
        }

        // Fallback to cache
        const cache = sessionStorage.getItem(this.STORAGE_KEYS.CACHE);
        if (cache) {
          AuditLogger.warn('DATA_RECOVERY', 'Recovering from cache layer');
          const decrypted = await CryptoEngine.decrypt(cache);
          return JSON.parse(decrypted);
        }

        return null;
      } catch (e) {
        AuditLogger.critical('DATA_LOAD_FAILED', e.message);
        return null;
      }
    },

    // Create backup layer
    _createBackupLayer(data, timestamp, hash) {
      try {
        const backup = {
          data,
          timestamp,
          hash,
          version: '8.0'
        };
        
        // Keep rotating backups (last 5)
        const backups = this._listBackups();
        
        // Add new backup
        const backupKey = `${this.STORAGE_KEYS.BACKUP}_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));

        // Cleanup old backups
        if (backups.length >= 5) {
          localStorage.removeItem(backups[backups.length - 1]);
        }
      } catch (e) {
        console.error('[BACKUP ERROR]', e.message);
      }
    },

    // List backup keys
    _listBackups() {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEYS.BACKUP)) {
          backups.push(key);
        }
      }
      return backups.sort().reverse();
    },

    // Get backup count
    _getBackupCount() {
      return this._listBackups().length;
    },

    // Check storage integrity
    async _checkStorageIntegrity() {
      try {
        const primary = localStorage.getItem(this.STORAGE_KEYS.PRIMARY);
        if (!primary) return;

        const vault = JSON.parse(primary);
        const currentHash = await this._generateHash(vault.data);

        if (currentHash !== vault.hash) {
          AuditLogger.critical('STORAGE_INTEGRITY_FAILED',
            'Primary storage integrity check failed',
            { expectedHash: vault.hash, currentHash }
          );
          // Recover from backup
          return await this._recoverFromBackup();
        }

        AuditLogger.debug('STORAGE_VERIFIED', 'Storage integrity verified');
      } catch (e) {
        AuditLogger.error('INTEGRITY_CHECK_ERROR', e.message);
      }
    },

    // Recover from backup
    async _recoverFromBackup() {
      const backups = this._listBackups();
      for (const backupKey of backups) {
        try {
          const backup = localStorage.getItem(backupKey);
          const vault = JSON.parse(backup);
          const decrypted = await CryptoEngine.decrypt(vault.data);
          
          // Restore to primary
          localStorage.setItem(this.STORAGE_KEYS.PRIMARY, backup);
          
          AuditLogger.info('DATA_RECOVERED',
            'Data recovered from backup',
            { backupKey, timestamp: vault.timestamp }
          );
          
          return true;
        } catch (e) {
          continue;
        }
      }
      
      AuditLogger.critical('RECOVERY_FAILED', 'Could not recover from any backup');
      return false;
    },

    // Generate hash
    async _generateHash(data) {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Export all data
    async exportAll() {
      const data = {
        primary: localStorage.getItem(this.STORAGE_KEYS.PRIMARY),
        metadata: localStorage.getItem(this.STORAGE_KEYS.METADATA),
        backups: this._listBackups().map(key => localStorage.getItem(key)),
        exportTime: new Date().toISOString()
      };
      return data;
    },

    // Get storage stats
    getStorageStats() {
      let totalSize = 0;
      const items = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;
        
        if (key.includes('VAULT')) {
          items.push({ key, size, sizeKB: (size / 1024).toFixed(2) });
        }
      }

      return {
        totalStorageUsed: totalSize,
        totalStorageUsedMB: (totalSize / 1024 / 1024).toFixed(2),
        itemCount: items.length,
        items,
        backupCount: this._getBackupCount()
      };
    }
  };

  window.DataPersistence = DataPersistence;
})();
