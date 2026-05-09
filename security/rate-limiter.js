// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | RATE LIMITER
// Brute force protection, DDoS mitigation, Request throttling
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const RateLimiter = {
    // Rate limit rules
    rules: {
      login: { maxAttempts: 5, timeWindow: 60000, lockoutDuration: 1800000 }, // 5 attempts per min, 30min lockout
      api: { maxRequests: 100, timeWindow: 60000 }, // 100 requests per min
      fileUpload: { maxSize: 104857600, maxPerHour: 50 }, // 100MB per file, 50 files/hour
      fileDownload: { maxPerHour: 200 },
      passwordReset: { maxAttempts: 3, timeWindow: 3600000 } // 3 attempts per hour
    },

    // Track attempts
    attempts: {},
    lockouts: {},

    // Initialize
    init() {
      console.log('[RATE LIMITER] Initialized');
      this._setupCleanup();
      return true;
    },

    // Check if action is allowed
    isAllowed(action, identifier = 'anonymous') {
      const key = `${action}:${identifier}`;
      const rule = this.rules[action];

      if (!rule) return true;

      // Check lockout
      if (this.lockouts[key]) {
        if (Date.now() < this.lockouts[key].until) {
          return {
            allowed: false,
            reason: 'RATE_LIMITED',
            retryAfter: Math.ceil((this.lockouts[key].until - Date.now()) / 1000),
            lockoutExpiry: new Date(this.lockouts[key].until)
          };
        } else {
          delete this.lockouts[key];
        }
      }

      // Initialize tracking
      if (!this.attempts[key]) {
        this.attempts[key] = [];
      }

      // Clean old attempts
      const now = Date.now();
      this.attempts[key] = this.attempts[key].filter(t => now - t < rule.timeWindow);

      // Check limit
      if (this.attempts[key].length >= rule.maxAttempts) {
        // Lock out
        const lockoutDuration = rule.lockoutDuration || rule.timeWindow * 5;
        this.lockouts[key] = {
          until: now + lockoutDuration,
          reason: `Too many ${action} attempts`,
          attemptsCount: this.attempts[key].length
        };

        AuditLogger.warn('BRUTE_FORCE_DETECTED',
          `Rate limit exceeded for ${action}`,
          { action, identifier, attempts: this.attempts[key].length, lockoutDuration }
        );

        return {
          allowed: false,
          reason: 'RATE_LIMITED_LOCKOUT',
          retryAfter: Math.ceil(lockoutDuration / 1000),
          lockoutExpiry: new Date(now + lockoutDuration)
        };
      }

      // Record attempt
      this.attempts[key].push(now);
      const remaining = rule.maxAttempts - this.attempts[key].length;

      return {
        allowed: true,
        attemptsRemaining: remaining,
        totalAttempts: this.attempts[key].length
      };
    },

    // Record successful action (reset attempts)
    recordSuccess(action, identifier = 'anonymous') {
      const key = `${action}:${identifier}`;
      if (this.attempts[key]) {
        delete this.attempts[key];
      }
    },

    // Get attempt count
    getAttemptCount(action, identifier = 'anonymous') {
      const key = `${action}:${identifier}`;
      return (this.attempts[key] || []).length;
    },

    // Check if locked out
    isLockedOut(action, identifier = 'anonymous') {
      const key = `${action}:${identifier}`;
      if (!this.lockouts[key]) return false;
      if (Date.now() > this.lockouts[key].until) {
        delete this.lockouts[key];
        return false;
      }
      return true;
    },

    // Get lockout info
    getLockoutInfo(action, identifier = 'anonymous') {
      const key = `${action}:${identifier}`;
      const lockout = this.lockouts[key];
      if (!lockout) return null;
      if (Date.now() > lockout.until) {
        delete this.lockouts[key];
        return null;
      }
      return {
        ...lockout,
        secondsRemaining: Math.ceil((lockout.until - Date.now()) / 1000)
      };
    },

    // Reset attempts (admin function)
    resetAttempts(action, identifier) {
      const key = `${action}:${identifier}`;
      delete this.attempts[key];
      delete this.lockouts[key];

      AuditLogger.info('SYSTEM_CONFIG_CHANGED',
        'Rate limit attempts reset',
        { action, identifier, resetBy: window.currentUser?.username }
      );
    },

    // Get stats
    getStats() {
      const stats = {};
      for (const [key, attempts] of Object.entries(this.attempts)) {
        const [action, identifier] = key.split(':');
        if (!stats[action]) stats[action] = { totalTracked: 0, identifiers: [] };
        stats[action].totalTracked++;
        stats[action].identifiers.push({ identifier, count: attempts.length });
      }
      return stats;
    },

    // Auto-cleanup every hour
    _setupCleanup() {
      setInterval(() => {
        const now = Date.now();
        // Clean expired attempts
        for (const [key, attempts] of Object.entries(this.attempts)) {
          const rule = this.rules[key.split(':')[0]];
          if (rule) {
            this.attempts[key] = attempts.filter(t => now - t < rule.timeWindow);
            if (this.attempts[key].length === 0) delete this.attempts[key];
          }
        }
        // Clean expired lockouts
        for (const [key, lockout] of Object.entries(this.lockouts)) {
          if (now > lockout.until) delete this.lockouts[key];
        }
      }, 60 * 60 * 1000);
    }
  };

  window.RateLimiter = RateLimiter;
})();