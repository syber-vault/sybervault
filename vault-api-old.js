// ═══════════════════════════════════════
// SYBER VAULT v8.0 | VAULT API
// Gist + GitHub Clone + ZIP + Token
// ═══════════════════════════════════════

(function() {
  'use strict';

  var GIST_ID = '68eee73f820aa5cff1812077e88ab682';

  window.genToken = function() { return 'vault_' + Math.random().toString(36).substr(2, 12); };

  window.getRepoToken = function(rid) {
    var r = (window.VAULT_DATA||{}).repos||[];
    var f = r.find(function(x){return x.id===rid;});
    return f ? f.token || '' : '';
  };

  window.setRepoToken = function(rid, t) {
    var r = (window.VAULT_DATA||{}).repos||[];
    var f = r.find(function(x){return x.id===rid;});
    if(f) f.token = t || window.genToken();
  };

  window.toggleRepoPublic = function(rid, pub) {
    var r = (window.VAULT_DATA||{}).repos||[];
    var f = r.find(function(x){return x.id===rid;});
    if(f) { f.isPublic = pub; if(!pub&&!f.token) f.token = window.genToken(); }
  };

  window.getRepoLink = function(name) {
    return (window.location.origin||'https://sybervault.onrender.com') + '/vault/' + encodeURIComponent(name);
  };

  // Gist Sync
  window.gistSync = function() {
    var t = localStorage.getItem('GITHUB_TOKEN');
    if(!t) return;
    var d = window.VAULT_DATA;
    if(!d) return;
    fetch('https://api.github.com/gists/' + GIST_ID, {
      method: 'PATCH',
      headers: { 'Authorization': 'token ' + t, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { 'vault-data.json': { content: JSON.stringify(d,null,2) } } })
    }).catch(function(){});
  };

  setInterval(function(){ window.gistSync(); }, 30000);

  // GitHub Clone - WITH ACTUAL CONTENT DOWNLOAD
  window.githubClone = function(url, token, cb, logFn) {
    var log = logFn || function(){};
    log('> Connecting to GitHub API...');
    
    var api = url.replace('https://github.com/','https://api.github.com/repos/').replace(/\/$/,'');
    var h = {};
    if(token) h['Authorization'] = 'token ' + token;

    // Get repo info
    fetch(api,{headers:h}).then(function(r){return r.json()}).then(function(info){
      log('> Repo: ' + (info.full_name || url));
      
      // Get file tree
      var treeUrl = api + '/git/trees/main?recursive=1';
      return fetch(treeUrl,{headers:h}).then(function(r){return r.json()});
    }).then(function(tree){
      if(!tree.tree) { log('> ERROR: Cannot read repo tree'); return; }
      
      var name = url.split('/').pop().replace('.git','');
      var rid = 'r' + Date.now();
      var V = window.VAULT_DATA;
      V.repos.push({id:rid,name:name,icon:'fa-folder',type:'normal',date:'Now',isPublic:false,token:window.genToken(),link:window.getRepoLink(name)});
      V.files[rid] = [];
      
      var files = tree.tree.filter(function(f){return f.type==='blob';});
      log('> Found ' + files.length + ' files. Downloading...');
      
      var downloaded = 0;
      files.forEach(function(file){
        var fileUrl = api + '/contents/' + file.path;
        fetch(fileUrl,{headers:h}).then(function(r){return r.json()}).then(function(data){
          downloaded++;
          log('> [' + downloaded + '/' + files.length + '] ' + file.path);
          
          var parts = file.path.split('/');
          var fileName = parts.pop();
          var parent = parts.length > 0 ? parts.join('/') : null;
          var ext = (fileName||'').split('.').pop().toLowerCase();
          var types = ['py','js','html','css','json','md','php','sh','xml','yml','java','cpp','c'];
          var content = '';
          
          if(data.content) {
            try { content = atob(data.content); } catch(e) { content = data.content; }
          }
          
          V.files[rid].push({
            id: 'f' + Date.now() + Math.random().toString(36),
            name: fileName,
            type: types.indexOf(ext) >= 0 ? ext : 'file',
            size: (data.size || content.length || 0) + 'B',
            date: new Date().toLocaleTimeString(),
            parent: parent,
            content: content
          });
          
          if(downloaded >= files.length) {
            log('> Done! ' + files.length + ' files cloned.');
            if(cb) cb({success:true,name:name,count:files.length});
            window.refreshVault();
          }
        }).catch(function(e){
          log('> ERROR: ' + file.path + ' - ' + e.message);
        });
      });
    }).catch(function(e){
      log('> ERROR: ' + e.message);
      if(cb) cb({success:false,error:e.message});
    });
  };

  // ZIP Import - With terminal logs
  window.zipImport = function(file, name, cb, logFn) {
    var log = logFn || function(){};
    log('> Reading ZIP file: ' + (file.name || 'unknown'));
    
    var r = new FileReader();
    r.onload = function(e){
      try {
        JSZip.loadAsync(e.target.result).then(function(data){
          var rid = 'r' + Date.now();
          var nm = name || file.name.replace('.zip','');
          var V = window.VAULT_DATA;
          V.repos.push({id:rid,name:nm,icon:'fa-folder',type:'normal',date:'Now',isPublic:false,token:window.genToken(),link:window.getRepoLink(nm)});
          V.files[rid] = [];
          
          var fl=[], proms=[];
          data.forEach(function(path, entry){
            if(!entry.dir){
              log('> Extracting: ' + path);
              fl.push(path);
              var parts=path.split('/'), fn=parts.pop(), parent=parts.length?parts.join('/'):null;
              var ext=(fn||'').split('.').pop().toLowerCase();
              var types=['py','js','html','css','json','md','php','sh','xml','java','cpp','c'];
              proms.push(entry.async('string').then(function(c){
                V.files[rid].push({id:'f'+Date.now()+Math.random().toString(36),name:fn,type:types.indexOf(ext)>=0?ext:'file',size:(c.length||0)+'B',date:new Date().toLocaleTimeString(),parent:parent,content:c});
              }));
            }
          });
          Promise.all(proms).then(function(){
            log('> Done! ' + fl.length + ' files imported.');
            if(cb) cb({success:true,name:nm,count:fl.length,files:fl});
          });
        });
      } catch(err) { log('> ZIP ERROR: ' + err.message); if(cb) cb({success:false,error:'ZIP: '+err.message}); }
    };
    r.onerror = function(){ log('> ERROR: Cannot read file'); };
    r.readAsArrayBuffer(file);
  };

  window.refreshVault = function() {
    var m = document.getElementById('mainpanel');
    if(m && typeof window.renderVault==='function') window.renderVault(m);
  };

})();
