// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | PASSWORD MANAGER
// Master Password, Account Credentials, Site Protection
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const PasswordManager = {
    // Master Password Configuration
    masterPassword: null,
    masterPasswordHash: null,
    isAuthenticated: false,
    passwordAttempts: 0,
    maxAttempts: 3,
    lockoutTime: 300000, // 5 minutes
    lockoutUntil: null,

    // Storage Keys
    STORAGE_KEYS: {
      MASTER_HASH: 'VAULT_MASTER_PASSWORD_HASH',
      AUTH_TOKEN: 'VAULT_AUTH_TOKEN',
      AUTH_TIMESTAMP: 'VAULT_AUTH_TIMESTAMP',
      SESSION_KEY: 'VAULT_SESSION_KEY'
    },

    // Initialize password manager
    async init() {
      console.log('[PASSWORD MANAGER] Initializing...');
      
      // Check if master password is set
      const masterHash = localStorage.getItem(this.STORAGE_KEYS.MASTER_HASH);
      if (!masterHash) {
        // First time setup
        await this._setupMasterPassword();
      } else {
        // Existing setup, require authentication
        await this._requireAuthentication();
      }

      AuditLogger.info('SYSTEM_START', 'Password Manager initialized');
      return this.isAuthenticated;
    },

    // Setup master password (first time)
    async _setupMasterPassword() {
      return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        `;

        dialog.innerHTML = `
          <div style="
            background: rgba(10, 10, 10, 0.9);
            border: 2px solid rgba(0, 255, 65, 0.5);
            padding: 40px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 50px rgba(0, 255, 65, 0.2);
          ">
            <h2 style="color: #00ff41; margin-bottom: 20px; letter-spacing: 2px;">🔐 SET MASTER PASSWORD</h2>
            <p style="color: #888; margin-bottom: 20px; font-size: 12px;">
              Create a strong master password to protect your vault.
              <br>You will need this every time you access the system.
            </p>
            
            <input 
              id="newPassword" 
              type="password" 
              placeholder="Enter Master Password"
              style="
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(0, 255, 65, 0.3);
                color: #00ff41;
                font-family: 'Courier New', monospace;
                border-radius: 4px;
              "
            >
            
            <input 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm Password"
              style="
                width: 100%;
                padding: 12px;
                margin-bottom: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(0, 255, 65, 0.3);
                color: #00ff41;
                font-family: 'Courier New', monospace;
                border-radius: 4px;
              "
            >
            
            <div id="error" style="color: #ff1a1a; font-size: 11px; margin-bottom: 15px; display: none;"></div>
            
            <button onclick="window.PasswordManager._confirmSetup()" style="
              width: 100%;
              padding: 12px;
              background: rgba(0, 255, 65, 0.15);
              border: 2px solid #00ff41;
              color: #00ff41;
              cursor: pointer;
              font-weight: bold;
              letter-spacing: 2px;
              border-radius: 4px;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0, 255, 65, 0.3)'" onmouseout="this.style.background='rgba(0, 255, 65, 0.15)'">
              SET PASSWORD
            </button>
          </div>
        `;

        document.body.appendChild(dialog);
        document.getElementById('newPassword').focus();

        window.PasswordManager._setupDialog = dialog;
        window.PasswordManager._setupResolve = resolve;
      });
    },

    // Confirm setup
    async _confirmSetup() {
      const password = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;
      const error = document.getElementById('error');

      if (!password) {
        error.textContent = 'Password is required';
        error.style.display = 'block';
        return;
      }

      if (password.length < 8) {
        error.textContent = 'Password must be at least 8 characters';
        error.style.display = 'block';
        return;
      }

      if (password !== confirm) {
        error.textContent = 'Passwords do not match';
        error.style.display = 'block';
        return;
      }

      // Hash and save
      const hash = await CryptoEngine.hashPassword(password);
      localStorage.setItem(this.STORAGE_KEYS.MASTER_HASH, hash);
      
      this.masterPassword = password;
      this.masterPasswordHash = hash;
      this.isAuthenticated = true;

      // Create auth token
      const token = CryptoEngine.generateToken(32);
      localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.AUTH_TIMESTAMP, Date.now().toString());

      // Initialize crypto with master password
      await CryptoEngine.init(password);

      AuditLogger.info('MASTER_PASSWORD_SET',
        'Master password created successfully',
        { timestamp: new Date().toISOString() }
      );

      this._setupDialog.remove();
      this._setupResolve(true);
    },

    // Require authentication
    async _requireAuthentication() {
      return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        `;

        dialog.innerHTML = `
          <div style="
            background: rgba(10, 10, 10, 0.9);
            border: 2px solid rgba(0, 255, 65, 0.5);
            padding: 40px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 50px rgba(0, 255, 65, 0.2);
          ">
            <h2 style="color: #00ff41; margin-bottom: 20px; letter-spacing: 2px;">🔓 UNLOCK VAULT</h2>
            <p style="color: #888; margin-bottom: 20px; font-size: 12px;">
              Enter your master password to access the vault.
            </p>
            
            <input 
              id="authPassword" 
              type="password" 
              placeholder="Master Password"
              style="
                width: 100%;
                padding: 12px;
                margin-bottom: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(0, 255, 65, 0.3);
                color: #00ff41;
                font-family: 'Courier New', monospace;
                border-radius: 4px;
              "
              onkeypress="if(event.key==='Enter') window.PasswordManager._confirmAuth();"
            >
            
            <div id="authError" style="color: #ff1a1a; font-size: 11px; margin-bottom: 15px; display: none;"></div>
            
            <button onclick="window.PasswordManager._confirmAuth()" style="
              width: 100%;
              padding: 12px;
              background: rgba(0, 255, 65, 0.15);
              border: 2px solid #00ff41;
              color: #00ff41;
              cursor: pointer;
              font-weight: bold;
              letter-spacing: 2px;
              border-radius: 4px;
              transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0, 255, 65, 0.3)'" onmouseout="this.style.background='rgba(0, 255, 65, 0.15)'">
              UNLOCK
            </button>
          </div>
        `;

        document.body.appendChild(dialog);
        document.getElementById('authPassword').focus();

        window.PasswordManager._authDialog = dialog;
        window.PasswordManager._authResolve = resolve;
      });
    },

    // Confirm authentication
    async _confirmAuth() {
      const password = document.getElementById('authPassword').value;
      const error = document.getElementById('authError');

      // Check lockout
      if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
        const remaining = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
        error.textContent = `Too many attempts. Wait ${remaining}s`;
        error.style.display = 'block';
        return;
      }

      if (!password) {
        error.textContent = 'Password is required';
        error.style.display = 'block';
        return;
      }

      // Verify password
      const hash = await CryptoEngine.hashPassword(password);
      const storedHash = localStorage.getItem(this.STORAGE_KEYS.MASTER_HASH);

      if (hash !== storedHash) {
        this.passwordAttempts++;
        AuditLogger.warn('AUTHENTICATION_FAILED',
          `Failed authentication attempt (${this.passwordAttempts}/${this.maxAttempts})`,
          { attempts: this.passwordAttempts }
        );

        if (this.passwordAttempts >= this.maxAttempts) {
          this.lockoutUntil = Date.now() + this.lockoutTime;
          error.textContent = 'Too many failed attempts. Locked for 5 minutes.';
          error.style.color = '#ff1a1a';
          error.style.display = 'block';
          return;
        }

        const remaining = this.maxAttempts - this.passwordAttempts;
        error.textContent = `Incorrect password. ${remaining} attempts remaining.`;
        error.style.display = 'block';
        return;
      }

      // Success
      this.masterPassword = password;
      this.masterPasswordHash = hash;
      this.isAuthenticated = true;
      this.passwordAttempts = 0;

      // Create auth token
      const token = CryptoEngine.generateToken(32);
      localStorage.setItem(this.STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.AUTH_TIMESTAMP, Date.now().toString());

      // Initialize crypto
      await CryptoEngine.init(password);

      AuditLogger.info('AUTHENTICATION_SUCCESS',
        'Master password verified successfully',
        { timestamp: new Date().toISOString() }
      );

      this._authDialog.remove();
      this._authResolve(true);
    },

    // Check if authenticated
    isAuthed() {
      const token = localStorage.getItem(this.STORAGE_KEYS.AUTH_TOKEN);
      const timestamp = parseInt(localStorage.getItem(this.STORAGE_KEYS.AUTH_TIMESTAMP) || '0');
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes

      if (!token) return false;
      if (Date.now() - timestamp > sessionTimeout) return false;

      return this.isAuthenticated;
    },

    // Logout
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem(this.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.AUTH_TIMESTAMP);
      AuditLogger.info('LOGOUT', 'User logged out');
      window.location.reload();
    },

    // Get authentication status
    getStatus() {
      const timestamp = parseInt(localStorage.getItem(this.STORAGE_KEYS.AUTH_TIMESTAMP) || '0');
      const sessionTimeout = 30 * 60 * 1000;
      const remaining = Math.max(0, sessionTimeout - (Date.now() - timestamp));

      return {
        isAuthenticated: this.isAuthenticated,
        remainingTime: remaining,
        remainingMinutes: Math.floor(remaining / 60000)
      };
    }
  };

  window.PasswordManager = PasswordManager;
})();
