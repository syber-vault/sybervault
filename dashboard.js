// ═══════════════════════════════════════
// SYBER VAULT v8.0 | DASHBOARD CORE
// ═══════════════════════════════════════

;(function(root) {
  'use strict';

  const CONFIG = {
    lowDevice: root.innerWidth < 768 || (root.navigator.hardwareConcurrency || 4) < 4,
    sidebarCollapsed: root.innerWidth < 768
  };

  const STATE = {
    currentTab: 'vault',
    clockInterval: null
  };

  let DOM = {};

  // ═══════════ INIT ═══════════
  root.initDashboard = function() {
    injectStyles();
    render();
    cacheDOM();
    bindEvents();
    startClock();
    initMatrix();
    switchTab('vault');
  };

  // ═══════════ STYLES ═══════════
  function injectStyles() {
    const css = `
      :root {
        --bg: #000; --surface: #080808; --border: #1a1a1a;
        --neon: #00ff41; --danger: #ff1a1a; --cyan: #00e5ff;
        --text: #c0c0c0; --text-dim: #555; --text-bright: #fff;
        --glow: 0 0 10px rgba(0,255,65,0.3);
        --font: 'Courier New', monospace;
      }
      
      * { margin:0; padding:0; box-sizing:border-box }
      body { 
        background:var(--bg); color:var(--text); font-family:var(--font);
        font-size:${CONFIG.lowDevice?'15':'14'}px; overflow-x:hidden; 
        min-height:100vh; -webkit-user-select:none; user-select:none;
        line-height:1.6;
      }
      input, textarea, [contenteditable] { 
        -webkit-user-select:text; user-select:text; 
        font-size:${CONFIG.lowDevice?'16':'14'}px;
        padding:12px;
      }
      
      #matrixCanvas { position:fixed; top:0; left:0; z-index:0; opacity:${CONFIG.lowDevice?'0.12':'0.35'}; pointer-events:none }
      
      .dashboard { position:relative; z-index:1; display:flex; flex-direction:column; min-height:100vh }
      
      .statusbar { 
        background:var(--surface); border-bottom:1px solid var(--border);
        padding:10px 24px; font-size:11px; color:var(--text-dim);
        display:flex; align-items:center; gap:14px;
      }
      .status-dot { 
        width:8px; height:8px; background:var(--neon); border-radius:50%;
        animation:pulse 1.5s infinite; box-shadow:0 0 6px rgba(0,255,65,0.5);
      }
      #clock { color:var(--neon); font-weight:bold; letter-spacing:2px; font-size:12px }
      .status-right { margin-left:auto; display:flex; align-items:center; gap:8px; font-size:10px }
      
      .header {
        padding:16px 24px; border-bottom:1px solid var(--border);
        display:flex; align-items:center; gap:14px; background:var(--surface);
      }
      .header-brand { 
        display:flex; align-items:center; gap:12px; cursor:pointer;
        text-decoration:none;
      }
      .header-brand .logo {
        width:42px; height:42px; display:grid; place-items:center;
        background:rgba(0,255,65,0.05); border:1px solid rgba(0,255,65,0.2);
        color:var(--neon); font-size:20px;
      }
      .header-brand .brand-text {
        display:flex; flex-direction:column;
      }
      .header-brand .brand-name {
        font-size:18px; color:var(--neon); letter-spacing:5px; font-weight:bold;
        text-shadow:0 0 10px rgba(0,255,65,0.3);
      }
      .header-brand .brand-sub {
        font-size:9px; color:var(--text-dim); letter-spacing:2px;
      }
      .header-user { 
        margin-left:auto; font-size:12px; color:#888; 
        display:flex; align-items:center; gap:8px;
      }
      .header-user .role { 
        font-size:10px; color:var(--neon); border:1px solid rgba(0,255,65,0.3); 
        padding:3px 10px; letter-spacing:1px;
      }
      .hbtn {
        width:40px; height:40px; background:transparent; border:1px solid #333;
        color:#888; cursor:pointer; font-size:16px; display:grid; place-items:center;
        transition:all 0.2s; text-decoration:none;
      }
      .hbtn:hover { border-color:var(--neon); color:var(--neon); box-shadow:var(--glow) }
      
      .workspace { display:flex; flex:1; min-height:0 }
      
      .sidebar {
        width:${CONFIG.sidebarCollapsed?'0':'70'}px;
        background:#0a0a0a; border-right:1px solid var(--border);
        transition:width 0.3s; overflow:hidden; flex-shrink:0;
        display:flex; flex-direction:column;
      }
      .sidebar.open { width:70px }
      .sitem {
        padding:18px 10px; text-align:center; cursor:pointer; font-size:9px;
        color:#555; border-left:3px solid transparent; transition:all 0.2s;
        letter-spacing:1px; font-weight:bold;
      }
      .sitem i { font-size:18px; display:block; margin-bottom:6px }
      .sitem:hover, .sitem.active { color:var(--neon); background:rgba(0,255,65,0.03); border-left-color:var(--neon) }
      .sitem.lock:hover { color:var(--danger); border-left-color:var(--danger) }
      
      .mainpanel { 
        flex:1; padding:20px; overflow-y:auto; 
        max-height:calc(100vh - 120px); 
        font-size:${CONFIG.lowDevice?'15':'13'}px;
      }
      
      .footer {
        padding:14px 24px; font-size:10px; color:#888; 
        border-top:1px solid var(--border);
        display:flex; justify-content:space-between; align-items:center;
        letter-spacing:1px; background:#050505;
      }
      .footer .f-brand { color:#00ff41; font-weight:bold; letter-spacing:2px; }
      .footer .f-author { color:#00e5ff; font-weight:bold; }
      .footer .f-clock { color:#aaa; font-size:10px; }
      
      .fab {
        position:fixed; bottom:26px; right:26px; width:54px; height:54px;
        background:var(--neon); border:none; color:#000; font-size:24px;
        cursor:pointer; z-index:99; box-shadow:0 0 30px rgba(0,255,65,0.5);
        display:grid; place-items:center; transition:all 0.3s;
      }
      .fab:hover { transform:scale(1.1) rotate(90deg); box-shadow:0 0 45px rgba(0,255,65,0.7) }
      .fab:active { transform:scale(0.95) }
      
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      
      @media(max-width:768px) {
        .statusbar { padding:8px 14px; font-size:10px; gap:10px }
        .header { padding:12px 14px; gap:10px }
        .header-brand .brand-name { font-size:15px; letter-spacing:3px }
        .header-brand .logo { width:36px; height:36px; font-size:17px }
        .header-user { font-size:11px }
        .mainpanel { padding:14px; max-height:calc(100vh - 110px); font-size:14px }
        .hbtn { width:38px; height:38px; font-size:15px }
        .fab { width:48px; height:48px; bottom:18px; right:18px; font-size:22px }
        .sitem { padding:16px 8px; font-size:8px }
        .sitem i { font-size:16px }
        .footer { padding:12px 14px; font-size:9px; }
      }
    `;
    document.head.appendChild(document.createElement('style')).textContent = css;
  }

  // ═══════════ RENDER ═══════════
  function render() {
    const user = root.currentUser || { username:'sybervault', role:'main_admin' };
    const canvasHTML = document.getElementById('matrixCanvas')?.outerHTML || '';
    
    document.getElementById('app').innerHTML = canvasHTML + `
      <div class="dashboard">
        <div class="statusbar">
          <span class="status-dot"></span> SYSTEM ACTIVE | <span id="clock">--:--:--</span>
          <span class="status-right"><i class="fas fa-lock" style="color:var(--neon);"></i> SECURED</span>
        </div>
        
        <div class="header">
          <div class="header-brand">
            <div class="logo"><i class="fas fa-skull"></i></div>
            <div class="brand-text">
              <span class="brand-name">SYBER_VAULT</span>
              <span class="brand-sub">// ENCRYPTED TERMINAL</span>
            </div>
          </div>
          <div class="header-user">
            <span>${user.username}</span> <span class="role">${user.role}</span>
          </div>
          <a class="hbtn" href="#"><i class="fas fa-terminal"></i></a>
          <button class="hbtn" id="btnAdmin"><i class="fas fa-shield"></i></button>
          <button class="hbtn" id="btnLock" style="border-color:rgba(255,26,26,0.3);color:var(--danger);"><i class="fas fa-power-off"></i></button>
        </div>
        
        <div class="workspace">
          <div class="sidebar${CONFIG.sidebarCollapsed?'':' open'}" id="sidebar">
            <div class="sitem" data-tab="vault" onclick="switchTab('vault')"><i class="fas fa-folder"></i>VAULT</div>
            <div class="sitem" data-tab="tools" onclick="switchTab('tools')"><i class="fas fa-tools"></i>TOOLS</div>
            <div class="sitem" data-tab="deploy" onclick="switchTab('deploy')"><i class="fas fa-rocket"></i>DEPLOY</div>
            <div class="sitem" data-tab="admin" onclick="switchTab('admin')"><i class="fas fa-shield"></i>ADMIN</div>
            <div class="sitem lock" onclick="lockVault()"><i class="fas fa-lock"></i>LOCK</div>
          </div>
          <div class="mainpanel" id="mainpanel"></div>
        </div>
        
        <div class="footer">
          <span>&copy; 2026 <span class="f-brand">SYBER VAULT</span> v8.0 | <span class="f-author">MD ALL MAMUN</span></span>
          <span class="f-clock" id="footerClock">--:--</span>
        </div>
      </div>
      
      <button class="fab" id="fab" onclick="if(typeof openCreateModal==='function')openCreateModal()">+</button>
    `;
  }

  // ═══════════ CACHE DOM ═══════════
  function cacheDOM() {
    DOM = {
      sidebar: document.getElementById('sidebar'),
      mainpanel: document.getElementById('mainpanel'),
      clock: document.getElementById('clock'),
      footerClock: document.getElementById('footerClock'),
      fab: document.getElementById('fab'),
      btnAdmin: document.getElementById('btnAdmin'),
      btnLock: document.getElementById('btnLock'),
      sitems: document.querySelectorAll('.sitem')
    };
  }

  // ═══════════ EVENTS ═══════════
  function bindEvents() {
    if (DOM.btnLock) DOM.btnLock.addEventListener('click', lockVault);
    if (DOM.btnAdmin) DOM.btnAdmin.addEventListener('click', () => {
      if (typeof root.openAdminPanel === 'function') root.openAdminPanel();
    });
    
    document.addEventListener('keydown', handleKeyboard);
    
    if (CONFIG.lowDevice) {
      let touchStart = 0;
      document.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; });
      document.addEventListener('touchend', e => {
        if (e.changedTouches[0].clientX - touchStart > 80) toggleSidebar(true);
        if (touchStart - e.changedTouches[0].clientX > 80) toggleSidebar(false);
      });
    }
  }

  function handleKeyboard(e) {
    if (e.ctrlKey) {
      switch(e.key.toLowerCase()) {
        case 'n': e.preventDefault(); if(typeof openCreateModal==='function') openCreateModal(); break;
        case 'l': e.preventDefault(); lockVault(); break;
        case 'b': e.preventDefault(); toggleSidebar(); break;
      }
    }
  }

  // ═══════════ CLOCK ═══════════
  function startClock() {
    if (STATE.clockInterval) clearInterval(STATE.clockInterval);
    const tick = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      const short = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
      if (DOM.clock) DOM.clock.textContent = time;
      if (DOM.footerClock) DOM.footerClock.textContent = short;
    };
    tick();
    STATE.clockInterval = setInterval(tick, 1000);
  }

  // ═══════════ SIDEBAR ═══════════
  root.toggleSidebar = function(force) {
    if (DOM.sidebar) {
      const isOpen = force !== undefined ? force : !DOM.sidebar.classList.contains('open');
      DOM.sidebar.classList.toggle('open', isOpen);
    }
  };
  
  function toggleSidebar(force) {
    if (DOM.sidebar) {
      const isOpen = force !== undefined ? force : !DOM.sidebar.classList.contains('open');
      DOM.sidebar.classList.toggle('open', isOpen);
    }
  }

  // ═══════════ TAB SWITCHING ═══════════
  root.switchTab = function(tab) {
    STATE.currentTab = tab;
    
    DOM.sitems?.forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    
    if (!DOM.mainpanel) return;
    
    const handlers = {
      vault: () => { if (typeof root.renderVault === 'function') root.renderVault(DOM.mainpanel); },
      tools: () => { if (typeof root.renderTools === 'function') root.renderTools(DOM.mainpanel); },
      deploy: () => { if (typeof root.renderDeploy === 'function') root.renderDeploy(DOM.mainpanel); },
      admin: () => { if (typeof root.renderAdmin === 'function') root.renderAdmin(DOM.mainpanel); }
    };
    
    if (handlers[tab]) handlers[tab]();
    else DOM.mainpanel.innerHTML = '';
  };

  // ═══════════ MATRIX ═══════════
  function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas || canvas.dataset.running) return;
    canvas.dataset.running = '1';
    
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth; canvas.height = innerHeight;
    
    const chars = '01アイウエオカキクケコ';
    const fontSize = CONFIG.lowDevice ? 12 : 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * 20));
    
    const draw = () => {
      if (!document.getElementById('matrixCanvas')) return;
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.font = 'bold '+fontSize+'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        ctx.fillStyle = '#0f0';
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*fontSize, drops[i]*fontSize);
        if (drops[i]*fontSize > canvas.height && Math.random() > 0.97) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    };
    draw();
    
    root.addEventListener('resize', () => {
      canvas.width = innerWidth; canvas.height = innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * 20));
    });
  }

  // ═══════════ LOCK ═══════════
  function lockVault() {
    document.getElementById('app').innerHTML = '';
    if (STATE.clockInterval) clearInterval(STATE.clockInterval);
    root.currentUser = null;
    root.authToken = null;
    if (typeof root.initLogin === 'function') root.initLogin();
  }

  root.lockVault = lockVault;

})(window);
