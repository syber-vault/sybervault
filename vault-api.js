// ═══════════════════════════════════════
// SYBER VAULT v8.0 | VAULT BACKEND
// ═══════════════════════════════════════

(function() {
  'use strict';
  var GID = '68eee73f820aa5cff1812077e88ab682';

  // Token
  window.vGenToken = function() { return 'vault_' + Math.random().toString(36).substr(2,12); };

  // Gist Sync
  window.vGistSync = function() {
    var t = localStorage.getItem('GITHUB_TOKEN');
    if (!t) return;
    var d = window.VAULT_DATA;
    if (!d) return;
    fetch('https://api.github.com/gists/'+GID, {
      method:'PATCH',
      headers:{'Authorization':'token '+t, 'Content-Type':'application/json'},
      body:JSON.stringify({files:{'vault-data.json':{content:JSON.stringify(d,null,2)}}})
    }).catch(function(){});
  };
  setInterval(function(){ window.vGistSync(); }, 30000);

  // GitHub Clone with REAL content
  window.vGithubClone = function(url, token, logFn, doneFn) {
    var log = logFn || function(){};
    log('Connecting to GitHub...');
    var api = url.replace('https://github.com/','https://api.github.com/repos/').replace(/\/$/,'');
    var h = token ? {'Authorization':'token '+token} : {};
    
    fetch(api,{headers:h}).then(function(r){return r.json()}).then(function(info){
      var name = info.name || url.split('/').pop().replace('.git','');
      log('Repo: '+name);
      log('Getting file list...');
      return fetch(api+'/git/trees/main?recursive=1',{headers:h}).then(function(r){return r.json()}).then(function(tree){
        return {name:name, files:(tree.tree||[]).filter(function(f){return f.type==='blob'})};
      });
    }).then(function(data){
      log('Found '+data.files.length+' files. Downloading...');
      var V = window.VAULT_DATA;
      var rid = 'r'+Date.now();
      V.repos.push({id:rid,name:data.name,icon:'fa-folder',type:'normal',date:'Now',isPublic:false,token:window.vGenToken()});
      V.files[rid] = [];
      
      var done = 0, total = data.files.length;
      data.files.forEach(function(f){
        fetch(api+'/contents/'+f.path,{headers:h}).then(function(r){return r.json()}).then(function(fd){
          done++; log('['+done+'/'+total+'] '+f.path);
          var parts = f.path.split('/'), fn = parts.pop(), parent = parts.length?parts.join('/'):null;
          var ext = (fn||'').split('.').pop().toLowerCase();
          var types = ['py','js','html','css','json','md','php','sh','xml','java','cpp','c'];
          var content = '';
          if(fd.content) { try { content = atob(fd.content); } catch(e) { content = fd.content; } }
          
          V.files[rid].push({
            id:'f'+Date.now()+Math.random().toString(36), name:fn,
            type:types.indexOf(ext)>=0?ext:'file', size:(fd.size||content.length||0)+'B',
            date:new Date().toLocaleTimeString(), parent:parent, content:content
          });
          
          if(done >= total) { log('DONE! '+total+' files cloned.'); if(doneFn) doneFn({ok:true,name:data.name}); window.vRefresh(); }
        }).catch(function(e){ done++; log('SKIP: '+f.path); if(done>=total){ log('DONE! (some skipped)'); if(doneFn) doneFn({ok:true,name:data.name}); window.vRefresh(); } });
      });
    }).catch(function(e){ log('ERROR: '+e.message); if(doneFn) doneFn({ok:false,error:e.message}); });
  };

  // ZIP Import
  window.vZipImport = function(file, name, logFn, doneFn) {
    var log = logFn || function(){};
    log('Reading: '+file.name);
    var r = new FileReader();
    r.onload = function(e){
      JSZip.loadAsync(e.target.result).then(function(zip){
        var nm = name || file.name.replace('.zip','');
        var V = window.VAULT_DATA;
        var rid = 'r'+Date.now();
        V.repos.push({id:rid,name:nm,icon:'fa-folder',type:'normal',date:'Now',isPublic:false,token:window.vGenToken()});
        V.files[rid] = [];
        
        var fl=[], proms=[];
        zip.forEach(function(path, entry){
          if(!entry.dir){
            log('Extracting: '+path);
            fl.push(path);
            var parts=path.split('/'), fn=parts.pop(), parent=parts.length?parts.join('/'):null;
            var ext=(fn||'').split('.').pop().toLowerCase();
            var types=['py','js','html','css','json','md','php','sh','xml','java','cpp','c'];
            proms.push(entry.async('string').then(function(c){
              V.files[rid].push({id:'f'+Date.now()+Math.random().toString(36),name:fn,type:types.indexOf(ext)>=0?ext:'file',size:(c.length||0)+'B',date:new Date().toLocaleTimeString(),parent:parent,content:c});
            }));
          }
        });
        Promise.all(proms).then(function(){ log('DONE! '+fl.length+' files.'); if(doneFn) doneFn({ok:true,name:nm}); });
      }).catch(function(err){ log('ZIP ERROR: '+err.message); if(doneFn) doneFn({ok:false,error:err.message}); });
    };
    r.onerror = function(){ log('ERROR: Cannot read file.'); };
    r.readAsArrayBuffer(file);
  };

  window.vRefresh = function() {
    var m = document.getElementById('mainpanel');
    if(m && typeof window.renderVault==='function') window.renderVault(m);
  };

})();
