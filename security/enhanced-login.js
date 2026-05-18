// ═══════════════════════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | ENHANCED SECURE LOGIN
// ডেটা রিয়েল-টাইম সেভ, এনক্রিপশন, সিকিউর অথেন্টিকেশন
// Real-time Data Persistence, Encryption, Security Audit Trail
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // Login styles
  const loginStyles = `
    .login-overlay { position: fixed; inset: 0; z-index: 5; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.4s ease; }
    .login-container { background: rgba(8,8,8,0.98); border: 2px solid rgba(0,255,65,0.5); padding: 40px 35px; width: 400px; max-width: 90vw; text-align: center; box-shadow: 0 0 50px rgba(0,255,65,0.2), inset 0 0 30px rgba(0,0,0,0.5); border-radius: 8px; }
    .login-icon { font-size: 50px; color: #00ff41; margin-bottom: 15px; animation: pulse 1.5s infinite; }
    .login-title { font-size: 18px; color: #00ff41; letter-spacing: 6px; margin-bottom: 5px; font-weight: bold; text-shadow: 0 0 20px rgba(0,255,65,0.5); }
    .login-subtitle { font-size: 10px; color: #666; letter-spacing: 4px; margin-bottom: 30px; text-transform: uppercase; }
    .login-form { display: flex; flex-direction: column; gap: 12px; }
    .login-input { width: 100%; padding: 14px; background: rgba(0,0,0,0.8); border: 1px solid rgba(0,255,65,0.3); color: #fff; font-family: 'Courier New', monospace; font-size: 13px; text-align: center; letter-spacing: 2px; border-radius: 4px; transition: all 0.3s; }
    .login-input:focus { border-color: #00ff41; box-shadow: 0 0 15px rgba(0,255,65,0.4), inset 0 0 10px rgba(0,255,65,0.1); color: #00ff41; outline: none; }
    .login-input::placeholder { color: #444; letter-spacing: 3px; }
    .login-btn { padding: 14px; background: transparent; border: 2px solid #00ff41; color: #00ff41; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 3px; font-weight: bold; transition: all 0.3s; border-radius: 4px; }
    .login-btn:hover:not(.locked) { background: #00ff41; color: #000; box-shadow: 0 0 25px rgba(0,255,65,0.5); }
    .login-btn.locked { border-color: #ff1a1a; color: #ff1a1a; opacity: 0.6; cursor: not-allowed; }
    .login-error { color: #ff1a1a; font-size: 11px; margin-top: 10px; display: none; letter-spacing: 1px; animation: shake 0.4s ease; border-left: 3px solid #ff1a1a; padding-left: 10px; }
    .login-error.show { display: block; }
    .login-footer { font-size: 8px; color: #333; margin-top: 20px; letter-spacing: 2px; }
    .login-progress { height: 3px; background: #1a1a1a; margin-top: 15px; border-radius: 2px; overflow: hidden; }
    .login-progress-bar { height: 100%; background: #00ff41; width: 0%; transition: width 0.3s; box-shadow: 0 0 10px rgba(0,255,65,0.7); }
    .login-status { font-size: 9px; color: #00ff41; margin-top: 10px; letter-spacing: 1px; display: none; }
    .login-status.show { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(0,255,65,0.6); } 50% { opacity: 0.5; text-shadow: 0 0 5px rgba(0,255,65,0.2); } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
  `;

  const EnhancedLogin = {
    isLoggingIn: false,
    bruteCount: 0,
    bruteLocked: false,
    bruteTimer: null,
    loginAttempts: [],

    // Initialize enhanced login
    init() {
      this._injectStyles();
      this._renderLoginPage();
      console.log('[LOGIN] Enhanced login system initialized');
    },

    // Inject CSS
    _injectStyles() {
      if (document.getElementById('enhancedLoginCSS')) return;
      const style = document.createElement('style');
      style.id = 'enhancedLoginCSS';
      style.textContent = loginStyles;
      document.head.appendChild(style);
    },

    // Render login page
    _renderLoginPage() {
      const app = document.getElementById('app');
      if (!app) return;

      app.innerHTML = `
        <canvas id="matrixCanvas" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></canvas>
        <div class="login-overlay" id="loginOverlay">
          <div class="login-container">
            <div class="login-icon">🔐</div>
            <h2 class="login-title">SYBER VAULT</h2>
            <p class="login-subtitle">// Encrypted Security System v8.0</p>
            
            <form class="login-form" id="loginForm" onsubmit="event.preventDefault(); window.EnhancedLogin.attemptLogin();">
              <input 
                class="login-input" 
                id="loginUser" 
                type="text"
                placeholder="USERNAME" 
                autocomplete="off" 
                maxlength="32"
                oninput="window.EnhancedLogin.resetError()"
                required
              >
              <input 
                class="login-input" 
                id="loginPass" 
                type="password"
                placeholder="PASSWORD" 
                maxlength="64"
                oninput="window.EnhancedLogin.resetError()"
                onkeypress="if(event.key==='Enter') window.EnhancedLogin.attemptLogin();"
                required
              >
              
              <div class="login-error" id="loginError" style="display: none;">
                <i class="fas fa-triangle-exclamation"></i>
                <span id="loginErrorMsg">ACCESS DENIED</span>
              </div>
              
              <div class="login-status" id="loginStatus">
                <i class="fas fa-spinner fa-spin"></i> Authenticating...
              </div>
              
              <div class="login-progress">
                <div class="login-progress-bar" id="loginProgressBar"></div>
              </div>
              
              <button class="login-btn" id="loginBtn" type="submit">
                <i class="fas fa-lock"></i> DECRYPT & ACCESS
              </button>
            </form>
            
            <div class="login-footer">
              &copy; 2026 SYBER VAULT | Secure Encrypted Vault System<br>
              All access attempts logged and monitored
            </div>
          </div>
        </div>
      `;

      // Initialize matrix background
      this._initMatrixBg();
    },

    // Attempt login
    async attemptLogin() {
      if (this.isLoggingIn || this.bruteLocked) return;

      const username = document.getElementById('loginUser').value.trim();
      const password = document.getElementById('loginPass').value;
      const errorEl = document.getElementById('loginError');
      const errorMsg = document.getElementById('loginErrorMsg');
      const statusEl = document.getElementById('loginStatus');
      const progressBar = document.getElementById('loginProgressBar');
      const btn = document.getElementById('loginBtn');

      // Validation
      if (!username || !password) {
        this._showError('ALL FIELDS REQUIRED');
        return;
      }

      if (password.length < 6) {
        this._showError('PASSWORD TOO SHORT');
        return;
      }

      // Check rate limit
      const limitCheck = RateLimiter.isAllowed('login', username);
      if (!limitCheck.allowed) {
        this._showError(`BRUTE FORCE DETECTED! Wait ${limitCheck.retryAfter}s`);
        this.bruteLocked = true;
        btn.classList.add('locked');
        btn.innerHTML = `<i class="fas fa-lock"></i> LOCKED ${limitCheck.retryAfter}s`;
        
        setTimeout(() => {
          this.bruteLocked = false;
          btn.classList.remove('locked');
          btn.innerHTML = '<i class="fas fa-lock"></i> DECRYPT & ACCESS';
        }, limitCheck.retryAfter * 1000);
        return;
      }

      this.isLoggingIn = true;
      btn.disabled = true;
      statusEl.classList.add('show');
      progressBar.style.width = '0%';

      try {
        // Log attempt
        AuditLogger.info('LOGIN_ATTEMPT',
          `Login attempt for user: ${username}`,
          { username, timestamp: new Date().toISOString() }
        );

        // Progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress = Math.min(progress + Math.random() * 30, 90);
          progressBar.style.width = progress + '%';
        }, 200);

        // Simulate secure authentication
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Validate credentials
        const result = await this._validateCredentials(username, password);

        if (result.success) {
          progress = 100;
          progressBar.style.width = '100%';
          
          clearInterval(progressInterval);

          // Initialize security systems
          const securityInit = await SecurityManager.init(password);
          if (!securityInit) throw new Error('Security initialization failed');

          // Create session
          const session = SessionManager.createSession(
            username,
            result.email,
            result.role
          );

          // Store auth token
          window.currentUser = { username, email: result.email, role: result.role };
          window.authToken = session.token;

          // Record success
          RateLimiter.recordSuccess('login', username);
          AuditLogger.info('LOGIN_SUCCESS', `User ${username} logged in`, { username, role: result.role });

          // Save session data
          await this._saveSessionData(session);

          // Show success animation
          statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Access Granted!';
          statusEl.style.color = '#00ff41';

          // Transition
          setTimeout(() => {
            document.getElementById('loginOverlay').style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => {
              if (typeof window.initDashboard === 'function') {
                window.initDashboard();
              }
            }, 500);
          }, 1000);
        } else {
          clearInterval(progressInterval);
          this.bruteCount++;
          RateLimiter.isAllowed('login', username); // Register attempt

          AuditLogger.warn('LOGIN_FAILED',
            `Failed login attempt for ${username}`,
            { username, attemptNumber: this.bruteCount }
          );

          this._showError(`ACCESS DENIED (${5 - this.bruteCount} attempts remaining)`);

          if (this.bruteCount >= 5) {
            this._showError('BRUTE FORCE LOCKOUT! Wait 30 seconds');
            this.bruteLocked = true;
            btn.classList.add('locked');
            btn.innerHTML = '<i class="fas fa-clock"></i> LOCKED 30s';

            setTimeout(() => {
              this.bruteLocked = false;
              this.bruteCount = 0;
              btn.classList.remove('locked');
              btn.innerHTML = '<i class="fas fa-lock"></i> DECRYPT & ACCESS';
              errorEl.classList.remove('show');
            }, 30000);
          }
        }
      } catch (e) {
        AuditLogger.error('LOGIN_ERROR', e.message);
        this._showError('AUTHENTICATION ERROR');
      } finally {
        this.isLoggingIn = false;
        btn.disabled = false;
        statusEl.classList.remove('show');
      }
    },

    // Validate credentials
    async _validateCredentials(username, password) {
      // Hash the password
      const passwordHash = await CryptoEngine.hashPassword(password);

      // Mock validation - replace with real API call
      const validUsers = {
        'sybervault': {
          password: 'sybervault@209209',
          email: 'sybervault@gmail.com',
          role: 'main_admin'
        }
      };

      const user = validUsers[username];
      if (!user) return { success: false };

      // Compare passwords (in production, use secure comparison)
      if (user.password === password) {
        return {
          success: true,
          email: user.email,
          role: user.role
        };
      }

      return { success: false };
    },

    // Save session data
    async _saveSessionData(session) {
      try {
        const sessionData = {
          sessionId: session.sessionId,
          token: session.token,
          userId: session.userId,
          email: session.email,
          role: session.role,
          createdAt: session.createdAt,
          lastSync: new Date().toISOString()
        };

        // Save to sessionStorage
        sessionStorage.setItem('VAULT_SESSION_ACTIVE', JSON.stringify(sessionData));

        // Log save
        AuditLogger.info('SESSION_DATA_SAVED',
          'Session data persisted',
          { sessionId: session.sessionId }
        );
      } catch (e) {
        console.error('[SESSION SAVE ERROR]', e.message);
      }
    },

    // Show error
    _showError(message) {
      const errorEl = document.getElementById('loginError');
      const errorMsg = document.getElementById('loginErrorMsg');
      if (errorMsg) errorMsg.textContent = message;
      if (errorEl) errorEl.classList.add('show');
    },

    // Reset error
    resetError() {
      const errorEl = document.getElementById('loginError');
      if (errorEl) errorEl.classList.remove('show');
    },

    // Matrix background
    _initMatrixBg() {
      const c = document.getElementById('matrixCanvas');
      if (!c) return;

      const ctx = c.getContext('2d');
      c.width = window.innerWidth;
      c.height = window.innerHeight;

      const chars = '01アイウエオカキクケコサシスセソタチツテト';
      const fontSize = 14;
      const columns = Math.floor(c.width / fontSize);
      const drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * 20));

      const draw = () => {
        if (!document.getElementById('matrixCanvas')) return;
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#00ff41';

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > c.height && Math.random() > 0.98) drops[i] = 0;
          drops[i]++;
        }
        requestAnimationFrame(draw);
      };
      draw();
    }
  };

  window.EnhancedLogin = EnhancedLogin;
  
  // Auto-init when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EnhancedLogin.init());
  } else {
    EnhancedLogin.init();
  }
})();
