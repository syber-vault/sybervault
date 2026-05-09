// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | RENDER ENGINE
// Real-time UI Rendering, Dynamic Updates, Live Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const RenderEngine = {
    // Configuration
    renderTarget: 'app',
    updateInterval: 500, // Update every 500ms
    enableAnimations: true,
    theme: 'dark',

    // State
    isRendering: false,
    lastRenderTime: null,
    renderQueue: [],

    // Initialize renderer
    init() {
      console.log('[RENDER ENGINE] Initializing render engine');
      this._injectGlobalStyles();
      this._setupRenderLoop();
      this._setupEventListeners();
      AuditLogger.info('SYSTEM_START', 'Render Engine initialized');
      return true;
    },

    // Inject global styles
    _injectGlobalStyles() {
      if (document.getElementById('renderEngineStyles')) return;

      const styles = `
        * { box-sizing: border-box; }
        
        body {
          margin: 0;
          padding: 0;
          background: #0a0a0a;
          color: #c0c0c0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow: hidden;
        }

        #app {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.4s ease;
        }

        .header {
          background: rgba(0, 255, 65, 0.05);
          border-bottom: 1px solid rgba(0, 255, 65, 0.2);
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .header-title {
          font-size: 18px;
          color: #00ff41;
          font-weight: bold;
          letter-spacing: 3px;
          text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
        }

        .header-info {
          display: flex;
          gap: 20px;
          font-size: 11px;
          color: #666;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(0, 255, 65, 0.1);
          border: 1px solid #00ff41;
          border-radius: 3px;
          color: #00ff41;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .status-badge.synced { background: rgba(0, 200, 65, 0.2); color: #00c841; }
        .status-badge.syncing { background: rgba(255, 184, 0, 0.2); color: #ffb800; animation: pulse 1s infinite; }
        .status-badge.offline { background: rgba(255, 26, 26, 0.2); color: #ff1a1a; }

        .main-container {
          display: flex;
          flex: 1;
          overflow: hidden;
          gap: 1px;
          background: #1a1a1a;
        }

        .sidebar {
          width: 250px;
          background: rgba(0, 0, 0, 0.8);
          border-right: 1px solid rgba(0, 255, 65, 0.1);
          overflow-y: auto;
          padding: 15px;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .toolbar {
          background: rgba(0, 255, 65, 0.03);
          border-bottom: 1px solid rgba(0, 255, 65, 0.1);
          padding: 10px 15px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn {
          padding: 8px 15px;
          background: transparent;
          border: 1px solid rgba(0, 255, 65, 0.3);
          color: #00ff41;
          cursor: pointer;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .btn:hover {
          background: rgba(0, 255, 65, 0.1);
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
        }

        .btn.primary {
          border-color: #00ff41;
          background: rgba(0, 255, 65, 0.15);
        }

        .data-view {
          flex: 1;
          overflow: auto;
          padding: 15px;
        }

        .stats-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: rgba(0, 255, 65, 0.05);
          border: 1px solid rgba(0, 255, 65, 0.2);
          padding: 15px;
          border-radius: 5px;
          animation: slideUp 0.3s ease;
        }

        .stat-label {
          font-size: 11px;
          color: #666;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 24px;
          color: #00ff41;
          font-weight: bold;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        .data-table th {
          background: rgba(0, 255, 65, 0.1);
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 255, 65, 0.2);
          color: #00ff41;
          font-weight: bold;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .data-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(0, 255, 65, 0.1);
          font-size: 12px;
        }

        .data-table tr:hover {
          background: rgba(0, 255, 65, 0.05);
        }

        .loading-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0, 255, 65, 0.3);
          border-top-color: #00ff41;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 65, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 65, 0.5);
        }
      `;

      const styleEl = document.createElement('style');
      styleEl.id = 'renderEngineStyles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    },

    // Setup render loop
    _setupRenderLoop() {
      setInterval(() => {
        if (!this.isRendering && window.VAULT_DATA) {
          this.renderDashboard();
        }
      }, this.updateInterval);
    },

    // Setup event listeners
    _setupEventListeners() {
      document.addEventListener('data:changed', () => this.renderDashboard());
      document.addEventListener('data:synced', () => this.renderDashboard());
      window.addEventListener('resize', () => this.renderDashboard());
    },

    // Main dashboard render
    async renderDashboard() {
      if (this.isRendering) return;
      this.isRendering = true;

      try {
        const app = document.getElementById(this.renderTarget);
        if (!app) return;

        const syncStatus = AutoDataSync.getSyncStatus();
        const sessionInfo = SessionManager.getCurrentSession();
        const auditSummary = AuditLogger.getSecuritySummary(24);
        const storageStats = DataPersistence.getStorageStats();

        app.innerHTML = `
          <div class="header">
            <div class="header-title">🔐 SYBER_VAULT v8.0</div>
            <div class="header-info">
              <span>👤 ${sessionInfo?.userId || 'Anonymous'}</span>
              <span>💾 ${storageStats.itemCount} items</span>
              <span class="status-badge ${syncStatus.isSyncing ? 'syncing' : 'synced'}">
                ${syncStatus.isSyncing ? '<span class="loading-spinner"></span> SYNCING' : '✓ SYNCED'}
              </span>
            </div>
          </div>
          
          <div class="main-container">
            <div class="sidebar">
              ${this._renderSidebar()}
            </div>
            
            <div class="content">
              <div class="toolbar">
                <button class="btn primary" onclick="window.RenderEngine.syncNow()"><i class="fas fa-sync"></i> SYNC NOW</button>
                <button class="btn" onclick="window.RenderEngine.showSettings()"><i class="fas fa-cog"></i> SETTINGS</button>
                <button class="btn" onclick="window.SecurityManager.logout()"><i class="fas fa-sign-out-alt"></i> LOGOUT</button>
              </div>
              
              <div class="data-view">
                ${this._renderMainContent(syncStatus, auditSummary, storageStats)}
              </div>
            </div>
          </div>
        `;

        this.lastRenderTime = Date.now();
      } catch (e) {
        console.error('[RENDER ERROR]', e.message);
      } finally {
        this.isRendering = false;
      }
    },

    // Render sidebar
    _renderSidebar() {
      const data = window.VAULT_DATA || {};
      const repos = data.repos || [];

      return `
        <h3 style="color: #00ff41; margin-top: 0; letter-spacing: 2px;">REPOSITORIES</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${repos.map(repo => `
            <div style="
              padding: 10px;
              background: rgba(0, 255, 65, 0.08);
              border: 1px solid rgba(0, 255, 65, 0.15);
              border-radius: 3px;
              cursor: pointer;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0, 255, 65, 0.15)'" onmouseout="this.style.background='rgba(0, 255, 65, 0.08)'">
              <i class="fas ${repo.icon}"></i> ${repo.name}
              <div style="font-size: 10px; color: #666; margin-top: 5px;">${(data.files[repo.id] || []).length} files</div>
            </div>
          `).join('')}
          
          <button class="btn" style="margin-top: 10px; width: 100%;" onclick="alert('Add new repo')">
            <i class="fas fa-plus"></i> NEW REPO
          </button>
        </div>
      `;
    },

    // Render main content
    _renderMainContent(syncStatus, auditSummary, storageStats) {
      return `
        <div class="stats-panel">
          <div class="stat-card">
            <div class="stat-label">🗑 PENDING SYNCS</div>
            <div class="stat-value">${syncStatus.pendingChanges}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">⚠️ FAILED LOGINS</div>
            <div class="stat-value">${auditSummary.failedLogins}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">🇸 TOTAL EVENTS</div>
            <div class="stat-value">${auditSummary.totalEvents}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">💾 STORAGE</div>
            <div class="stat-value">${storageStats.totalStorageUsedMB} MB</div>
          </div>
        </div>

        <h3 style="color: #00ff41; margin-top: 20px; letter-spacing: 2px;">RECENT ACTIVITY</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>EVENT</th>
              <th>STATUS</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            ${AuditLogger.getLogs().slice(0, 10).map(log => `
              <tr>
                <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>${log.eventType}</td>
                <td><span style="color: ${log.level === 'ERROR' ? '#ff1a1a' : '#00ff41'}">${log.level}</span></td>
                <td>${log.message}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    },

    // Sync now
    async syncNow() {
      AuditLogger.info('MANUAL_SYNC', 'User initiated manual sync');
      await GistManager.forceSync();
      this.renderDashboard();
    },

    // Show settings
    showSettings() {
      const stats = GistManager.getStats?.() || {};
      alert(`
        GitHub Gist Settings
        
Main Gist: ${GistManager.mainGistId || 'Not configured'}
Backup Count: ${GistManager.backupGistIds?.length || 0}
Auto Sync: ${GistManager.settings?.autoSync ? 'Enabled' : 'Disabled'}
Encryption: ${GistManager.settings?.encryptBeforeSave ? 'Enabled' : 'Disabled'}
      `);
    }
  };

  window.RenderEngine = RenderEngine;
})();
