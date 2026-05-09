// ═══════════════════════════════════════
// SYBER VAULT v8.0 | DASHBOARD FINAL
// ═══════════════════════════════════════

;(function(root) {
  'use strict';

  var CONFIG = { lowDevice: root.innerWidth < 768, sidebarOpen: root.innerWidth >= 768 };
  var STATE = { currentTab: 'vault', clockInterval: null };
  var DOM = {};

  root.initDashboard = function() {
    injectStyles();
    render();
    cacheDOM();
    bindEvents();
    startClock();
    initMatrix();
    switchTab('vault');
  };

  function injectStyles() {
    var css = `
      :root{--bg:#000;--surface:#080808;--border:#1a1a1a;--neon:#00ff41;--danger:#ff1a1a;--cyan:#00e5ff;--text:#c0c0c0;--text-dim:#555;--font:'Courier New',monospace}
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;overflow-x:hidden;min-height:100vh;line-height:1.6}
      input,textarea,[contenteditable]{font-size:14px;padding:12px}
      #matrixCanvas{position:fixed;top:0;left:0;z-index:0;opacity:0.35;pointer-events:none}
      .dashboard{position:relative;z-index:1;display:flex;flex-direction:column;min-height:100vh}
      .statusbar{background:var(--surface);border-bottom:1px solid var(--border);padding:10px 20px;font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:12px}
      .status-dot{width:8px;height:8px;background:var(--neon);border-radius:50%;animation:pulse 1.5s infinite;box-shadow:0 0 6px rgba(0,255,65,0.5)}
      #clock{color:var(--neon);font-weight:bold;letter-spacing:2px;font-size:12px}
      .status-right{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:10px}
      .header{padding:14px 20px;display:flex;align-items:center;gap:12px;background:var(--surface);border-bottom:1px solid var(--border)}
      .menu-btn{width:38px;height:38px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:18px;display:grid;place-items:center;transition:all 0.2s}
      .menu-btn:hover{border-color:var(--neon);color:var(--neon)}
      .header-brand{display:flex;align-items:center;gap:10px;cursor:pointer;margin-right:12px}
      .header-brand .logo{width:40px;height:40px;display:grid;place-items:center;background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);color:var(--neon);font-size:18px}
      .header-brand .brand-name{font-size:16px;color:var(--neon);letter-spacing:4px;font-weight:bold}
      .header-brand .brand-sub{font-size:8px;color:var(--text-dim);letter-spacing:2px}
      .header-right{display:flex;align-items:center;gap:10px;margin-left:auto}
      .role-badge{padding:6px 14px;border:1px solid var(--neon);color:var(--neon);font-size:9px;letter-spacing:2px;font-weight:bold}
      .user-badge{display:flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(0,255,65,0.02);border:1px solid rgba(0,255,65,0.12);cursor:pointer;transition:all 0.2s}
      .user-badge:hover{border-color:var(--neon)}
      .user-badge .user-icon{font-size:16px;color:var(--neon)}
      .user-badge .user-name{font-size:11px;color:#fff;font-weight:bold}
      .hbtn{width:38px;height:38px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:15px;display:grid;place-items:center;transition:all 0.2s}
      .hbtn:hover{border-color:var(--neon);color:var(--neon)}
      .workspace{display:flex;flex:1;min-height:0}
      .sidebar{width:65px;background:#0a0a0a;border-right:1px solid var(--border);flex-shrink:0;display:flex;flex-direction:column;transition:all 0.3s}
      .sidebar.hidden{width:0;overflow:hidden;border:none}
      .sitem{padding:16px 8px;text-align:center;cursor:pointer;font-size:8px;color:#555;border-left:3px solid transparent;transition:all 0.2s;letter-spacing:1px;font-weight:bold;white-space:nowrap}
      .sitem i{font-size:16px;display:block;margin-bottom:5px}
      .sitem:hover,.sitem.active{color:var(--neon);background:rgba(0,255,65,0.03);border-left-color:var(--neon)}
      .sitem.lock:hover{color:var(--danger);border-left-color:var(--danger)}
      .mainpanel{flex:1;padding:20px;overflow-y:auto;max-height:calc(100vh - 110px);font-size:13px}
      .footer{padding:12px 20px;font-size:9px;color:#555;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#050505;flex-wrap:wrap;gap:8px}
      .footer .f-left{display:flex;align-items:center;gap:14px}
      .footer .f-brand{color:#00ff41;font-weight:bold}
      .footer .f-author{color:#00e5ff;font-weight:bold}
      .footer .f-clock{color:#888;font-size:9px}
      .footer .f-social{display:flex;gap:10px}
      .footer .f-social a{color:#666;font-size:12px;text-decoration:none;transition:all 0.2s}
      .footer .f-social a:hover{color:#00ff41}
      .footer .f-about{cursor:pointer;color:#888;font-size:9px;display:flex;align-items:center;gap:4px;transition:all 0.2s}
      .footer .f-about:hover{color:#00ff41}
      .fab{position:fixed;bottom:24px;right:24px;width:52px;height:52px;background:var(--neon);border:none;color:#000;font-size:22px;cursor:pointer;z-index:99;box-shadow:0 0 25px rgba(0,255,65,0.5);display:grid;place-items:center;transition:all 0.3s}
      .fab:hover{transform:scale(1.1)}
      .about-popup{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:none;align-items:center;justify-content:center}
      .about-popup.show{display:flex}
      .about-box{background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);width:420px;max-width:90vw;padding:28px 24px;text-align:center;box-shadow:0 0 40px rgba(0,255,65,0.1)}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      @media(max-width:768px){
        .statusbar{padding:8px 12px;font-size:10px}
        .header{padding:10px 12px}
        .header-brand .brand-name{font-size:14px}
        .sidebar{width:55px}.sidebar.hidden{width:0}
        .sitem{padding:14px 4px;font-size:7px}.sitem i{font-size:14px}
        .mainpanel{padding:12px;font-size:14px}
        .footer{font-size:8px}
      }
    `;
    document.head.appendChild(document.createElement('style')).textContent = css;
  }

  function render() {
    var user = root.currentUser || { username:'sybervault', role:'main_admin' };
    var roleLabel = user.role === 'main_admin' ? 'ADMIN' : (user.role === 'admin' ? 'ADMIN' : 'USER');
    var canvasHTML = document.getElementById('matrixCanvas') ? document.getElementById('matrixCanvas').outerHTML : '';
    document.getElementById('app').innerHTML = canvasHTML + `
      <div class="dashboard">
        <div class="statusbar"><span class="status-dot"></span> SYSTEM ACTIVE | <span id="clock">--:--:--</span><span class="status-right"><i class="fas fa-lock" style="color:var(--neon);"></i> SECURED</span></div>
        <div class="header">
          <button class="menu-btn" onclick="toggleSidebar()" title="Menu"><i class="fas fa-bars"></i></button>
          <div class="header-brand" onclick="switchTab('vault')">
            <div class="logo"><i class="fas fa-skull"></i></div>
            <div><div class="brand-name">SYBER_VAULT</div><div class="brand-sub">// ENCRYPTED TERMINAL</div></div>
          </div>
          <span class="role-badge">${roleLabel}</span>
          <div class="header-right">
            <div class="user-badge" onclick="showAboutPopup()">
              <i class="fas fa-user-circle user-icon"></i>
              <span class="user-name">${user.username}</span>
            </div>
            <button class="hbtn" id="btnLock" style="border-color:rgba(255,26,26,0.3);color:var(--danger);"><i class="fas fa-power-off"></i></button>
          </div>
        </div>
        <div class="workspace">
          <div class="sidebar${CONFIG.sidebarOpen?'':' hidden'}" id="sidebar">
            <div class="sitem" data-tab="vault" onclick="switchTab('vault')"><i class="fas fa-folder"></i>VAULT</div>
            <div class="sitem" data-tab="tools" onclick="switchTab('tools')"><i class="fas fa-tools"></i>TOOLS</div>
            <div class="sitem" data-tab="deploy" onclick="switchTab('deploy')"><i class="fas fa-rocket"></i>DEPLOY</div>
            <div class="sitem" data-tab="terminal" onclick="switchTab('terminal')"><i class="fas fa-terminal"></i>TERMINAL</div>
            <div class="sitem" data-tab="admin" onclick="switchTab('admin')"><i class="fas fa-shield"></i>ADMIN</div>
            <div class="sitem lock" onclick="lockVault()"><i class="fas fa-lock"></i>LOCK</div>
          </div>
          <div class="mainpanel" id="mainpanel"></div>
        </div>
        <div class="footer">
          <div class="f-left">
            <span>&copy; 2026 <span class="f-brand">SYBER VAULT</span></span>
            <span class="f-author">MD ALL MAMUN</span>
          </div>
          <div class="f-social">
            <a href="https://t.me/allmamun209209" target="_blank"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://github.com/syber-vault" target="_blank"><i class="fab fa-github"></i></a>
          </div>
          <span class="f-about" onclick="showAboutPopup()"><i class="fas fa-info-circle"></i> About</span>
          <span class="f-clock" id="footerClock">--:--</span>
        </div>
      </div>
      <button class="fab" onclick="if(typeof openCreateModal==='function')openCreateModal()">+</button>
      <div class="about-popup" id="aboutPopup" onclick="this.classList.remove('show')">
        <div class="about-box" onclick="event.stopPropagation()">
          <i class="fas fa-skull" style="font-size:44px;color:#00ff41;margin-bottom:10px;display:block;"></i>
          <div style="color:#00ff41;font-size:16px;letter-spacing:5px;font-weight:bold;">SYBER VAULT</div>
          <div style="color:#555;font-size:9px;letter-spacing:3px;margin-bottom:14px;">v8.0 // SECURE TERMINAL</div>
          <div style="border-top:1px solid #1a1a1a;padding-top:14px;font-size:10px;color:#c0c0c0;line-height:2.2;">
            <i class="fas fa-user" style="color:#00ff41;width:20px;"></i> <span style="color:#00e5ff;font-weight:bold;">MD ALL MAMUN</span><br>
            <i class="fas fa-at" style="color:#00ff41;width:20px;"></i> @allmamun209209<br>
            <i class="fab fa-github" style="color:#00ff41;width:20px;"></i> github.com/syber-vault<br>
            <i class="fas fa-calendar" style="color:#00ff41;width:20px;"></i> Released: May 2026<br>
            <i class="fas fa-laptop-code" style="color:#00ff41;width:20px;"></i> Web Development | Cyber Security | AI Developing | Computer Engineering
          </div>
          <button onclick="document.getElementById('aboutPopup').classList.remove('show')" style="margin-top:16px;padding:8px 24px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-family:monospace;font-size:10px;">CLOSE</button>
        </div>
      </div>
    `;
  }

  function cacheDOM() {
    DOM = {
      sidebar: document.getElementById('sidebar'),
      mainpanel: document.getElementById('mainpanel'),
      clock: document.getElementById('clock'),
      footerClock: document.getElementById('footerClock'),
      btnLock: document.getElementById('btnLock'),
      sitems: document.querySelectorAll('.sitem')
    };
  }

  function bindEvents() {
    if (DOM.btnLock) DOM.btnLock.addEventListener('click', lockVault);
  }

  function startClock() {
    if (STATE.clockInterval) clearInterval(STATE.clockInterval);
    var tick = function() {
      var now = new Date();
      if (DOM.clock) DOM.clock.textContent = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      if (DOM.footerClock) DOM.footerClock.textContent = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
    };
    tick();
    STATE.clockInterval = setInterval(tick, 1000);
  }

  root.toggleSidebar = function() {
    if (DOM.sidebar) {
      CONFIG.sidebarOpen = !CONFIG.sidebarOpen;
      DOM.sidebar.classList.toggle('hidden', !CONFIG.sidebarOpen);
    }
  };

  root.switchTab = function(tab) {
    STATE.currentTab = tab;
    if (DOM.sitems) DOM.sitems.forEach(function(el) { el.classList.toggle('active', el.dataset.tab === tab); });
    if (!DOM.mainpanel) return;
    if (tab === 'admin') {
      if (typeof window.openAdminPanel === 'function') window.openAdminPanel();
      DOM.mainpanel.innerHTML = '';
      return;
    }
    if (tab === 'vault' && typeof window.renderVault === 'function') window.renderVault(DOM.mainpanel);
    else if (tab === 'tools' && typeof window.renderTools === 'function') window.renderTools(DOM.mainpanel);
    else if (tab === 'deploy' && typeof window.renderDeploy === 'function') window.renderDeploy(DOM.mainpanel);
    else DOM.mainpanel.innerHTML = '<div style="text-align:center;padding:60px;color:#555;"><i class="fas fa-cogs" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.2;"></i>Coming Soon</div>';
  };

  function initMatrix() {
    var canvas = document.getElementById('matrixCanvas');
    if (!canvas || canvas.dataset.running) return;
    canvas.dataset.running = '1';
    var ctx = canvas.getContext('2d');
    canvas.width = innerWidth; canvas.height = innerHeight;
    var chars = '01アイウエオカキクケコ', fs = CONFIG.lowDevice ? 12 : 14;
    var cols = Math.floor(canvas.width / fs);
    var drops = Array(cols).fill(0).map(function() { return Math.floor(Math.random() * 20); });
    (function draw() {
      if (!document.getElementById('matrixCanvas')) return;
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font = 'bold '+fs+'px monospace';
      for (var i = 0; i < drops.length; i++) { ctx.fillStyle = '#0f0'; ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*fs, drops[i]*fs); if (drops[i]*fs > canvas.height && Math.random() > 0.97) drops[i] = 0; drops[i]++; }
      requestAnimationFrame(draw);
    })();
  }

  function lockVault() {
    document.getElementById('app').innerHTML = '';
    if (STATE.clockInterval) clearInterval(STATE.clockInterval);
    root.currentUser = null; root.authToken = null;
    if (typeof root.initLogin === 'function') root.initLogin();
  }
  root.lockVault = lockVault;
  root.showAboutPopup = function() { document.getElementById('aboutPopup').classList.add('show'); };

})(window);
