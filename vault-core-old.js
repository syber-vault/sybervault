// ═══════════════════════════════════════
// SYBER VAULT v8.0 | VAULT SYSTEM
// ═══════════════════════════════════════

(function() {
  'use strict';

  // DATA
  var VAULT = {
    repos: [{ id:'d1', name:'SyberVault', icon:'fa-database', type:'normal', date:'2026-05-09' }],
    files: { 'd1': [] },
    currentRepo: 'd1',
    currentFolder: null,
    folderHistory: []
  };
  window.VAULT_DATA = VAULT;

  var editFile = null;
  var origContent = '';
  var editMode = false;
  var repoVisible = true;

  // HELPERS
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function getRepo() { return VAULT.repos.find(function(r) { return r.id === VAULT.currentRepo; }) || VAULT.repos[0]; }
  function getFiles() {
    var all = VAULT.files[VAULT.currentRepo] || [];
    if (VAULT.currentFolder) return all.filter(function(f) { return f.parent === VAULT.currentFolder; });
    return all.filter(function(f) { return !f.parent; });
  }
  function refresh() { var m = document.getElementById('mainpanel'); if (m) window.renderVault(m); }

  function getBadge(f) {
    if (!f || f.type === 'folder') return { t: 'FLD', c: '#00e5ff' };
    if (f.type === 'img' || f.type === 'media' || f.mdata) return { t: 'IMG', c: '#ffd600' };
    var ext = (f.name || '').split('.').pop().toUpperCase();
    var cols = { PY: '#3572A5', JS: '#f7df1e', HTML: '#e34c26', CSS: '#563d7c', PHP: '#777bb4', JSON: '#f1e05a', MD: '#083fa1', SH: '#00ff41' };
    return { t: ext || 'FILE', c: cols[ext] || '#888' };
  }

  // CSS INJECT
  function injectCSS() {
    if (document.getElementById('vcCSS')) return;
    var s = document.createElement('style');
    s.id = 'vcCSS';
    s.textContent = '.vw{padding-bottom:70px}.vs{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(0,255,65,0.12);margin-bottom:10px}.vt{color:#00ff41;font-size:12px;letter-spacing:2px;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none}.vt i.arr{transition:transform 0.3s;font-size:10px}.vt.hid i.arr{transform:rotate(-90deg)}.vc{font-size:9px;color:#666}.vb{padding:7px 14px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;font-family:monospace;letter-spacing:1px;transition:all 0.2s;display:inline-flex;align-items:center;gap:5px}.vb:hover{border-color:#00ff41;color:#00ff41}.vb.gr{border-color:#00ff41;color:#00ff41}.vb.gr:hover{background:#00ff41;color:#000}.vb.ye{border-color:#ffd600;color:#ffd600}.vb.cy{border-color:#00e5ff;color:#00e5ff}.rl{display:flex;flex-direction:column;gap:1px;max-height:260px;overflow-y:auto}.ri{display:flex;align-items:center;padding:10px 14px;background:#0c0c0c;border:1px solid transparent;cursor:pointer;gap:10px;transition:all 0.2s;position:relative}.ri:hover{background:rgba(0,255,65,0.03)}.ri.ac{border-color:rgba(0,255,65,0.5);background:rgba(0,255,65,0.06)}.ric{font-size:16px;color:#00ff41;width:24px;text-align:center}.rin{flex:1}.rnm{font-size:12px;color:#fff;font-weight:bold}.rmt{font-size:8px;color:#888}.rbt{width:28px;height:28px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:11px;display:grid;place-items:center;transition:all 0.2s;flex-shrink:0}.rbt:hover{border-color:#00ff41;color:#00ff41}.rm{position:absolute;top:100%;right:0;background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);z-index:50;min-width:140px;display:none;box-shadow:0 5px 25px rgba(0,0,0,0.9)}.rm.on{display:block}.rmi{padding:9px 14px;font-size:10px;cursor:pointer;display:flex;align-items:center;gap:8px;color:#888;transition:all 0.15s}.rmi:hover{background:rgba(0,255,65,0.05);color:#00ff41;padding-left:16px}.rmi.dl:hover{background:rgba(255,26,26,0.05);color:#ff1a1a}.rmd{height:1px;background:#1a1a1a;margin:3px 0}.br{padding:6px 0;font-size:9px;color:#666;display:flex;align-items:center;gap:3px;margin-bottom:6px}.br span{color:#00e5ff;cursor:pointer}.br span:hover{color:#00ff41}.br i{color:#333}.fr{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.015);cursor:pointer;font-size:11px;transition:background 0.15s}.fr:hover{background:rgba(0,255,65,0.025)}.fbg{font-size:8px;padding:2px 6px;border:1px solid;font-weight:bold;letter-spacing:1px;min-width:32px;text-align:center;flex-shrink:0}.fnm{flex:1;color:#e0e0e0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fnm.fld{color:#00e5ff}.fsz{font-size:8px;color:#888;width:50px;text-align:right}.fdt{font-size:8px;color:#888;width:60px;text-align:right}.fdo{background:none;border:none;color:#555;cursor:pointer;font-size:16px;padding:4px 8px}.fdo:hover{color:#00ff41}.cx{position:fixed;background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);z-index:500;min-width:150px;display:none;box-shadow:0 5px 25px rgba(0,0,0,0.9)}.cx.on{display:block}.cxi{padding:10px 14px;font-size:10px;cursor:pointer;display:flex;align-items:center;gap:8px;color:#888;transition:all 0.15s}.cxi:hover{background:rgba(0,255,65,0.05);color:#00ff41}.cxi.dl:hover{background:rgba(255,26,26,0.05);color:#ff1a1a}.cxd{height:1px;background:#1a1a1a;margin:3px 0}.em{text-align:center;padding:50px;color:#444;font-size:11px}.em i{font-size:36px;display:block;margin-bottom:10px;opacity:0.2}.mo{position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:1000;display:flex;align-items:center;justify-content:center}.mb{background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);width:480px;max-width:93vw;max-height:90vh;overflow-y:auto;box-shadow:0 0 35px rgba(0,255,65,0.1)}.mh{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#00ff41;font-size:11px;letter-spacing:2px}.mx{background:none;border:none;color:#888;cursor:pointer;font-size:18px}.mx:hover{color:#ff1a1a}.mbo{padding:14px}.mf{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #1a1a1a}.mi,.mt{width:100%;padding:10px;background:#000;border:1px solid #333;color:#e0e0e0;font-family:monospace;font-size:12px;outline:none;margin-bottom:8px}.mi:focus,.mt:focus{border-color:#00ff41}.mt{min-height:110px;resize:vertical}.ml{display:block;font-size:8px;color:#888;letter-spacing:2px;margin-bottom:5px;text-transform:uppercase}.tb{display:flex;gap:5px;margin-bottom:10px}.tbb{flex:1;padding:10px 5px;background:transparent;border:1px solid #333;text-align:center;color:#888;cursor:pointer;font-size:8px;font-family:monospace;transition:all 0.2s}.tbb i{font-size:15px;display:block;margin-bottom:4px}.tbb.on{border-color:#00ff41;color:#00ff41;background:rgba(0,255,65,0.05)}.uz{border:1px dashed rgba(0,255,65,0.2);padding:20px;text-align:center;cursor:pointer;color:#888;margin-top:6px;transition:all 0.3s}.uz:hover{border-color:#00ff41;color:#00ff41}.uz i{font-size:26px;display:block;margin-bottom:6px}.pv{margin-top:8px;display:none}.pv img,.pv video{max-width:100%;max-height:180px;border:1px solid #1a1a1a}.ig{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}.icl{aspect-ratio:1;display:grid;place-items:center;font-size:15px;background:rgba(0,255,65,0.02);border:1px solid #1a1a1a;cursor:pointer;color:#888;transition:all 0.2s}.icl:hover,.icl.sl{border-color:#00ff41;color:#00ff41}.cvo{position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:2000;display:flex;align-items:center;justify-content:center}.cvp{background:#050505;width:95%;max-width:900px;height:92vh;display:flex;flex-direction:column;border:1px solid rgba(0,255,65,0.2);box-shadow:0 0 25px rgba(0,255,65,0.1)}.cvh{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:#080808;border-bottom:1px solid #1a1a1a;color:#fff;font-size:12px;flex-wrap:wrap;gap:8px}.cvhl{display:flex;align-items:center;gap:10px}.cvfn{color:#e0e0e0;font-size:12px}.cvin{font-size:9px;color:#888}.cvhr{display:flex;gap:4px}.cvb{background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;padding:5px 10px;font-family:monospace;letter-spacing:1px;transition:all 0.2s;display:flex;align-items:center;gap:4px;white-space:nowrap}.cvb:hover{border-color:#00ff41;color:#00ff41}.cvb.ac{border-color:#00ff41;color:#00ff41;background:rgba(0,255,65,0.05)}.cvbd{flex:1;overflow:hidden;display:flex}.cvln{padding:12px 10px;text-align:right;color:#333;font-size:12px;line-height:1.7;border-right:1px solid #1a1a1a;min-width:50px;font-family:monospace;overflow-y:auto;white-space:pre;background:rgba(0,0,0,0.3);user-select:none}.cvcd{flex:1;padding:12px 16px;font-size:12px;line-height:1.7;color:#c0c0c0;font-family:monospace;white-space:pre;outline:none;background:transparent;overflow:auto}.cvft{display:none;justify-content:space-between;align-items:center;padding:8px 16px;background:#080808;border-top:1px solid #1a1a1a;color:#888;font-size:10px}.cvft.on{display:flex}@media(max-width:768px){.ri{padding:8px 10px}.fr{padding:8px 10px;font-size:10px}.cvp{width:98%;height:95vh}}';
    document.head.appendChild(s);
  }

  // MAIN RENDER FUNCTION
  window.renderVault = function(container) {
    injectCSS();
    var repo = getRepo();
    VAULT.currentRepo = repo.id;
    var files = getFiles();

    var bread = '<i class="fas fa-home"></i> <span onclick="navigateToRoot()">root</span>';
    VAULT.folderHistory.forEach(function(f) {
      bread += ' <i>/</i> <span onclick="navigateToFolder(\'' + f + '\')">' + esc(f) + '</span>';
    });
    if (VAULT.currentFolder) bread += ' <i>/</i> <span style="color:#00ff41;">' + esc(VAULT.currentFolder) + '</span>';

    var repoHtml = VAULT.repos.map(function(r) {
      var act = r.id === VAULT.currentRepo;
      return '<div class="ri' + (act ? ' ac' : '') + '" onclick="selectRepo(\'' + r.id + '\')">' +
        '<div class="ric"><i class="fas ' + r.icon + '"></i></div>' +
        '<div class="rin"><div class="rnm">' + esc(r.name) + '</div><div class="rmt">' + (VAULT.files[r.id] || []).length + ' files</div></div>' +
        '<div class="rbt" onclick="event.stopPropagation();toggleRM(event,\'' + r.id + '\')">⋮</div>' +
        '<div class="rm" id="rm_' + r.id + '">' +
          '<div class="rmi" data-a="rename" data-rid="' + r.id + '"><i class="fas fa-pen"></i> Rename</div>' +
          '<div class="rmi" data-a="icon" data-rid="' + r.id + '"><i class="fas fa-icons"></i> Icon</div>' +
          '<div class="rmi" data-a="dup" data-rid="' + r.id + '"><i class="fas fa-copy"></i> Duplicate</div>' +
          '<div class="rmd"></div>' +
          '<div class="rmi dl" data-a="delete" data-rid="' + r.id + '"><i class="fas fa-trash"></i> Delete</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var fileHtml = files.length === 0
      ? '<div class="em"><i class="fas fa-folder-open"></i>EMPTY DIRECTORY</div>'
      : files.map(function(f) {
          var b = getBadge(f);
          return '<div class="fr" onclick="handleFileClick(\'' + f.id + '\')">' +
            '<span class="fbg" style="border-color:' + b.c + ';color:' + b.c + ';">' + b.t + '</span>' +
            '<span class="fnm' + (f.type === 'folder' ? ' fld' : '') + '">' + esc(f.name) + '</span>' +
            '<span class="fsz">' + ((f.content) ? (f.content || '').length + 'B' : f.size || '') + '</span>' +
            '<span class="fdt">' + f.date + '</span>' +
            '<div class="fdo" onclick="event.stopPropagation();ctxMenu(event,\'' + f.id + '\')">⋮</div>' +
          '</div>';
        }).join('');

    container.innerHTML = '<div class="vw">' +
      '<div class="vs">' +
        '<div class="vt' + (repoVisible ? '' : ' hid') + '" id="repoTitle" onclick="toggleRepos()"><i class="fas fa-folder"></i> REPOSITORIES <i class="fas fa-chevron-down arr"></i></div>' +
        '<div style="display:flex;gap:6px;align-items:center;"><span class="vc">' + VAULT.repos.length + ' repo</span><button class="vb gr" onclick="openNewRepo()"><i class="fas fa-plus"></i> NEW</button></div>' +
      '</div>' +
      '<div class="rl" id="repoList" style="display:' + (repoVisible ? '' : 'none') + '">' + repoHtml + '</div>' +
      '<div class="vs" style="margin-top:14px;"><div class="vt"><i class="fas fa-code-branch"></i> ' + esc(repo.name) + ' (' + files.length + ')</div></div>' +
      '<div class="br">' + bread + '</div>' +
      '<div id="fileArea">' + fileHtml + '</div>' +
    '</div><div id="ctxMenu" class="cx"></div>';

    bindRepoMenuEvents();
  };

  function bindRepoMenuEvents() {
    var items = document.querySelectorAll('.rmi');
    items.forEach(function(el) {
      el.onclick = function(e) {
        e.stopPropagation();
        var act = this.getAttribute('data-a');
        var rid = this.getAttribute('data-rid');
        if (!rid) return;

        if (act === 'rename') {
          var r = VAULT.repos.find(function(x) { return x.id === rid; });
          if (r) showRenameModal(r);
        } else if (act === 'icon') {
          var r = VAULT.repos.find(function(x) { return x.id === rid; });
          if (r) showIconModal(r);
        } else if (act === 'dup') {
          var r = VAULT.repos.find(function(x) { return x.id === rid; });
          if (r) {
            var nid = 'r' + Date.now();
            VAULT.repos.push({ id: nid, name: r.name + ' (copy)', icon: r.icon, type: r.type, date: 'Now' });
            VAULT.files[nid] = JSON.parse(JSON.stringify(VAULT.files[rid] || []));
            refresh();
          }
        } else if (act === 'delete') {
          if (rid !== 'd1' && confirm('Delete this repo and ALL files?')) {
            VAULT.repos = VAULT.repos.filter(function(x) { return x.id !== rid; });
            delete VAULT.files[rid];
            if (VAULT.currentRepo === rid) { VAULT.currentRepo = 'd1'; VAULT.currentFolder = null; }
            refresh();
          }
        }
        document.querySelectorAll('.rm').forEach(function(m) { m.classList.remove('on'); });
      };
    });
  }

  window.toggleRepos = function() {
    repoVisible = !repoVisible;
    var rl = document.getElementById('repoList');
    var tt = document.getElementById('repoTitle');
    if (rl) rl.style.display = repoVisible ? '' : 'none';
    if (tt) { if (repoVisible) tt.classList.remove('hid'); else tt.classList.add('hid'); }
  };

  window.toggleRM = function(e, rid) {
    e.stopPropagation();
    document.querySelectorAll('.rm').forEach(function(m) { if (m.id !== 'rm_' + rid) m.classList.remove('on'); });
    var menu = document.getElementById('rm_' + rid);
    if (menu) menu.classList.toggle('on');
    setTimeout(function() {
      var closer = function(ev) {
        if (!ev.target.closest('.rm') && !ev.target.closest('.rbt')) {
          document.querySelectorAll('.rm').forEach(function(m) { m.classList.remove('on'); });
          document.removeEventListener('click', closer);
        }
      };
      document.addEventListener('click', closer);
    }, 50);
  };

  window.handleFileClick = function(id) {
    var file = (VAULT.files[VAULT.currentRepo] || []).find(function(f) { return f.id === id; });
    if (!file) return;
    if (file.type === 'folder') {
      VAULT.folderHistory.push(VAULT.currentFolder);
      VAULT.currentFolder = file.name;
      refresh();
    } else {
      openCodeViewer(id);
    }
  };

  // RENAME MODAL
  function showRenameModal(obj) {
    var modal = document.createElement('div'); modal.className = 'mo';
    modal.innerHTML = '<div class="mb" onclick="event.stopPropagation()"><div class="mh"><i class="fas fa-pen"></i> RENAME <button class="mx" onclick="this.closest(\'.mo\').remove()">&times;</button></div><div class="mbo"><label class="ml">NEW NAME</label><input class="mi" id="renameInput" value="' + esc(obj.name || '') + '"></div><div class="mf"><button class="vb" onclick="this.closest(\'.mo\').remove()">CANCEL</button><button class="vb gr" id="saveRename">SAVE</button></div></div>';
    modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    document.body.appendChild(modal);
    document.getElementById('saveRename').onclick = function() {
      var nn = document.getElementById('renameInput').value.trim();
      if (nn) { obj.name = nn; modal.remove(); refresh(); }
    };
  }

  // ICON MODAL
  function showIconModal(repo) {
    var icons = ['fa-database','fa-folder-open','fa-laptop-code','fa-lock','fa-book','fa-star','fa-bullseye','fa-gem','fa-shield-halved','fa-rocket','fa-camera','fa-briefcase','fa-key','fa-code','fa-terminal','fa-skull','fa-fire','fa-bolt','fa-globe','fa-heart','fa-robot','fa-flask','fa-music','fa-gamepad'];
    var sel = repo.icon;
    var modal = document.createElement('div'); modal.className = 'mo';
    modal.innerHTML = '<div class="mb" onclick="event.stopPropagation()"><div class="mh"><i class="fas fa-icons"></i> ICON <button class="mx" onclick="this.closest(\'.mo\').remove()">&times;</button></div><div class="mbo"><div class="ig">' + icons.map(function(i) { return '<div class="icl' + (i === sel ? ' sl' : '') + '" data-i="' + i + '"><i class="fas ' + i + '"></i></div>'; }).join('') + '</div></div><div class="mf"><button class="vb" onclick="this.closest(\'.mo\').remove()">CANCEL</button><button class="vb gr" id="svIcon">SAVE</button></div></div>';
    modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    document.body.appendChild(modal);
    modal.querySelectorAll('.icl').forEach(function(c) {
      c.onclick = function() {
        sel = this.getAttribute('data-i');
        modal.querySelectorAll('.icl').forEach(function(x) { x.classList.remove('sl'); });
        this.classList.add('sl');
      };
    });
    document.getElementById('svIcon').onclick = function() { repo.icon = sel; modal.remove(); refresh(); };
  }

  // CONTEXT MENU
  window.ctxMenu = function(e, fid) {
    e.stopPropagation();
    var file = (VAULT.files[VAULT.currentRepo] || []).find(function(f) { return f.id === fid; });
    if (!file) return;
    var menu = document.getElementById('ctxMenu');
    menu.innerHTML = '<div class="cxi" data-a="rename"><i class="fas fa-pen"></i> Rename</div><div class="cxi" data-a="copy"><i class="fas fa-copy"></i> Copy Name</div><div class="cxi" data-a="download"><i class="fas fa-download"></i> Download</div><div class="cxd"></div><div class="cxi dl" data-a="delete"><i class="fas fa-trash"></i> Delete</div>';
    menu.style.top = Math.min(e.clientY, innerHeight - 180) + 'px';
    menu.style.left = Math.min(e.clientX, innerWidth - 160) + 'px';
    menu.classList.add('on');

    menu.querySelectorAll('.cxi').forEach(function(el) {
      el.onclick = function(ev) {
        ev.stopPropagation();
        var a = this.getAttribute('data-a');
        if (a === 'rename') showRenameModal(file);
        else if (a === 'copy') copyText(file.name);
        else if (a === 'download') downloadFile(fid);
        else if (a === 'delete') {
          if (confirm('Delete?')) {
            var arr = VAULT.files[VAULT.currentRepo];
            var i = arr.findIndex(function(x) { return x.id === fid; });
            if (i > -1) arr.splice(i, 1);
            refresh();
          }
        }
        menu.classList.remove('on');
      };
    });

    setTimeout(function() {
      var cl = function(ev) {
        if (!menu.contains(ev.target)) { menu.classList.remove('on'); document.removeEventListener('click', cl); }
      };
      document.addEventListener('click', cl);
    }, 50);
  };

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
    } else {
      var ta = document.createElement('textarea'); ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      alert('Copied!');
    }
  }

  function downloadFile(id) {
    var f = (VAULT.files[VAULT.currentRepo] || []).find(function(x) { return x.id === id; });
    if (!f || f.type === 'folder') return;
    var ext = (f.name || '').split('.').pop();
    var mimes = { html: 'text/html', js: 'text/javascript', css: 'text/css', py: 'text/x-python', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', wav: 'audio/wav', pdf: 'application/pdf', zip: 'application/zip' };
    var blob;
    if (f.mdata) {
      var arr = f.mdata.split(',');
      var mime = (arr[0].match(/:(.*?);/) || [])[1] || 'application/octet-stream';
      var binary = atob(arr[1]);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      blob = new Blob([bytes], { type: mime });
    } else {
      blob = new Blob([f.content || ''], { type: mimes[ext] || 'text/plain' });
    }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
  }

  // NAVIGATION
  window.selectRepo = function(id) { VAULT.currentRepo = id; VAULT.currentFolder = null; VAULT.folderHistory = []; refresh(); };
  window.navigateToRoot = function() { VAULT.currentFolder = null; VAULT.folderHistory = []; refresh(); };
  window.navigateToFolder = function(name) {
    var i = VAULT.folderHistory.indexOf(name);
    if (i > -1) { VAULT.currentFolder = name; VAULT.folderHistory = VAULT.folderHistory.slice(0, i); refresh(); }
  };

  // NEW REPO
  window.openNewRepo = function() {
    var icons = ['fa-database','fa-folder-open','fa-laptop-code','fa-lock','fa-book','fa-star','fa-bullseye','fa-gem','fa-shield-halved','fa-rocket','fa-camera','fa-briefcase','fa-key','fa-code','fa-terminal','fa-skull','fa-fire','fa-bolt','fa-globe','fa-heart','fa-robot','fa-flask','fa-music','fa-gamepad'];
    var sel = 'fa-database';
    var modal = document.createElement('div'); modal.className = 'mo';
    modal.innerHTML = '<div class="mb" onclick="event.stopPropagation()"><div class="mh">+ NEW REPOSITORY <button class="mx" onclick="this.closest(\'.mo\').remove()">&times;</button></div><div class="mbo"><label class="ml">NAME</label><input class="mi" id="rname" placeholder="my-project"><label class="ml">ICON</label><div class="ig">' + icons.map(function(i) { return '<div class="icl' + (i === sel ? ' sl' : '') + '" data-i="' + i + '"><i class="fas ' + i + '"></i></div>'; }).join('') + '</div></div><div class="mf"><button class="vb" onclick="this.closest(\'.mo\').remove()">CANCEL</button><button class="vb gr" id="crRepo">CREATE</button></div></div>';
    modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    document.body.appendChild(modal);
    modal.querySelectorAll('.icl').forEach(function(c) {
      c.onclick = function() { sel = this.getAttribute('data-i'); modal.querySelectorAll('.icl').forEach(function(x) { x.classList.remove('sl'); }); this.classList.add('sl'); };
    });
    document.getElementById('crRepo').onclick = function() {
      var nm = document.getElementById('rname').value.trim();
      if (!nm) return alert('Name required!');
      var id = 'r' + Date.now();
      VAULT.repos.push({ id: id, name: nm, icon: sel, type: 'normal', date: 'Now' });
      VAULT.files[id] = [];
      VAULT.currentRepo = id;
      VAULT.currentFolder = null;
      VAULT.folderHistory = [];
      modal.remove();
      refresh();
    };
  };

  // CREATE ITEM
  window.openCreateModal = function() {
    var modal = document.createElement('div'); modal.className = 'mo';
    modal.innerHTML = '<div class="mb" onclick="event.stopPropagation()"><div class="mh">+ NEW ENTRY <button class="mx" onclick="this.closest(\'.mo\').remove()">&times;</button></div><div class="mbo"><div class="tb"><div class="tbb on" data-t="folder"><i class="fas fa-folder"></i>FOLDER</div><div class="tbb" data-t="file"><i class="fas fa-file-code"></i>FILE</div><div class="tbb" data-t="media"><i class="fas fa-image"></i>MEDIA</div></div><label class="ml">NAME</label><input class="mi" id="iname" placeholder="filename"><div id="codeSec" style="display:none"><label class="ml">CONTENT</label><textarea class="mt" id="icode" placeholder="// Code..."></textarea></div><div id="mediaSec" style="display:none"><div class="uz" onclick="document.getElementById(\'mfile\').click()"><i class="fas fa-cloud-upload-alt"></i>CLICK TO UPLOAD</div><input type="file" id="mfile" accept="image/*,video/*" style="display:none" onchange="upMedia(event)"><div class="pv" id="mprv"></div></div></div><div class="mf"><button class="vb" onclick="this.closest(\'.mo\').remove()">CANCEL</button><button class="vb gr" id="crItem">CREATE</button></div></div>';
    modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    document.body.appendChild(modal);
    var createCat = 'folder';
    var mediaData = null, mediaURL = null;
    modal.querySelectorAll('.tbb').forEach(function(tab) {
      tab.onclick = function() {
        createCat = this.getAttribute('data-t');
        modal.querySelectorAll('.tbb').forEach(function(x) { x.classList.remove('on'); });
        this.classList.add('on');
        document.getElementById('codeSec').style.display = createCat === 'file' ? 'block' : 'none';
        document.getElementById('mediaSec').style.display = createCat === 'media' ? 'block' : 'none';
      };
    });
    document.getElementById('crItem').onclick = function() {
      var nm = document.getElementById('iname').value.trim();
      if (!nm) return alert('Name required!');
      var type = createCat;
      if (createCat === 'file') { var e = nm.split('.').pop().toLowerCase(); if (['py','js','css','html','json','md'].indexOf(e) > -1) type = e; }
      if (createCat === 'media') type = 'img';
      var file = { id: 'f' + Date.now(), name: nm, type: type, date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), parent: VAULT.currentFolder, content: createCat === 'file' ? (document.getElementById('icode') ? document.getElementById('icode').value : '') : '', mdata: createCat === 'media' ? mediaData : null, mu: createCat === 'media' ? mediaURL : null, size: createCat === 'file' ? ((document.getElementById('icode') ? document.getElementById('icode').value : '') || '').length + 'B' : '' };
      VAULT.files[VAULT.currentRepo] = VAULT.files[VAULT.currentRepo] || [];
      VAULT.files[VAULT.currentRepo].push(file);
      modal.remove();
      refresh();
    };
    window.upMedia = function(e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function(ev) { mediaData = ev.target.result; mediaURL = URL.createObjectURL(f); var p = document.getElementById('mprv'); if (p) { p.style.display = 'block'; p.innerHTML = f.type.indexOf('video/') === 0 ? '<video src="' + mediaURL + '" controls></video>' : '<img src="' + mediaURL + '">'; } document.getElementById('iname').value = f.name; };
      r.readAsDataURL(f);
    };
  };

  // CODE VIEWER
  function openCodeViewer(id) {
    var file = (VAULT.files[VAULT.currentRepo] || []).find(function(f) { return f.id === id; });
    if (!file) return;

    if (file.type === 'img' || file.type === 'media' || file.mdata) {
      var modal = document.createElement('div'); modal.className = 'cvo';
      modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
      var isV = file.name && /\.(mp4|webm|ogg|mov)$/i.test(file.name);
      modal.innerHTML = '<div class="cvp" style="height:auto;" onclick="event.stopPropagation()"><div class="cvh"><span class="cvfn">' + esc(file.name) + '</span><div class="cvhr"><button class="cvb" onclick="downloadFile(\'' + file.id + '\')"><i class="fas fa-download"></i> DL</button><button class="cvb" onclick="this.closest(\'.cvo\').remove()"><i class="fas fa-times"></i></button></div></div><div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;background:#000;">' + (file.mu ? (isV ? '<video src="' + file.mu + '" controls style="max-width:100%;max-height:75vh;"></video>' : '<img src="' + file.mu + '" style="max-width:100%;max-height:75vh;">') : '<span style="color:#555;">No preview</span>') + '</div></div>';
      document.body.appendChild(modal);
      return;
    }

    editFile = file; origContent = file.content || ''; editMode = false;
    var code = file.content || '', lines = code.split('\n'), words = code.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    var ln = ''; for (var i = 1; i <= Math.max(lines.length, 1); i++) ln += i + '\n';

    var modal = document.createElement('div'); modal.className = 'cvo';
    modal.addEventListener('click', function(e) { if (e.target === this) closeCV(); });
    modal.innerHTML = '<div class="cvp" onclick="event.stopPropagation()"><div class="cvh"><div class="cvhl"><i class="fas fa-file-code" style="color:#00ff41;"></i><span class="cvfn">' + esc(file.name) + '</span><span class="cvin" id="cvInfo">' + lines.length + ' lines &middot; ' + words + ' words</span></div><div class="cvhr"><button class="cvb" id="cvEditBtn" onclick="toggleEdit()"><i class="fas fa-pen"></i> EDIT</button><button class="cvb" onclick="copyCode()"><i class="fas fa-copy"></i> COPY</button><button class="cvb" onclick="downloadFile(\'' + file.id + '\')"><i class="fas fa-download"></i> DL</button><button class="cvb" onclick="closeCV()"><i class="fas fa-times"></i></button></div></div><div class="cvbd"><div class="cvln" id="cvLines">' + ln + '</div><div class="cvcd" id="cvCode" contenteditable="false" spellcheck="false">' + esc(code) + '</div></div><div class="cvft" id="cvFooter"><span>EDITING: ' + esc(file.name) + '</span><div style="display:flex;gap:6px;"><button class="cvb" onclick="cancelEdit()">CANCEL</button><button class="cvb" style="border-color:#00ff41;color:#00ff41;" onclick="saveCode()"><i class="fas fa-save"></i> SAVE</button></div></div></div>';
    document.body.appendChild(modal);

    setTimeout(function() {
      var ce = document.getElementById('cvCode'), le = document.getElementById('cvLines');
      if (ce && le) ce.addEventListener('scroll', function() { le.scrollTop = ce.scrollTop; });
    }, 100);
  }

  function closeCV() { var ov = document.querySelector('.cvo'); if (ov) ov.remove(); editFile = null; origContent = ''; editMode = false; }

  window.toggleEdit = function() {
    var ce = document.getElementById('cvCode'), ft = document.getElementById('cvFooter'), eb = document.getElementById('cvEditBtn');
    if (!ce) return;
    editMode = !editMode;
    ce.setAttribute('contenteditable', editMode ? 'true' : 'false');
    if (ft) { if (editMode) ft.classList.add('on'); else ft.classList.remove('on'); }
    if (eb) { if (editMode) eb.classList.add('ac'); else eb.classList.remove('ac'); }
    if (editMode) { ce.focus(); updateInfo(); ce.addEventListener('input', updateInfo); }
    else { ce.textContent = origContent; ce.removeEventListener('input', updateInfo); updateInfo(); }
  };

  window.cancelEdit = function() {
    var ce = document.getElementById('cvCode'), ft = document.getElementById('cvFooter'), eb = document.getElementById('cvEditBtn');
    if (ce) ce.textContent = origContent;
    editMode = false;
    if (ce) ce.setAttribute('contenteditable', 'false');
    if (ft) ft.classList.remove('on');
    if (eb) eb.classList.remove('ac');
    updateInfo();
  };

  window.saveCode = function() {
    var ce = document.getElementById('cvCode');
    if (!ce || !editFile) return;
    editFile.content = ce.textContent || '';
    editFile.size = (editFile.content.length || 0) + 'B';
    origContent = editFile.content;
    editMode = false;
    ce.setAttribute('contenteditable', 'false');
    var ft = document.getElementById('cvFooter'); if (ft) ft.classList.remove('on');
    var eb = document.getElementById('cvEditBtn'); if (eb) eb.classList.remove('ac');
    updateInfo();
    refresh();
  };

  window.copyCode = function() { var text = (editFile ? editFile.content : '') || origContent || ''; if (!text) return alert('Nothing to copy!'); copyText(text); };
  window.closeCV = function() { closeCV(); };

  function updateInfo() {
    var ce = document.getElementById('cvCode'), le = document.getElementById('cvLines'), inf = document.getElementById('cvInfo');
    if (!ce || !le) return;
    var text = ce.textContent || '', lines = text.split('\n'), words = text.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    var n = ''; for (var i = 1; i <= Math.max(lines.length, 1); i++) n += i + '\n';
    le.textContent = n;
    if (inf) inf.textContent = lines.length + ' lines &middot; ' + words + ' words';
  }

  // ALSO EXPOSE downloadFile
  window.downloadFile = downloadFile;

})();
