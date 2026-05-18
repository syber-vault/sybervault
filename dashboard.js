// ═══════════════════════════════════════
// SYBER VAULT v8.0 | DASHBOARD FINAL
// ═══════════════════════════════════════

;(function(root) {
  'use strict';

  var CONFIG = { lowDevice: root.innerWidth < 768 };
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
      
      .statusbar{background:var(--surface);border-bottom:1px solid var(--border);padding:10px 20px;font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:14px}
      .status-dot{width:8px;height:8px;background:var(--neon);border-radius:50%;animation:pulse 1.5s infinite;box-shadow:0 0 6px rgba(0,255,65,0.5)}
      #clock{color:var(--neon);font-weight:bold;letter-spacing:2px;font-size:12px}
      .status-right{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:10px}
      
      .header{padding:14px 20px;display:flex;align-items:center;gap:12px;background:var(--surface);border-bottom:1px solid var(--border)}
      .header-brand{display:flex;align-items:center;gap:12px;cursor:pointer;text-decoration:none;flex-shrink:0}
      .header-brand .logo{width:40px;height:40px;display:grid;place-items:center;background:rgba(0,255,65,0.05);border:1px solid rgba(0,255,65,0.2);color:var(--neon);font-size:18px}
      .header-brand .brand-text{display:flex;flex-direction:column}
      .header-brand .brand-name{font-size:16px;color:var(--neon);letter-spacing:4px;font-weight:bold;animation:glitch 3s infinite}
      @keyframes glitch{0%,100%{text-shadow:1px 0 #00ff41}25%{text-shadow:-2px 0 #00e5ff,2px 0 #ff1a1a}50%{text-shadow:2px 0 #00ff41}75%{text-shadow:-1px 0 #0f0,1px 0 #0ff}}
      .header-brand .brand-sub{font-size:8px;color:var(--text-dim);letter-spacing:2px}
      .header-right{margin-left:auto;display:flex;align-items:center;gap:10px;flex-shrink:0}
      .role-badge{padding:5px 10px;border:1px solid var(--neon);color:var(--neon);font-size:8px;letter-spacing:1px;font-weight:bold;display:flex;align-items:center;gap:5px}
      .role-badge i{font-size:12px;color:#ffd600}
      .info-btn{display:flex;align-items:center;gap:5px;padding:5px 8px;background:transparent;border:1px solid rgba(0,255,65,0.15);color:#888;cursor:pointer;font-size:8px;font-family:monospace;letter-spacing:1px;transition:all 0.2s}
      .info-btn:hover{border-color:#00ff41;color:#00ff41}
      .info-btn i{font-size:13px;color:#00ff41}
      .hbtn{width:38px;height:38px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:15px;display:grid;place-items:center;transition:all 0.2s;text-decoration:none;flex-shrink:0}
      .hbtn:hover{border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,65,0.3)}
      
      .workspace{display:flex;flex:1;min-height:0;position:relative}
      
      /* Menubar - easy slide */
      .menubar{position:fixed;left:0;top:50%;transform:translate(-100%,-50%);width:70px;display:flex;flex-direction:column;gap:2px;z-index:100;transition:all 0.3s ease;padding:8px 4px;background:rgba(10,10,10,0.95);border:1px solid #1a1a1a;border-left:none;border-radius:0 6px 6px 0;box-shadow:3px 0 15px rgba(0,0,0,0.5)}
      .menubar.open{transform:translate(0,-50%)}
      .menubar-logo{padding:8px 4px 12px;text-align:center;border-bottom:1px solid #1a1a1a;margin-bottom:6px}
      .menubar-logo i{font-size:22px;color:var(--neon);margin-bottom:4px;display:block}
      .menubar-logo .mname{font-size:8px;color:var(--neon);letter-spacing:2px;font-weight:bold}
      .m-item{padding:10px 6px;text-align:center;cursor:pointer;font-size:7px;color:#666;transition:all 0.2s;letter-spacing:1px}
      .m-item i{font-size:15px;display:block;margin-bottom:3px}
      .m-item:hover,.m-item.active{color:#00ff41;background:rgba(0,255,65,0.05);border-radius:4px}
      .m-item.exit:hover{color:var(--danger)}
      
      /* Touch handle for menubar */
      .menubar-handle{position:fixed;left:0;top:0;width:12px;height:100vh;z-index:99;cursor:pointer}
      
      .mainpanel{flex:1;padding:16px;overflow-y:auto;max-height:calc(100vh - 110px);font-size:13px}
      
      /* Toast */
      .toast-container{position:fixed;top:16px;right:16px;z-index:300;display:flex;flex-direction:column;gap:8px}
      .toast{background:#0a0a0a;border:1px solid #00ff41;border-left:3px solid #00ff41;padding:12px 16px;min-width:280px;max-width:380px;box-shadow:0 0 20px rgba(0,255,65,0.2);transform:translateX(120%);transition:transform 0.4s ease;display:flex;align-items:center;gap:10px;font-size:11px;color:#c0c0c0}
      .toast.show{transform:translateX(0)}
      .toast i{font-size:18px;color:#00ff41;flex-shrink:0}
      .toast .toast-msg{flex:1}
      .toast.creator{border-color:#ffd600;border-left-color:#ffd600}.toast.creator i{color:#ffd600}
      .toast.features{border-color:#00e5ff;border-left-color:#00e5ff}.toast.features i{color:#00e5ff}
      
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
      
      .popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;display:none;align-items:center;justify-content:center}
      .popup-overlay.show{display:flex}
      .popup-box{background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);padding:24px;max-width:380px;width:90%;text-align:center;box-shadow:0 0 40px rgba(0,255,65,0.1)}
      .popup-box h3{color:#00ff41;font-size:13px;letter-spacing:2px;margin-bottom:8px;font-weight:bold}
      .popup-box p{color:#888;font-size:10px;margin-bottom:16px;line-height:1.6}
      .popup-btns{display:flex;gap:8px;justify-content:center}
      .popup-btn{padding:7px 18px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;font-family:monospace;letter-spacing:1px;transition:all 0.2s}
      .popup-btn:hover{border-color:#00ff41;color:#00ff41}
      .popup-btn.danger{border-color:var(--danger);color:var(--danger)}
      .popup-btn.danger:hover{background:var(--danger);color:#fff}
      
      .about-popup{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:none;align-items:center;justify-content:center}
      .about-popup.show{display:flex}
      .about-box{background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);width:400px;max-width:90vw;padding:24px;text-align:center;box-shadow:0 0 40px rgba(0,255,65,0.1)}
      
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      
      @media(max-width:768px){
        .statusbar{padding:8px 12px;font-size:10px}
        .header{padding:10px 12px}
        .header-brand .brand-name{font-size:14px}.header-brand .logo{width:34px;height:34px;font-size:16px}
        .mainpanel{padding:10px;font-size:14px;max-height:calc(100vh - 90px)}
        .footer{font-size:8px;padding:10px 12px}
        .menubar{width:60px}
        .toast{min-width:200px;max-width:300px;font-size:10px}
        .fab{width:48px;height:48px;bottom:16px;right:16px}
      }
    `;
    document.head.appendChild(document.createElement('style')).textContent = css;
  }

  function render() {
    var user = root.currentUser || { username:'sybervault', role:'main_admin' };
    var roleLabel = user.role === 'main_admin' ? 'ADMIN' : (user.role === 'admin' ? 'ADMIN' : 'USER');
    var roleIcon = user.role === 'main_admin' ? 'fa-crown' : (user.role === 'admin' ? 'fa-star' : 'fa-user');
    var canvasHTML = document.getElementById('matrixCanvas') ? document.getElementById('matrixCanvas').outerHTML : '';
    
    document.getElementById('app').innerHTML = canvasHTML + `
      <div class="dashboard">
        <div class="statusbar"><span class="status-dot"></span> SYSTEM ACTIVE | <span id="clock">--:--:--</span><span class="status-right"><i class="fas fa-lock" style="color:var(--neon);"></i> SECURED</span></div>
        
        <div class="header">
          <div class="header-brand">
            <div class="logo"><i class="fas fa-skull"></i></div>
            <div class="brand-text"><span class="brand-name">SYBER_VAULT</span><span class="brand-sub">// ENCRYPTED TERMINAL</span></div>
          </div>
          <div class="header-right">
            <span class="role-badge"><i class="fas ${roleIcon}"></i> ${roleLabel}</span>
            <button class="info-btn" onclick="showAboutPopup()"><i class="fas fa-info-circle"></i> ${user.username}</button>
            <button class="hbtn" style="border-color:rgba(255,26,26,0.3);color:var(--danger);" onclick="showExitConfirm()"><i class="fas fa-power-off"></i></button>
          </div>
        </div>
        
        <!-- Menubar Touch Handle -->
        <div class="menubar-handle" id="menubarHandle"></div>
        
        <!-- Toast -->
        <div class="toast-container" id="toastContainer"></div>
        
        <!-- Menubar -->
        <div class="menubar" id="menubar">
          <div class="menubar-logo"><i class="fas fa-skull"></i><div class="mname">SYBER VAULT</div></div>
          <div class="m-item active" data-tab="vault" onclick="switchTab('vault');closeMenubar();"><i class="fas fa-folder"></i>VAULT</div>
          <div class="m-item" data-tab="tools" onclick="switchTab('tools');closeMenubar();"><i class="fas fa-tools"></i>TOOLS</div>
          <div class="m-item" data-tab="deploy" onclick="switchTab('deploy');closeMenubar();"><i class="fas fa-rocket"></i>DEPLOY</div>
          <div class="m-item" data-tab="terminal" onclick="switchTab('terminal');closeMenubar();"><i class="fas fa-terminal"></i>TERMINAL</div>
          <div class="m-item" data-tab="admin" onclick="switchTab('admin');closeMenubar();"><i class="fas fa-shield"></i>ADMIN</div>
          <div class="m-item exit" onclick="showExitConfirm()"><i class="fas fa-sign-out-alt"></i>EXIT</div>
        </div>
        
        <div class="workspace"><div class="mainpanel" id="mainpanel"></div></div>
        
        <div class="footer">
          <div class="f-left"><span>&copy; 2026 <span class="f-brand">SYBER VAULT</span></span><span class="f-author">MD ALL MAMUN</span></div>
          <div class="f-social"><a href="https://t.me/allmamun209209" target="_blank"><i class="fab fa-telegram-plane"></i></a><a href="https://github.com/syber-vault" target="_blank"><i class="fab fa-github"></i></a></div>
          <span class="f-about" onclick="showAboutPopup()"><i class="fas fa-info-circle"></i> About</span>
          <span class="f-clock" id="footerClock">--:--</span>
        </div>
      </div>
      <button class="fab" onclick="if(typeof openCreateModal==='function')openCreateModal()">+</button>
      
      <div class="popup-overlay" id="exitPopup"><div class="popup-box" onclick="event.stopPropagation()"><i class="fas fa-triangle-exclamation" style="font-size:32px;color:#ffd600;margin-bottom:8px;display:block;"></i><h3><i class="fas fa-question-circle"></i> EXIT VAULT?</h3><p>Are you sure you want to lock and exit?</p><div class="popup-btns"><button class="popup-btn" onclick="document.getElementById('exitPopup').classList.remove('show')">CANCEL</button><button class="popup-btn danger" onclick="document.getElementById('exitPopup').classList.remove('show');lockVault();"><i class="fas fa-lock"></i> LOCK & EXIT</button></div></div></div>
      
      <div class="about-popup" id="aboutPopup" onclick="this.classList.remove('show')"><div class="about-box" onclick="event.stopPropagation()"><i class="fas fa-skull" style="font-size:40px;color:#00ff41;margin-bottom:8px;display:block;"></i><div style="color:#00ff41;font-size:14px;letter-spacing:4px;font-weight:bold;">SYBER VAULT</div><div style="color:#555;font-size:8px;letter-spacing:2px;margin-bottom:12px;">v8.0 // SECURE TERMINAL</div><div style="border-top:1px solid #1a1a1a;padding-top:12px;font-size:9px;color:#c0c0c0;line-height:2;"><i class="fas fa-user" style="color:#00ff41;width:18px;"></i> <span style="color:#00e5ff;font-weight:bold;">MD ALL MAMUN</span><br><i class="fas fa-at" style="color:#00ff41;width:18px;"></i> @allmamun209209<br><i class="fab fa-github" style="color:#00ff41;width:18px;"></i> github.com/syber-vault</div><button onclick="document.getElementById('aboutPopup').classList.remove('show')" style="margin-top:14px;padding:7px 20px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-family:monospace;font-size:9px;">CLOSE</button></div></div>
    `;
    
    showToastSequence();
  }

  function cacheDOM() {
    DOM = { menubar: document.getElementById('menubar'), mainpanel: document.getElementById('mainpanel'), clock: document.getElementById('clock'), footerClock: document.getElementById('footerClock'), mitems: document.querySelectorAll('.m-item') };
  }

  function bindEvents() {
    // Menubar handle - easy hover/click
    var handle = document.getElementById('menubarHandle');
    if (handle) {
      handle.addEventListener('mouseenter', openMenubar);
      handle.addEventListener('click', function() { DOM.menubar.classList.contains('open') ? closeMenubar() : openMenubar(); });
    }
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (DOM.menubar && DOM.menubar.classList.contains('open') && !DOM.menubar.contains(e.target) && e.target !== handle) {
        closeMenubar();
      }
    });
    
    // Swipe detection
    var sx=0, sy=0;
    document.addEventListener('touchstart', function(e){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
    document.addEventListener('touchend', function(e){
      var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(sx<40&&dx>40&&Math.abs(dx)>Math.abs(dy)) openMenubar();
      if(dx<-40&&Math.abs(dx)>Math.abs(dy)) closeMenubar();
    });
    var dg=false;
    document.addEventListener('mousedown', function(e){ if(e.clientX<12)dg=true; });
    document.addEventListener('mousemove', function(e){ if(dg&&e.clientX>60){openMenubar();dg=false;} });
    document.addEventListener('mouseup', function(){dg=false;});
  }

  function openMenubar() { if (DOM.menubar) DOM.menubar.classList.add('open'); }
  function closeMenubar() { if (DOM.menubar) DOM.menubar.classList.remove('open'); }

  function startClock() {
    if (STATE.clockInterval) clearTimeout(STATE.clockInterval);
    (function tick() {
      var n=new Date();
      if(DOM.clock)DOM.clock.textContent=n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      if(DOM.footerClock)DOM.footerClock.textContent=n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
      STATE.clockInterval=setTimeout(tick,1000);
    })();
  }

  function showToast(icon, msg, type, duration) {
    var c=document.getElementById('toastContainer');if(!c)return;
    var t=document.createElement('div');t.className='toast '+(type||'');t.innerHTML='<i class="fas '+icon+'"></i><span class="toast-msg">'+msg+'</span>';c.appendChild(t);
    setTimeout(function(){t.classList.add('show')},50);
    setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove()},400)},duration||4000);
  }

  function showToastSequence() {
    var u=root.currentUser||{username:'sybervault'};
    setTimeout(function(){showToast('fa-hand-sparkles','Welcome, '+u.username+'!','',4000);},500);
    setTimeout(function(){showToast('fa-skull','Created by MD ALL MAMUN | Syber Vault v8.0','creator',4000);},4500);
    setTimeout(function(){if(!localStorage.getItem('sv_visited')){showToast('fa-bolt','<b>Features:</b> Vault | AI Editor | Admin | Bot Deploy | Gist Sync','features',5000);localStorage.setItem('sv_visited','1');}},9000);
  }

  root.switchTab = function(tab) {
    STATE.currentTab = tab;
    if (DOM.mitems) DOM.mitems.forEach(function(el) { el.classList.toggle('active', el.dataset.tab === tab); });
    if (!DOM.mainpanel) return;
    if (tab === 'admin') { if (typeof window.openAdminPanel === 'function') window.openAdminPanel(); DOM.mainpanel.innerHTML = ''; return; }
    if (tab === 'vault' && typeof window.renderVault === 'function') window.renderVault(DOM.mainpanel);
    else if (tab === 'tools' && typeof window.renderTools === 'function') window.renderTools(DOM.mainpanel);
    else if (tab === 'deploy' && typeof window.renderDeploy === 'function') window.renderDeploy(DOM.mainpanel);
    else DOM.mainpanel.innerHTML = '<div style="text-align:center;padding:60px;color:#555;"><i class="fas fa-cogs" style="font-size:48px;display:block;margin-bottom:16px;opacity:0.2;"></i>Coming Soon</div>';
  };

  function initMatrix() {
    var c=document.getElementById('matrixCanvas');if(!c||c.dataset.running)return;c.dataset.running='1';
    var x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
    var ch='01アイウエオカキクケコ',fs=CONFIG.lowDevice?12:14,cols=Math.floor(c.width/fs);
    var d=Array(cols).fill(0).map(function(){return Math.floor(Math.random()*20);});
    (function draw(){if(!document.getElementById('matrixCanvas'))return;
      x.fillStyle='rgba(0,0,0,0.05)';x.fillRect(0,0,c.width,c.height);
      x.font='bold '+fs+'px monospace';
      for(var i=0;i<d.length;i++){x.fillStyle='#0f0';x.fillText(ch[Math.floor(Math.random()*ch.length)],i*fs,d[i]*fs);if(d[i]*fs>c.height&&Math.random()>.97)d[i]=0;d[i]++;}
      requestAnimationFrame(draw);
    })();
  }

  function lockVault() {
    document.getElementById('app').innerHTML='';if(STATE.clockInterval)clearTimeout(STATE.clockInterval);
    root.currentUser=null;root.authToken=null;
    if(typeof root.initLogin==='function')root.initLogin();
  }
  root.lockVault=lockVault;
  root.showAboutPopup=function(){document.getElementById('aboutPopup').classList.add('show');};
  root.showExitConfirm=function(){document.getElementById('exitPopup').classList.add('show');};

})(window);
