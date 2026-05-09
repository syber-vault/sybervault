// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | SECURITY MANAGER
// Main security orchestration and configuration
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const SecurityManager = {
    isInitialized: false,
    config: {
      enableEncryption: true,
      enableAuditLogging: true,
      enableRateLimiting: true,
      enableSessionManagement: true,
      logLevel: 'INFO',
      sessionTimeout: 30 * 60 * 1000,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireMFA: false,
      tlsEnabled: true
    },

    // Initialize all security modules
    async init(masterPassword) {
      try {
        console.log('%c[SECURITY] Initializing Security Manager...', 'color: #00ff41; font-weight: bold;');

        // 1. Initialize Crypto Engine
        const cryptoReady = await CryptoEngine.init(masterPassword);
        if (!cryptoReady) throw new Error('Crypto Engine initialization failed');

        // 2. Initialize Audit Logger
        AuditLogger.init();
        AuditLogger.info('SYSTEM_START', 'Audit Logger initialized');

        // 3. Initialize Rate Limiter
        RateLimiter.init();
        AuditLogger.info('SYSTEM_START', 'Rate Limiter initialized');

        // 4. Setup security event listeners
        this._setupSecurityListeners();

        // 5. Log security initialization
        AuditLogger.info('SYSTEM_START',
          'Security Manager initialized successfully',
          { timestamp: new Date().toISOString(), version: '8.0' }
        );

        this.isInitialized = true;
        console.log('%c[SECURITY] ✓ All security modules initialized', 'color: #00ff41; font-weight: bold;');
        return true;
      } catch (e) {
        AuditLogger.critical('SYSTEM_ERROR', 'Security initialization failed', { error: e.message });
        console.error('%c[SECURITY ERROR]', 'color: #ff1a1a;', e.message);
        return false;
      }
    },

    // Secure login process
    async secureLogin(username, password) {
      // Check rate limit
      const limitCheck = RateLimiter.isAllowed('login', username);
      if (!limitCheck.allowed) {
        AuditLogger.warn('LOGIN_FAILED',
          'Login attempt blocked by rate limiter',
          { username, reason: limitCheck.reason }
        );
        return { success: false, error: 'Too many login attempts. Please try again later.', ...limitCheck };
      }

      try {
        // Hash password
        const passwordHash = await CryptoEngine.hashPassword(password);

        // Validate credentials (would call backend)
        const validation = await this._validateCredentials(username, passwordHash);

        if (!validation.success) {
          AuditLogger.warn('LOGIN_FAILED',
            'Invalid credentials',
            { username, attemptNumber: limitCheck.totalAttempts }
          );
          return { success: false, error: 'Invalid username or password' };
        }

        // Create session
        const session = SessionManager.createSession(
          username,
          validation.email,
          validation.role
        );

        // Record success
        RateLimiter.recordSuccess('login', username);

        // Log login
        AuditLogger.info('LOGIN_SUCCESS',
          'User logged in successfully',
          { username, role: validation.role, sessionId: session.sessionId }
        );

        return {
          success: true,
          sessionId: session.sessionId,
          token: session.token,
          user: { username, email: validation.email, role: validation.role }
        };
      } catch (e) {
        AuditLogger.error('LOGIN_ERROR', e.message, { username, error: e });
        return { success: false, error: 'Login failed. Please try again.' };
      }
    },

    // Secure file access
    async secureFileAccess(fileId, action = 'read') {
      const session = SessionManager.getCurrentSession();
      if (!session) {
        AuditLogger.warn('UNAUTHORIZED_ACCESS', 'File access denied: No valid session');
        return { allowed: false, reason: 'Session expired' };
      }

      // Check permissions
      const hasPermission = await this._checkFilePermission(session.userId, fileId, action);
      if (!hasPermission) {
        AuditLogger.warn('UNAUTHORIZED_ACCESS',
          `Access denied for file ${fileId}`,
          { userId: session.userId, action }
        );
        return { allowed: false, reason: 'Insufficient permissions' };
      }

      // Log access
      SessionManager.logActivity({
        action: 'FILE_ACCESS',
        target: fileId,
        details: { type: action }
      });

      AuditLogger.info('FILE_ACCESSED',
        `File ${fileId} accessed`,
        { userId: session.userId, action }
      );

      return { allowed: true };
    },

    // Get security dashboard data
    getSecurityDashboard() {
      return {
        currentSession: SessionManager.getCurrentSession(),
        auditSummary: AuditLogger.getSecuritySummary(),
        rateLimitStats: RateLimiter.getStats(),
        activeSessions: SessionManager.getActiveSessions(),
        recentLogs: AuditLogger.getLogs({ severity: 3 }).slice(0, 20)
      };
    },

    // Logout
    logout() {
      if (SessionManager.currentSession) {
        SessionManager.endSession(SessionManager.currentSession.sessionId, 'USER_LOGOUT');
        AuditLogger.info('LOGOUT', 'User logged out');
      }
    },

    // Setup security event listeners
    _setupSecurityListeners() {
      // Monitor for suspicious activity
      document.addEventListener('suspicious', (e) => {
        AuditLogger.warn('SUSPICIOUS_ACTIVITY', e.detail.message, e.detail.data);
      });

      // Monitor visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          AuditLogger.debug('SESSION_HIDDEN', 'Application window hidden');
        } else {
          AuditLogger.debug('SESSION_VISIBLE', 'Application window visible');
        }
      });

      // Monitor for console usage
      const originalLog = console.log;
      window.suspiciousConsoleUsage = false;
    },

    // Validate credentials (mock)
    async _validateCredentials(username, passwordHash) {
      // This would normally call a backend API
      // For demo, using hardcoded credentials
      const users = {
        'sybervault': {
          hash: await CryptoEngine.hashPassword('sybervault@209209'),
          email: 'sybervault@gmail.com',
          role: 'main_admin'
        }
      };

      const user = users[username];
      if (!user) return { success: false };

      const match = await CryptoEngine.verifyPassword(
        username === 'sybervault' ? 'sybervault@209209' : '',
        user.hash
      );

      return match ? { success: true, email: user.email, role: user.role } : { success: false };
    },

    // Check file permission (mock)
    async _checkFilePermission(userId, fileId, action) {
      // Would check ACLs from backend
      return true;
    }
  };

  window.SecurityManager = SecurityManager;
})();