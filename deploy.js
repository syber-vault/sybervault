// ═══════════════════════════════════════
// SYBER VAULT v8.0 | DEPLOY & INIT ENGINE
// ═══════════════════════════════════════
(function() {
  'use strict';

  // System Initialization
  window.VAULT_INIT = function() {
    console.log("🚀 Syber Vault v8.0 Initializing...");
    
    // Check if Data exists, else create default
    if (!window.VAULT_DATA) {
      window.VAULT_DATA = {
        repos: [{ 
          id: 'd1', 
          name: 'SyberVault', 
          icon: 'fa-solid fa-database', 
          type: 'normal', 
          date: new Date().toLocaleDateString(), 
          isPublic: false, 
          token: 'vault_initial', 
          link: '' 
        }],
        files: { 'd1': [] },
        currentRepo: 'd1',
        currentFolder: null,
        folderHistory: []
      };
    }
  };

  // Environment Check (Messenger GoatBot compatibility)
  window.checkEnv = function() {
    var isBrowser = typeof window !== 'undefined';
    var hasFetch = typeof fetch !== 'undefined';
    return isBrowser && hasFetch;
  };

  // Global Deploy/Refresh
  window.vRefresh = function() {
    var m = document.getElementById('mainpanel');
    if (m && typeof window.renderVault === 'function') {
      window.renderVault(m);
    }
    // Sync to Gist if available
    if (typeof window.vGistSync === 'function') {
      window.vGistSync();
    }
  };

  // Helper: Copy to Clipboard
  window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(function() {
      alert("✅ Copied to clipboard!");
    }).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  };

  // Start initialization
  window.VAULT_INIT();
  console.log("✅ Syber Vault System Ready.");

})();
