// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | GITHUB GIST MANAGER
// GitHub Gist এ ডেটা সাভে
// Secure Gist Storage, Version Control, Data Protection
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const GistManager = {
    // GitHub API Configuration
    apiEndpoint: 'https://api.github.com/gists',
    username: null,
    token: null,
    mainGistId: '68eee73f820aa5cff1812077e88ab682', // তোর Gist ID
    backupGistIds: [],

    // Settings
    settings: {
      encryptBeforeSave: true,
      autoSync: true,
      syncInterval: 300000, // 5 minutes
      maxRetries: 3,
      retryDelay: 2000
    },

    // Initialize with GitHub token
    async init(githubToken, username) {
      try {
        this.token = githubToken;
        this.username = username;

        console.log('[GIST MANAGER] Initializing with GitHub token');

        // Verify token
        const verified = await this._verifyToken();
        if (!verified) {
          throw new Error('Invalid GitHub token');
        }

        // Find or create main gist
        await this._findOrCreateMainGist();

        // Setup auto-sync
        if (this.settings.autoSync) {
          this._setupAutoSync();
        }

        AuditLogger.info('SYSTEM_START', 'GitHub Gist Manager initialized', { username });
        return true;
      } catch (e) {
        AuditLogger.critical('GIST_INIT_ERROR', e.message);
        console.error('[GIST MANAGER ERROR]', e.message);
        return false;
      }
    },

    // Verify GitHub token
    async _verifyToken() {
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `token ${this.token}` }
        });
        return response.ok;
      } catch (e) {
        return false;
      }
    },

    // Find or create main gist
    async _findOrCreateMainGist() {
      try {
        // Try to find existing SYBER_VAULT gist
        const gists = await this._listGists();
        const vaultGist = gists.find(g => g.description === 'SYBER_VAULT_MAIN_DATA');

        if (vaultGist) {
          this.mainGistId = vaultGist.id;
          AuditLogger.debug('GIST_FOUND', 'Found existing main gist', { gistId: this.mainGistId });
          return true;
        }

        // Create new main gist
        const newGist = await this._createGist(
          'vault-data-main.json',
          JSON.stringify({ repos: [], files: {} }),
          'SYBER_VAULT_MAIN_DATA'
        );

        this.mainGistId = newGist.id;
        AuditLogger.info('GIST_CREATED', 'Created new main gist', { gistId: this.mainGistId });
        return true;
      } catch (e) {
        AuditLogger.error('GIST_CREATION_ERROR', e.message);
        return false;
      }
    },

    // Save data to GitHub Gist
    async saveToGist(data) {
      try {
        if (!this.mainGistId) {
          throw new Error('Main gist not initialized');
        }

        // Encrypt if enabled
        let contentToSave = JSON.stringify(data);
        if (this.settings.encryptBeforeSave) {
          contentToSave = await CryptoEngine.encrypt(contentToSave);
        }

        // Create backup before saving
        await this._createBackupGist(contentToSave);

        // Update main gist with retry logic
        let lastError = null;
        for (let i = 0; i < this.settings.maxRetries; i++) {
          try {
            await this._updateGist(
              this.mainGistId,
              'vault-data-main.json',
              contentToSave
            );

            AuditLogger.info('GIST_SAVED',
              'Data saved to GitHub Gist',
              { gistId: this.mainGistId, timestamp: new Date().toISOString() }
            );

            return { success: true, gistId: this.mainGistId };
          } catch (e) {
            lastError = e;
            if (i < this.settings.maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, this.settings.retryDelay));
            }
          }
        }

        throw lastError;
      } catch (e) {
        AuditLogger.error('GIST_SAVE_ERROR', e.message);
        return { success: false, error: e.message };
      }
    },

    // Load data from GitHub Gist
    async loadFromGist() {
      try {
        if (!this.mainGistId) {
          throw new Error('Main gist not initialized');
        }

        // Fetch gist
        const gist = await this._getGist(this.mainGistId);
        const file = Object.values(gist.files)[0];

        if (!file) {
          throw new Error('No data found in gist');
        }

        let content = file.content;

        // Decrypt if encrypted
        if (this.settings.encryptBeforeSave) {
          try {
            content = await CryptoEngine.decrypt(content);
          } catch (e) {
            AuditLogger.warn('GIST_DECRYPT_FAILED', 'Could not decrypt, using raw content');
          }
        }

        const data = JSON.parse(content);

        AuditLogger.info('GIST_LOADED',
          'Data loaded from GitHub Gist',
          { gistId: this.mainGistId }
        );

        return data;
      } catch (e) {
        AuditLogger.error('GIST_LOAD_ERROR', e.message);
        return null;
      }
    },

    // Create backup gist
    async _createBackupGist(content) {
      try {
        const filename = `vault-backup-${Date.now()}.json.bak`;
        const backup = await this._createGist(
          filename,
          content,
          `SYBER_VAULT_BACKUP_${new Date().toISOString()}`
        );

        this.backupGistIds.push(backup.id);

        // Keep only last 5 backups
        if (this.backupGistIds.length > 5) {
          const oldBackup = this.backupGistIds.shift();
          await this._deleteGist(oldBackup);
        }

        AuditLogger.debug('GIST_BACKUP_CREATED', 'Backup gist created', { backupId: backup.id });
        return backup;
      } catch (e) {
        AuditLogger.warn('GIST_BACKUP_FAILED', e.message);
      }
    },

    // List all gists
    async _listGists() {
      const response = await fetch(this.apiEndpoint, {
        headers: { 'Authorization': `token ${this.token}` }
      });

      if (!response.ok) throw new Error('Failed to list gists');
      return await response.json();
    },

    // Get specific gist
    async _getGist(gistId) {
      const response = await fetch(`${this.apiEndpoint}/${gistId}`, {
        headers: { 'Authorization': `token ${this.token}` }
      });

      if (!response.ok) throw new Error('Failed to get gist');
      return await response.json();
    },

    // Create new gist
    async _createGist(filename, content, description = '') {
      const payload = {
        description,
        public: false,
        files: {
          [filename]: { content }
        }
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create gist');
      }

      return await response.json();
    },

    // Update existing gist
    async _updateGist(gistId, filename, content) {
      const payload = {
        files: {
          [filename]: { content }
        }
      };

      const response = await fetch(`${this.apiEndpoint}/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update gist');
      }

      return await response.json();
    },

    // Delete gist
    async _deleteGist(gistId) {
      const response = await fetch(`${this.apiEndpoint}/${gistId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `token ${this.token}` }
      });

      if (!response.ok) throw new Error('Failed to delete gist');
      return true;
    },

    // Setup auto-sync
    _setupAutoSync() {
      setInterval(async () => {
        if (window.VAULT_DATA) {
          const result = await this.saveToGist(window.VAULT_DATA);
          if (result.success) {
            AuditLogger.debug('GIST_AUTOSYNC', 'Auto-synced to GitHub');
          }
        }
      }, this.settings.syncInterval);
    },

    // Force sync
    async forceSync() {
      if (window.VAULT_DATA) {
        return await this.saveToGist(window.VAULT_DATA);
      }
      return { success: false, error: 'No data to sync' };
    },

    // List backups
    async listBackups() {
      try {
        const gists = await this._listGists();
        return gists.filter(g => g.description && g.description.startsWith('SYBER_VAULT_BACKUP'));
      } catch (e) {
        AuditLogger.error('BACKUP_LIST_ERROR', e.message);
        return [];
      }
    },

    // Restore from backup
    async restoreFromBackup(backupGistId) {
      try {
        const gist = await this._getGist(backupGistId);
        const file = Object.values(gist.files)[0];

        let content = file.content;

        if (this.settings.encryptBeforeSave) {
          content = await CryptoEngine.decrypt(content);
        }

        const data = JSON.parse(content);

        // Save to main gist
        await this.saveToGist(data);

        AuditLogger.warn('DATA_RESTORED',
          'Data restored from backup gist',
          { backupId: backupGistId }
        );

        return { success: true, data };
      } catch (e) {
        AuditLogger.error('BACKUP_RESTORE_ERROR', e.message);
        return { success: false, error: e.message };
      }
    },

    // Get stats
    async getStats() {
      try {
        const gists = await this._listGists();
        const vaultGists = gists.filter(g =>
          g.description && g.description.startsWith('SYBER_VAULT')
        );

        return {
          totalGists: vaultGists.length,
          mainGistId: this.mainGistId,
          backupCount: this.backupGistIds.length,
          gists: vaultGists.map(g => ({
            id: g.id,
            description: g.description,
            createdAt: g.created_at,
            updatedAt: g.updated_at,
            url: g.html_url
          }))
        };
      } catch (e) {
        AuditLogger.error('STATS_ERROR', e.message);
        return null;
      }
    }
  };

  window.GistManager = GistManager;
})();
