// ═══════════════════════════════════════════════════════════════
// SYBER VAULT v8.0 | SESSION MANAGER
// Session tracking, Token management, Activity monitoring
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const SessionManager = {
    sessions: new Map(),
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes before timeout
    currentSession: null,

    // Initialize session
    createSession(userId, email, role) {
      const sessionId = this._generateSessionId();
      const token = this._generateToken();
      const now = Date.now();

      const session = {
        sessionId,
        token,
        userId,
        email,
        role,
        createdAt: new Date(now),
        lastActivity: new Date(now),
        expiresAt: new Date(now + this.sessionTimeout),
        ipAddress: this._getClientIP(),
        userAgent: navigator.userAgent,
        isActive: true,
        activities: [],
        warnings: 0
      };

      this.sessions.set(sessionId, session);
      this.currentSession = session;
      this._setupSessionMonitor();

      AuditLogger.info('LOGIN_SUCCESS',
        `Session created for user ${userId}`,
        { sessionId, userId, email, role }
      );

      // Store in sessionStorage
      sessionStorage.setItem('VAULT_SESSION', JSON.stringify({
        sessionId,
        token,
        userId,
        createdAt: session.createdAt
      }));

      return session;
    },

    // Log activity
    logActivity(activity) {
      if (!this.currentSession) return;
      
      const activityRecord = {
        timestamp: new Date(),
        action: activity.action,
        details: activity.details || {},
        target: activity.target
      };

      this.currentSession.activities.push(activityRecord);
      this.currentSession.lastActivity = new Date();
      this.currentSession.expiresAt = new Date(Date.now() + this.sessionTimeout);

      // Keep only last 1000 activities
      if (this.currentSession.activities.length > 1000) {
        this.currentSession.activities = this.currentSession.activities.slice(-1000);
      }
    },

    // Check session validity
    isValid(sessionId, token) {
      const session = this.sessions.get(sessionId);
      if (!session) return false;

      const now = Date.now();
      if (now > session.expiresAt.getTime()) {
        this.endSession(sessionId, 'EXPIRED');
        return false;
      }

      if (session.token !== token) return false;
      if (!session.isActive) return false;

      return true;
    },

    // End session
    endSession(sessionId, reason = 'LOGOUT') {
      const session = this.sessions.get(sessionId);
      if (!session) return;

      session.isActive = false;
      session.endedAt = new Date();
      session.endReason = reason;

      AuditLogger.info('LOGOUT',
        `Session ended: ${reason}`,
        {
          sessionId,
          userId: session.userId,
          duration: session.endedAt - session.createdAt,
          activitiesCount: session.activities.length
        }
      );

      sessionStorage.removeItem('VAULT_SESSION');
      this.currentSession = null;

      // Cleanup expired sessions
      this._cleanup();
    },

    // Verify session token
    verifyToken(token) {
      if (!this.currentSession) return false;
      return this.currentSession.token === token;
    },

    // Get current session info
    getCurrentSession() {
      if (!this.currentSession || !this.currentSession.isActive) return null;
      
      const now = Date.now();
      if (now > this.currentSession.expiresAt.getTime()) {
        this.endSession(this.currentSession.sessionId, 'EXPIRED');
        return null;
      }

      return {
        sessionId: this.currentSession.sessionId,
        userId: this.currentSession.userId,
        email: this.currentSession.email,
        role: this.currentSession.role,
        createdAt: this.currentSession.createdAt,
        expiresAt: this.currentSession.expiresAt,
        lastActivity: this.currentSession.lastActivity,
        timeRemaining: Math.max(0, this.currentSession.expiresAt.getTime() - now),
        activitiesCount: this.currentSession.activities.length
      };
    },

    // Get session activity log
    getActivityLog(sessionId, limit = 100) {
      const session = this.sessions.get(sessionId);
      if (!session) return [];
      return session.activities.slice(-limit);
    },

    // Setup session monitor
    _setupSessionMonitor() {
      // Monitor for inactivity
      const inactivityTimer = setInterval(() => {
        if (!this.currentSession || !this.currentSession.isActive) {
          clearInterval(inactivityTimer);
          return;
        }

        const now = Date.now();
        const lastActivity = this.currentSession.lastActivity.getTime();
        const timeSinceActivity = now - lastActivity;

        // Warning at 5 minutes before timeout
        if (timeSinceActivity > this.sessionTimeout - this.warningTime &&
            timeSinceActivity < this.sessionTimeout &&
            this.currentSession.warnings === 0) {
          this.currentSession.warnings++;
          AuditLogger.warn('SESSION_WARNING',
            'Session expiring soon due to inactivity',
            { sessionId: this.currentSession.sessionId, minutesRemaining: 5 }
          );
          window.dispatchEvent(new CustomEvent('session:warning', {
            detail: { timeRemaining: this.sessionTimeout - timeSinceActivity }
          }));
        }

        // Timeout
        if (timeSinceActivity > this.sessionTimeout) {
          this.endSession(this.currentSession.sessionId, 'INACTIVITY_TIMEOUT');
          window.dispatchEvent(new CustomEvent('session:expired'));
        }
      }, 60000); // Check every minute
    },

    // Get all active sessions
    getActiveSessions() {
      const active = [];
      for (const [sessionId, session] of this.sessions) {
        if (session.isActive && Date.now() < session.expiresAt.getTime()) {
          active.push({
            sessionId,
            userId: session.userId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            ipAddress: session.ipAddress
          });
        }
      }
      return active;
    },

    // Cleanup expired sessions
    _cleanup() {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions) {
        if (now > session.expiresAt.getTime() + 60 * 60 * 1000) {
          this.sessions.delete(sessionId);
        }
      }
    },

    // Generate session ID
    _generateSessionId() {
      return `SID_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Generate token
    _generateToken() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    },

    // Get client IP (placeholder)
    _getClientIP() {
      return 'CLIENT_IP';
    }
  };

  window.SessionManager = SessionManager;
})();