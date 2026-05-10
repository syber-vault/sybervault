# 🔐 SYBER VAULT v8.0 - GitHub Gist Integration Guide

## পূর্ব সেটঅপ (Complete Setup)

### **Step 1: GitHub Personal Access Token তৈরি করুন**

1. GitHub এ যান: https://github.com/settings/tokens
2. **Generate new token (classic)** ক্লিক করুন
3. Token name দিন: `SYBER_VAULT_ACCESS`
4. Scopes নির্বাচন করুন:
   - ✅ `gist` - Gist সৃষ্টি/সম্পাদনা
   - ✅ `read:user` - ব্যবহারকারী তথ্য পড়া
5. **Generate token** ক্লিক করুন
6. Token কপি করুন (এটি শুধুমাত্র একবার দেখা যাবে!)

---

### **Step 2: Environment Variables সেট করুন**

`.env` ফাইল তৈরি করুন:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=your_github_username

# Security Configuration
MASTER_PASSWORD=your_secure_master_password_here
ENCRYPT_DATA=true

# Auto Sync Configuration
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL=300000

# Application
APP_VERSION=8.0
APP_ENV=production
```

⚠️ **Important:** `.env` ফাইল কখনও GitHub তে push করবেন না!

---

### **Step 3: HTML এ Modules যোগ করুন**

`index.html` এ স্ক্রিপ্ট যোগ করুন (ক্রমানুসারে):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SYBER VAULT v8.0</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div id="app"></div>
    <canvas id="matrixCanvas"></canvas>

    <!-- Security Modules -->
    <script src="security/crypto-engine.js"></script>
    <script src="security/audit-logger.js"></script>
    <script src="security/rate-limiter.js"></script>
    <script src="security/session-manager.js"></script>
    <script src="security/data-vault.js"></script>
    <script src="security/security-manager.js"></script>
    <script src="security/auto-data-sync.js"></script>
    <script src="security/data-persistence.js"></script>
    <script src="security/gist-manager.js"></script>
    <script src="security/render-engine.js"></script>
    <script src="security/enhanced-login.js"></script>

    <!-- Application Initialization -->
    <script>
        (async function initApp() {
            try {
                // Get GitHub token from environment or localStorage
                const githubToken = localStorage.getItem('GITHUB_TOKEN');
                const githubUsername = localStorage.getItem('GITHUB_USERNAME');
                
                if (!githubToken || !githubUsername) {
                    console.error('GitHub credentials not configured');
                    alert('Please set up GitHub credentials first');
                    return;
                }

                // 1. Initialize Data Persistence
                await DataPersistence.init();
                console.log('[APP] Data Persistence initialized');

                // 2. Initialize Rate Limiter
                RateLimiter.init();
                console.log('[APP] Rate Limiter initialized');

                // 3. Initialize Audit Logger
                AuditLogger.init();
                console.log('[APP] Audit Logger initialized');

                // 4. Initialize Auto Data Sync
                AutoDataSync.init();
                console.log('[APP] Auto Data Sync initialized');

                // 5. Initialize GitHub Gist Manager
                const gistReady = await GistManager.init(githubToken, githubUsername);
                if (!gistReady) {
                    throw new Error('Failed to initialize Gist Manager');
                }
                console.log('[APP] GitHub Gist Manager initialized');

                // 6. Load existing data from Gist
                let vaultData = await GistManager.loadFromGist();
                if (!vaultData) {
                    // Fallback to local persistence
                    vaultData = await DataPersistence.loadWithFallback();
                }
                window.VAULT_DATA = vaultData || { repos: [], files: {} };
                console.log('[APP] Vault data loaded', window.VAULT_DATA);

                // 7. Initialize Render Engine
                RenderEngine.init();
                console.log('[APP] Render Engine initialized');

                // 8. Render dashboard
                RenderEngine.renderDashboard();
                console.log('[APP] Dashboard rendered');

                AuditLogger.info('SYSTEM_START',
                    'SYBER VAULT v8.0 initialized successfully',
                    { user: githubUsername, timestamp: new Date().toISOString() }
                );
            } catch (e) {
                console.error('[INIT ERROR]', e);
                alert('Failed to initialize application: ' + e.message);
            }
        })();
    </script>
</body>
</html>
```

---

### **Step 4: GitHub Token সেট করুন**

**Option A: Developer Tools দিয়ে**

ব্রাউজার এ F12 চাপুন এবং Console এ লিখুন:

```javascript
// GitHub credentials সেট করুন
localStorage.setItem('GITHUB_TOKEN', 'ghp_your_token_here');
localStorage.setItem('GITHUB_USERNAME', 'your_username');

// Verify
console.log('Token set:', localStorage.getItem('GITHUB_TOKEN'));
console.log('Username:', localStorage.getItem('GITHUB_USERNAME'));

// Page reload
window.location.reload();
```

**Option B: Setup Dialog দিয়ে**

পেজ লোড হওয়ার সময় একটি setup dialog দেখাবে:

```html
<script>
    // On first load, check if credentials exist
    if (!localStorage.getItem('GITHUB_TOKEN')) {
        const token = prompt('Enter your GitHub Personal Access Token:');
        const username = prompt('Enter your GitHub username:');
        
        if (token && username) {
            localStorage.setItem('GITHUB_TOKEN', token);
            localStorage.setItem('GITHUB_USERNAME', username);
            window.location.reload();
        }
    }
</script>
```

---

### **Step 5: API Security নিশ্চিত করুন**

#### **CORS Issues সমাধান:**

যদি CORS error দেখেন:

```javascript
// Server side (backend) এ add করুন:
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});
```

#### **Token সুরক্ষা:**

```javascript
// Token কখনও public code এ expose করবেন না
// সর্বদা environment variables ব্যবহার করুন

// ❌ DON'T
const token = 'ghp_xxxxx';

// ✅ DO
const token = process.env.GITHUB_TOKEN;
const token = localStorage.getItem('GITHUB_TOKEN');
```

---

### **Step 6: ডেটা ফ্লো কনফিগারেশন**

#### **Local to Gist Sync:**

```javascript
// File: security/auto-data-sync.js
// প্রতি 5 সেকেন্ডে auto-save
// প্রতি 10 সেকেন্ডে Gist sync

const AUTO_SAVE_INTERVAL = 5000; // ms
const GIST_SYNC_INTERVAL = 10000; // ms
```

#### **Conflict Resolution:**

```javascript
// যদি local এবং remote data conflict হয়
// LATEST_WINS strategy ব্যবহার করা হয়

if (remoteTimestamp > localTimestamp) {
    // Use remote version
    vaultData = remoteData;
} else {
    // Use local version
    vaultData = localData;
}
```

---

### **Step 7: ডেটা রেন্ডারিং**

#### **Real-time Updates:**

```javascript
// RenderEngine প্রতি 500ms এ dashboard update করে
// যখনই ডেটা পরিবর্তন হয়:

// 1. Change tracked
AutoDataSync.trackChange('FILE_MODIFIED', 'file123', newValue, oldValue);

// 2. Auto-saved locally
// 5 সেকেন্ড পরে

// 3. Synced to Gist
// আরও 5 সেকেন্ড পরে

// 4. Dashboard re-renders
// 500ms এর মধ্যে
```

#### **Custom Rendering:**

```javascript
// Custom render function তৈরি করুন
window.renderCustomUI = function() {
    const app = document.getElementById('app');
    const data = window.VAULT_DATA;
    
    app.innerHTML = `
        <div class="custom-ui">
            <h1>My Vault</h1>
            <p>Repos: ${data.repos.length}</p>
        </div>
    `;
};

// Render Engine event listen করে
document.addEventListener('render:complete', () => {
    renderCustomUI();
});
```

---

## 📋 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                               │
│                    (Login, File Edit, Create)                          │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │   Enhanced Login / Action   │
        │   (Secure Validation)       │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼───────────────┐
        │  Rate Limiter Check         │
        │  (Brute Force Protection)   │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼───────────────┐
        │   Audit Logger              │
        │   (Log Event - Instant)     │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼───────────────┐
        │  Session Verification       │
        │  (Token Validation)         │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼───────────────┐
        │   Action Processing         │
        │   (Core Logic)              │
        └─────────────┬───────────────┘
                      │
        ┌─────────────▼───────────────┐
        │  Track Change               │
        │  (Auto Data Sync - Queue)   │
        └─────────────┬───────────────┘
                      │
                      │ (Wait 5 seconds)
                      ▼
        ┌─────────────────────────────┐
        │  Auto Save to Local Storage │
        │  - Encrypt with AES-256     │
        │  - Save to localStorage     │
        │  - Update cache             │
        └─────────────┬───────────────┘
                      │
                      │ (Wait 10 seconds)
                      ▼
        ┌─────────────────────────────┐
        │   Sync to GitHub Gist       │
        │  - Create backup Gist       │
        │  - Update main Gist         │
        │  - Handle conflicts         │
        └─────────────┬───────────────┘
                      │
                      │ (Continuous)
                      ▼
        ┌─────────────────────────────┐
        │   Render Engine Updates UI  │
        │  - Refresh Dashboard        │
        │  - Show Live Status         │
        │  - Display Audit Logs       │
        └─────────────────────────────┘
```

---

## 🔒 Security Best Practices

### **1. Token Management**
```javascript
// Never store in code
// Always use localStorage or environment variables
// Rotate tokens every 90 days
// Use read-only tokens when possible
```

### **2. Data Encryption**
```javascript
// All data encrypted with AES-256-GCM
// Keys derived using PBKDF2
// Passwords never stored, only hashed
```

### **3. Audit Logging**
```javascript
// Every action logged with timestamp
// Failed attempts tracked for brute force detection
// Logs stored locally and synced to server
```

### **4. Rate Limiting**
```javascript
// Login: 5 attempts per minute
// API: 100 requests per minute
// Auto-lockout after threshold
```

---

## 🐛 Troubleshooting

### **GitHub Token Invalid**
```javascript
// Check in console
console.log(localStorage.getItem('GITHUB_TOKEN'));

// Test with curl
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

// Should return user info
```

### **Gist Not Syncing**
```javascript
// Check GistManager status
GistManager.getStats().then(stats => console.log(stats));

// Force sync
GistManager.forceSync();

// Check audit logs
AuditLogger.getLogs({ eventType: 'GIST_SAVED' });
```

### **Data Not Loading**
```javascript
// Check persistence
DataPersistence.getStorageStats();

// Check Gist
GistManager.listBackups();

// Load from backup
GistManager.restoreFromBackup(backupGistId);
```

### **Render Issues**
```javascript
// Force re-render
RenderEngine.renderDashboard();

// Check for JS errors
console.error // in browser console

// Check VAULT_DATA
console.log(window.VAULT_DATA);
```

---

## 📊 Monitoring & Stats

### **Real-time Status**
```javascript
// Get sync status
const status = AutoDataSync.getSyncStatus();
console.log(status);

// Get security summary
const security = AuditLogger.getSecuritySummary(24);
console.log(security);

// Get Gist stats
const gistStats = await GistManager.getStats();
console.log(gistStats);
```

### **Performance Metrics**
```javascript
// Render time
console.time('render');
RenderEngine.renderDashboard();
console.timeEnd('render');

// Sync time
console.time('sync');
GistManager.forceSync();
console.timeEnd('sync');
```

---

## 🎯 Advanced Configuration

### **Custom Encryption Settings**
```javascript
CryptoEngine.algorithm = 'AES-256-GCM';
CryptoEngine.iterations = 100000;
CryptoEngine.hashAlgo = 'SHA-256';
```

### **Custom Sync Intervals**
```javascript
AutoDataSync.autoSaveInterval = 3000; // 3 seconds
AutoDataSync.syncInterval = 5000; // 5 seconds
GistManager.settings.syncInterval = 180000; // 3 minutes
```

### **Custom Rate Limiting**
```javascript
RateLimiter.rules.login = {
    maxAttempts: 3,
    timeWindow: 60000,
    lockoutDuration: 3600000
};
```

---

## 📝 API Reference

### **GistManager API**
```javascript
await GistManager.init(token, username);
await GistManager.saveToGist(data);
const data = await GistManager.loadFromGist();
const backups = await GistManager.listBackups();
await GistManager.restoreFromBackup(backupId);
const stats = await GistManager.getStats();
```

### **RenderEngine API**
```javascript
RenderEngine.init();
RenderEngine.renderDashboard();
RenderEngine.syncNow();
RenderEngine.showSettings();
```

### **AutoDataSync API**
```javascript
AutoDataSync.init();
AutoDataSync.trackChange(type, id, newVal, oldVal);
const status = AutoDataSync.getSyncStatus();
await AutoDataSync.forceSyncNow();
```

---

## ✅ Verification Checklist

- [ ] GitHub Personal Access Token generated
- [ ] Token stored securely in localStorage
- [ ] All security modules loaded in correct order
- [ ] Data Persistence initialized
- [ ] Gist Manager initialized with valid token
- [ ] Render Engine initialized
- [ ] Dashboard rendering correctly
- [ ] Auto-sync working (check console logs)
- [ ] Gist backups created
- [ ] Audit logs being recorded
- [ ] Rate limiting active
- [ ] Session management working
- [ ] Encryption working
- [ ] Real-time updates working

---

**Version:** 8.0  
**Last Updated:** 2026-05-09  
**Support:** sybervault@gmail.com
