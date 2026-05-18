// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | DATA VAULT
// Encrypted storage, Data integrity, Backup management
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const DataVault = {
    storageName: 'VAULT_DATA_ENCRYPTED',
    backupPrefix: 'VAULT_BACKUP',
    maxBackups: 10,
    syncEndpoint: '/api/data/sync',

    // Save data with encryption
    async save(data) {
      try {
        // Create backup before saving
        this._createBackup();

        // Encrypt data
        const encrypted = await CryptoEngine.encrypt(JSON.stringify(data));

        // Add metadata
        const vault = {
          version: '8.0',
          timestamp: new Date().toISOString(),
          hash: await this._generateHash(encrypted),
          data: encrypted,
          integrity: 'VERIFIED'
        };

        // Store
        localStorage.setItem(this.storageName, JSON.stringify(vault));

        // Log
        AuditLogger.info('DATA_SAVED',
          'Vault data saved and encrypted',
          { size: encrypted.length, timestamp: vault.timestamp }
        );

        // Sync to server
        await this._syncToServer(vault);

        return { success: true, timestamp: vault.timestamp };
      } catch (e) {
        AuditLogger.error('DATA_SAVE_ERROR', e.message, { error: e });
        return { success: false, error: e.message };
      }
    },

    // Load and decrypt data
    async load() {
      try {
        const vaultStr = localStorage.getItem(this.storageName);
        if (!vaultStr) return null;

        const vault = JSON.parse(vaultStr);

        // Verify integrity
        const currentHash = await this._generateHash(vault.data);
        if (currentHash !== vault.hash) {
          AuditLogger.critical('DATA_INTEGRITY_ERROR',
            'Vault data integrity check failed',
            { expectedHash: vault.hash, currentHash }
          );
          return null;
        }

        // Decrypt
        const decrypted = await CryptoEngine.decrypt(vault.data);
        const data = JSON.parse(decrypted);

        AuditLogger.debug('DATA_LOADED', 'Vault data loaded successfully');
        return data;
      } catch (e) {
        AuditLogger.error('DATA_LOAD_ERROR', e.message, { error: e });
        return null;
      }
    },

    // Create backup
    _createBackup() {
      try {
        const existing = localStorage.getItem(this.storageName);
        if (!existing) return;

        const backupKey = `${this.backupPrefix}_${Date.now()}`;
        localStorage.setItem(backupKey, existing);

        // Cleanup old backups
        this._cleanupOldBackups();

        AuditLogger.debug('DATA_BACKUP',
          'Automatic backup created',
          { backupKey }
        );
      } catch (e) {
        console.error('[BACKUP ERROR]', e.message);
      }
    },

    // Cleanup old backups
    _cleanupOldBackups() {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.backupPrefix)) {
          backups.push(key);
        }
      }

      if (backups.length > this.maxBackups) {
        backups.sort();
        for (let i = 0; i < backups.length - this.maxBackups; i++) {
          localStorage.removeItem(backups[i]);
        }
      }
    },

    // List backups
    listBackups() {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.backupPrefix)) {
          const timestamp = key.replace(this.backupPrefix + '_', '');
          backups.push({ key, timestamp: new Date(parseInt(timestamp)) });
        }
      }
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    },

    // Restore from backup
    async restoreFromBackup(backupKey) {
      try {
        const backup = localStorage.getItem(backupKey);
        if (!backup) throw new Error('Backup not found');

        localStorage.setItem(this.storageName, backup);

        AuditLogger.warn('DATA_RESTORED',
          'Data restored from backup',
          { backupKey, restoredBy: window.currentUser?.username }
        );

        return { success: true };
      } catch (e) {
        AuditLogger.error('DATA_RESTORE_ERROR', e.message);
        return { success: false, error: e.message };
      }
    },

    // Generate hash for integrity check
    async _generateHash(data) {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // Sync to server
    async _syncToServer(vault) {
      try {
        const response = await fetch(this.syncEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.authToken || ''}`
          },
          body: JSON.stringify(vault)
        });

        if (!response.ok) throw new Error(`Sync failed: ${response.statusText}`);
        AuditLogger.debug('DATA_SYNCED', 'Vault synced to server');
      } catch (e) {
        AuditLogger.warn('DATA_SYNC_FAILED', e.message);
      }
    },

    // Export vault (encrypted)
    async export() {
      try {
        const vaultStr = localStorage.getItem(this.storageName);
        if (!vaultStr) throw new Error('No vault data to export');

        const blob = new Blob([vaultStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vault-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        AuditLogger.info('DATA_EXPORTED', 'Vault exported', { exportedBy: window.currentUser?.username });
      } catch (e) {
        AuditLogger.error('DATA_EXPORT_ERROR', e.message);
      }
    }
  };

  window.DataVault = DataVault;
})();