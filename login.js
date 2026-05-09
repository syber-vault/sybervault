// ═══════════════════════════════════════
// SYBER VAULT v8.0 | LOGIN + HACKER ANIM
// ═══════════════════════════════════════

window.initLogin = function() {
  var style = document.createElement('style');
  style.textContent = `
    .login-overlay{position:fixed;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.4s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1;text-shadow:0 0 20px rgba(0,255,65,0.6)}50%{opacity:0.5;text-shadow:0 0 5px rgba(0,255,65,0.2)}}
    @keyframes shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4px)}20%,40%,60%,80%{transform:translateX(4px)}}
    
    .login-container{background:rgba(8,8,8,0.95);border:1px solid rgba(0,255,65,0.35);padding:40px 30px;width:380px;max-width:90vw;text-align:center;box-shadow:0 0 35px rgba(0,255,65,0.1),inset 0 0 50px rgba(0,255,65,0.02)}
    .login-icon{font-size:45px;color:#00ff41;margin-bottom:12px;animation:pulse 1.5s infinite}
    .login-container h2{font-size:16px;color:#00ff41;letter-spacing:5px;margin-bottom:4px;font-weight:bold}
    .login-subtitle{font-size:8px;color:#555;letter-spacing:3px;margin-bottom:24px;text-transform:uppercase}
    
    .login-input{width:100%;padding:12px;margin-bottom:10px;background:#000;border:1px solid #1a1a1a;color:#c0c0c0;font-family:'Courier New',monospace;font-size:13px;text-align:center;letter-spacing:2px;outline:none;transition:all 0.3s}
    .login-input:focus{border-color:#00ff41;box-shadow:0 0 12px rgba(0,255,65,0.12),inset 0 0 12px rgba(0,255,65,0.04);color:#fff}
    .login-input::placeholder{color:#333;letter-spacing:4px}
    
    .login-btn{width:100%;padding:12px;margin-top:6px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:8px}
    .login-btn:hover{background:#00ff41;color:#000;box-shadow:0 0 20px rgba(0,255,65,0.4)}
    .login-btn.locked{border-color:#ff1a1a;color:#ff1a1a;opacity:0.6}
    
    .login-error{color:#ff1a1a;font-size:9px;margin-top:6px;display:none;letter-spacing:1px;animation:shake 0.4s ease}
    .login-error.show{display:block}
    .login-footer{font-size:7px;color:#2a2a2a;margin-top:18px;letter-spacing:1px}
    .login-footer span{color:#3a3a3a}
  `;
  document.head.appendChild(style);

  var canvasHTML = document.getElementById('matrixCanvas') ? document.getElementById('matrixCanvas').outerHTML : '';
  
  document.getElementById('app').innerHTML = canvasHTML + `
    <div class="login-overlay" id="loginOverlay">
      <div class="login-container">
        <div class="login-icon"><i class="fas fa-skull"></i></div>
        <h2>SYBER_VAULT</h2>
        <p class="login-subtitle">// ENCRYPTED TERMINAL</p>
        
        <input class="login-input" id="loginUser" placeholder="USERNAME" autocomplete="off" maxlength="32" oninput="resetLoginError()">
        <input class="login-input" id="loginPass" type="password" placeholder="PASSWORD" maxlength="32" oninput="resetLoginError()" onkeypress="if(event.key==='Enter')doLogin()">
        
        <div class="login-error" id="loginError"><i class="fas fa-triangle-exclamation"></i> <span id="loginErrorMsg">ACCESS DENIED</span></div>
        
        <button class="login-btn" id="loginBtn" onclick="doLogin()"><i class="fas fa-unlock"></i> DECRYPT & ACCESS</button>
        
        <div class="login-footer">&copy; 2026 <span>SYBER VAULT</span> v8.0 | <span>MD ALL MAMUN</span></div>
      </div>
    </div>
    <div id="hackerAnim" style="display:none;position:fixed;inset:0;background:#000;z-index:100;font-family:'Courier New',monospace;overflow-y:auto;"></div>
  `;
  
  initMatrixBg();
};

function initMatrixBg() {
  var c = document.getElementById('matrixCanvas');
  if (!c || c.dataset.running) return;
  c.dataset.running = '1';
  var ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  var ch = '01アイウエオ', fs = 14, cols = Math.floor(c.width / fs);
  var drops = Array(cols).fill(0).map(function() { return Math.floor(Math.random() * 20); });
  (function draw() {
    if (!document.getElementById('matrixCanvas')) return;
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = 'bold ' + fs + 'px monospace';
    for (var i = 0; i < drops.length; i++) {
      ctx.fillStyle = '#0f0'; ctx.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, drops[i] * fs);
      if (drops[i] * fs > c.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  })();
}

// ═══════════════ LOGIN ═══════════════
var bruteCount = 0, bruteLocked = false, bruteTimer = null;

function resetLoginError() {
  var e = document.getElementById('loginError');
  if (e) e.classList.remove('show');
}

function doLogin() {
  if (bruteLocked) return;
  
  var username = document.getElementById('loginUser').value.trim();
  var password = document.getElementById('loginPass').value;
  var err = document.getElementById('loginError');
  var errMsg = document.getElementById('loginErrorMsg');
  
  if (!username || !password) {
    if (err) { err.classList.add('show'); if (errMsg) errMsg.textContent = 'ALL FIELDS REQUIRED'; }
    return;
  }
  
  if (username === atob('c3liZXJ2YXVsdA==') && password === atob('c3liZXJ2YXVsdEAyMDkyMDk=')) {
    bruteCount = 0;
    if (bruteTimer) clearTimeout(bruteTimer);
    
    document.getElementById('loginOverlay').style.display = 'none';
    window.currentUser = { username: 'sybervault', role: 'main_admin', email: 'sybervault@gmail.com' };
    window.authToken = 'auth_' + Date.now();
    
    showHackerAnimation();
  } else {
    bruteCount++;
    if (err) { err.classList.add('show'); if (errMsg) errMsg.textContent = 'ACCESS DENIED'; }
    document.getElementById('loginPass').value = '';
    
    if (bruteCount >= 5) {
      bruteLocked = true;
      var btn = document.getElementById('loginBtn');
      if (btn) { btn.classList.add('locked'); btn.innerHTML = '<i class="fas fa-clock"></i> LOCKED 30s'; }
      if (errMsg) errMsg.textContent = 'BRUTE FORCE! WAIT 30s';
      
      bruteTimer = setTimeout(function() {
        bruteLocked = false; bruteCount = 0;
        var btn2 = document.getElementById('loginBtn');
        if (btn2) { btn2.classList.remove('locked'); btn2.innerHTML = '<i class="fas fa-unlock"></i> DECRYPT & ACCESS'; }
        if (err) err.classList.remove('show');
      }, 30000);
    }
  }
}

// ═══════════════ HACKER ANIMATION ═══════════════
function showHackerAnimation() {
  var anim = document.getElementById('hackerAnim');
  anim.style.display = 'flex';
  anim.style.alignItems = 'center';
  anim.style.justifyContent = 'center';
  anim.style.flexDirection = 'column';
  
  var steps = [
    { cmd: '$ ssh root@sybervault.local', color: 'green' },
    { cmd: '> INITIALIZING SECURE CONNECTION...', color: 'dim' },
    { cmd: '[OK] Connected.', color: 'ok' },
    { cmd: '', color: '' },
    { cmd: '$ encrypt --stream --protocol=AES-256', color: 'green' },
    { cmd: '> ENCRYPTING DATA STREAM...', color: 'dim' },
    { cmd: '[OK] Encryption active.', color: 'ok' },
    { cmd: '', color: '' },
    { cmd: '$ bypass --firewall --layer=all', color: 'green' },
    { cmd: '> BYPASSING FIREWALL...', color: 'dim' },
    { cmd: '[OK] Firewall bypassed.', color: 'ok' },
    { cmd: '', color: '' },
    { cmd: '$ auth --user=sybervault --pass=********', color: 'green' },
    { cmd: '> VALIDATING CREDENTIALS...', color: 'dim' },
    { cmd: '[OK] Credentials validated.', color: 'ok' },
    { cmd: '', color: '' },
    { cmd: '$ grant --access=root --user=sybervault', color: 'green' },
    { cmd: '> GRANTING ROOT ACCESS...', color: 'dim' },
    { cmd: '[OK] Root access granted.', color: 'ok' }
  ];
  
  var container = document.createElement('div');
  container.style.cssText = 'background:#050505;border:1px solid #1a1a1a;padding:20px 24px;max-width:600px;width:90%;font-size:12px;line-height:2;color:#c0c0c0;margin:auto';
  anim.appendChild(container);
  
  var totalDelay = 0;
  steps.forEach(function(step, index) {
    totalDelay += 400;
    setTimeout(function() {
      var line = document.createElement('div');
      if (step.cmd === '') {
        line.innerHTML = '<br>';
      } else if (step.cmd.startsWith('$')) {
        line.innerHTML = '<span style="color:#00ff41;font-weight:bold;">$</span> <span style="color:#c0c0c0;">' + step.cmd.substring(2) + '</span>';
      } else if (step.cmd.startsWith('[OK]')) {
        line.innerHTML = '<span style="color:#00ff41;font-weight:bold;">[OK]</span> <span style="color:#888;">' + step.cmd.substring(4) + '</span>';
      } else if (step.cmd.startsWith('>')) {
        line.innerHTML = '<span style="color:#888;">' + step.cmd + '</span>';
      }
      container.appendChild(line);
      anim.scrollTop = anim.scrollHeight;
    }, totalDelay);
  });
  
  // Progress bar
  setTimeout(function() {
    var progBar = document.createElement('div');
    progBar.style.cssText = 'height:4px;background:#1a1a1a;margin-top:10px;overflow:hidden;width:100%';
    progBar.innerHTML = '<div id="hackProgress" style="height:100%;background:#00ff41;width:0;box-shadow:0 0 8px rgba(0,255,65,0.5);transition:width 0.3s"></div>';
    container.appendChild(progBar);
    
    var widths = [30, 70, 85, 100];
    widths.forEach(function(w, i) {
      setTimeout(function() {
        var p = document.getElementById('hackProgress');
        if (p) p.style.width = w + '%';
      }, i * 2000);
    });
  }, totalDelay + 200);
  
  // ACCESS GRANTED
  setTimeout(function() {
    var box = document.createElement('div');
    box.style.cssText = 'border:2px solid #00ff41;padding:20px;text-align:center;margin-top:16px;box-shadow:0 0 30px rgba(0,255,65,0.3)';
    box.innerHTML = `
      <div style="font-size:24px;color:#00ff41;letter-spacing:6px;text-shadow:0 0 20px rgba(0,255,65,0.7);margin-bottom:10px;">ACCESS GRANTED</div>
      <div style="font-size:11px;color:#888;margin-bottom:4px;"><i class="fas fa-user"></i> USER: <span style="color:#fff;">sybervault</span></div>
      <div style="font-size:11px;color:#888;margin-bottom:4px;"><i class="fas fa-key"></i> PASS: <span style="color:#555;">************</span></div>
      <div style="font-size:11px;color:#888;margin-bottom:10px;"><i class="fas fa-shield"></i> ROLE: <span style="color:#00ff41;">main_admin</span></div>
      <div style="font-size:9px;color:#444;letter-spacing:3px;">WELCOME TO SYBER_VAULT</div>
    `;
    container.appendChild(box);
    
    var cursor = document.createElement('div');
    cursor.style.cssText = 'color:#00ff41;margin-top:10px;animation:blink 0.8s infinite';
    cursor.textContent = '$ _';
    container.appendChild(cursor);
    
    // Glitch + transition
    setTimeout(function() {
      anim.style.animation = 'glitch 0.3s ease';
      setTimeout(function() {
        anim.style.opacity = '0';
        anim.style.transition = 'opacity 0.5s';
        setTimeout(function() {
          anim.style.display = 'none';
          document.getElementById('app').innerHTML = '<canvas id="matrixCanvas"></canvas>';
          initMatrixBg();
          if (typeof window.initDashboard === 'function') window.initDashboard();
        }, 500);
      }, 300);
    }, 1500);
  }, totalDelay + 8500);
}

// Add glitch animation
var animStyle = document.createElement('style');
animStyle.textContent = '@keyframes glitch{0%{text-shadow:2px 0 #ff1a1a,-2px 0 #00e5ff}25%{text-shadow:-2px 0 #ff1a1a,2px 0 #00e5ff}50%{text-shadow:2px 0 #00e5ff,-2px 0 #ff1a1a}75%{text-shadow:0 0 transparent}100%{text-shadow:2px 0 #ff1a1a,-2px 0 #00e5ff}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes pulse{0%,100%{opacity:1;text-shadow:0 0 20px rgba(0,255,65,0.7)}50%{opacity:0.5;text-shadow:0 0 5px rgba(0,255,65,0.2)}}';
document.head.appendChild(animStyle);
