// ═══════════════════════════════════════
// SYBER VAULT v8.0 | ADMIN PANEL FINAL
// ═══════════════════════════════════════
(function(){
'use strict';
var W=window,D=document,L=localStorage;
var users=JSON.parse(L.getItem('cv_users')||'[]');
var logs=JSON.parse(L.getItem('cv_logs')||'[]');
var blocked=JSON.parse(L.getItem('cv_blocked')||'[]');
var banned=JSON.parse(L.getItem('cv_banned')||'[]');
var bots=JSON.parse(L.getItem('sv_deployments')||'[]');
var cfg=JSON.parse(L.getItem('cv_cfg')||'{"theme":"green","matrix":true,"scanline":true,"scanbeam":true,"confirmDelete":true,"bruteForce":true,"fileAlert":true,"sessionTimeout":30}');
var active='dash';

// INIT DEFAULT ADMIN
if(!users.length){users=[{username:'sybervault',email:'sybervault@gmail.com',role:'main_admin',online:true,joined:new Date().toLocaleDateString(),perms:{files:{v:true,c:true,e:true,d:true},repos:{v:true,c:true,e:true,d:true},bots:{v:true,d:true,s:true},tools:{v:true,u:true},admin:{p:true,m:true,l:true,k:true}}}];saveU();}
function saveU(){L.setItem('cv_users',JSON.stringify(users));}
function saveL(){L.setItem('cv_logs',JSON.stringify(logs));}
function saveBk(){L.setItem('cv_blocked',JSON.stringify(blocked));}
function saveBn(){L.setItem('cv_banned',JSON.stringify(banned));}
function saveBt(){L.setItem('sv_deployments',JSON.stringify(bots));}
function saveC(){L.setItem('cv_cfg',JSON.stringify(cfg));}

// ═══════════ OPEN PANEL ═══════════
W.openAdminPanel=function(){
if(D.getElementById('adOver'))return;
var o=D.createElement('div');o.id='adOver';o.innerHTML=
'<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;" onclick="closeAdminPanel()"></div>'+
'<div style="position:fixed;top:2vh;left:2vw;right:2vw;bottom:2vh;background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);z-index:10001;display:flex;flex-direction:column;max-width:900px;margin:auto;" onclick="event.stopPropagation()">'+
'<div style="display:flex;justify-content:space-between;padding:12px 18px;background:#080808;border-bottom:1px solid #1a1a1a;color:#00ff41;font-size:12px;letter-spacing:3px;font-weight:bold;flex-shrink:0;"><span><i class="fas fa-skull"></i> ADMIN PANEL</span><button onclick="closeAdminPanel()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px;">&times;</button></div>'+
'<div style="display:flex;border-bottom:1px solid #1a1a1a;flex-shrink:0;overflow-x:auto;" id="adTabs">'+
'<button class="atb active" data-t="dash"><i class="fas fa-chart-bar"></i> DASH</button>'+
'<button class="atb" data-t="users"><i class="fas fa-users"></i> USERS</button>'+
'<button class="atb" data-t="perms"><i class="fas fa-lock"></i> PERM</button>'+
'<button class="atb" data-t="bots"><i class="fas fa-robot"></i> BOTS</button>'+
'<button class="atb" data-t="logs"><i class="fas fa-scroll"></i> LOGS</button>'+
'<button class="atb" data-t="system"><i class="fas fa-microchip"></i> SYSTEM</button>'+
'<button class="atb" data-t="settings"><i class="fas fa-cog"></i> SET</button>'+
'</div>'+
'<div style="flex:1;overflow-y:auto;padding:16px;" id="adBody"></div>'+
'</div>'+
'<div id="adModal" style="position:fixed;inset:0;z-index:10002;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.93);"></div>';
D.body.appendChild(o);
injCSS();
swT('dash');
D.querySelectorAll('.atb').forEach(function(t){t.addEventListener('click',function(){swT(this.dataset.t);});});
};
W.closeAdminPanel=function(){var e=D.getElementById('adOver');if(e)e.remove();};

function injCSS(){
if(D.getElementById('adCSS'))return;
var s=D.createElement('style');s.id='adCSS';
s.textContent='.atb{flex:1;padding:10px 6px;background:transparent;border:none;color:#888;cursor:pointer;font-size:9px;font-family:monospace;white-space:nowrap;border-bottom:2px solid transparent;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:4px}.atb.active,.atb:hover{color:#00ff41;border-bottom-color:#00ff41}.sc{background:#0c0c0c;border:1px solid #1a1a1a;padding:14px;margin-bottom:8px}.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.si{background:#0c0c0c;border:1px solid #1a1a1a;padding:14px;text-align:center}.siv{font-size:22px;color:#00ff41;font-weight:bold}.sil{font-size:8px;color:#888;text-transform:uppercase;margin-top:4px}.pg{height:6px;background:#1a1a1a;overflow:hidden;margin:8px 0}.pf{height:100%;background:#00ff41}.ab{padding:6px 12px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;font-family:monospace;margin:2px;transition:all 0.2s;display:inline-flex;align-items:center;gap:4px}.ab:hover{border-color:#00ff41;color:#00ff41}.ab.g{border-color:#00ff41;color:#00ff41}.ab.r{border-color:#ff1a1a;color:#ff1a1a}.ab.c{border-color:#00e5ff;color:#00e5ff}.ab.y{border-color:#ffd600;color:#ffd600}.ai{width:100%;padding:8px 10px;background:#000;border:1px solid #333;color:#e0e0e0;font-family:monospace;font-size:11px;outline:none;margin-bottom:8px}.ai:focus{border-color:#00ff41}.le{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.02);font-size:9px}.li{width:16px;text-align:center}.lt{color:#666;width:50px}.lm{flex:1;color:#c0c0c0}.lu{color:#888;font-size:8px}@media(max-width:768px){.sg{grid-template-columns:repeat(2,1fr)}.siv{font-size:18px}}';
D.head.appendChild(s);
}

function swT(t){
active=t;
D.querySelectorAll('.atb').forEach(function(x){x.classList.toggle('active',x.dataset.t===t);});
var b=D.getElementById('adBody');if(!b)return;
if(t==='dash')rDash(b);else if(t==='users')rUsers(b);else if(t==='perms')rPerms(b);else if(t==='bots')rBots(b);else if(t==='logs')rLogs(b);else if(t==='system')rSystem(b);else if(t==='settings')rSet(b);
}

// ═══════════ DASH ═══════════
function rDash(b){
var V=W.VAULT_DATA||{repos:[],files:{}};var tf=0,td=0;
Object.keys(V.files||{}).forEach(function(k){(V.files[k]||[]).forEach(function(f){if(f.type==='folder')td++;else tf++;});});
var used=0;try{for(var k in L){if(L.hasOwnProperty(k))used+=L[k].length*2;}}catch(e){}
var kb=(used/1024).toFixed(1),pct=Math.min(Math.round(used/5242880*100),100);
var online=users.filter(function(u){return u.online;}).length;
b.innerHTML=
'<div class="sg">'+
'<div class="si"><div class="siv">'+(V.repos||[]).length+'</div><div class="sil"><i class="fas fa-database"></i> Repos</div></div>'+
'<div class="si"><div class="siv">'+tf+'</div><div class="sil"><i class="fas fa-file-code"></i> Files</div></div>'+
'<div class="si"><div class="siv">'+td+'</div><div class="sil"><i class="fas fa-folder"></i> Folders</div></div>'+
'<div class="si"><div class="siv">'+kb+' KB</div><div class="sil"><i class="fas fa-hard-drive"></i> Storage</div></div>'+
'<div class="si"><div class="siv">'+online+'</div><div class="sil"><i class="fas fa-circle" style="color:#00ff41;font-size:6px;"></i> Online</div></div>'+
'<div class="si"><div class="siv">'+bots.length+'</div><div class="sil"><i class="fas fa-robot"></i> Bots</div></div>'+
'<div class="si"><div class="siv">25</div><div class="sil"><i class="fas fa-tools"></i> Tools</div></div>'+
'<div class="si"><div class="siv">--</div><div class="sil"><i class="fas fa-clock"></i> Uptime</div></div>'+
'</div>'+
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin-bottom:6px;"><i class="fas fa-chart-line"></i> STORAGE ('+pct+'%)</div>'+
'<div class="pg"><div class="pf" style="width:'+pct+'%"></div></div>'+
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin:12px 0 6px;"><i class="fas fa-history"></i> RECENT</div>'+
'<div class="sc">'+(logs.length?logs.slice(0,5).map(function(l){return'<div class="le"><span class="li" style="color:'+(l.type==='login'?'#00ff41':l.type==='edit'?'#ffd600':'#ff1a1a')+';"><i class="fas fa-'+(l.type==='login'?'sign-in-alt':l.type==='edit'?'pen':'trash')+'"></i></span><span class="lt">'+l.time+'</span><span class="lm">'+l.msg+'</span><span class="lu">'+l.user+'</span></div>';}).join(''):'<span style="color:#888;">No activity</span>')+'</div>'+
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin:12px 0 6px;"><i class="fas fa-bolt"></i> ACTIONS</div>'+
'<div class="sc"><button class="ab g" onclick="exportAll()"><i class="fas fa-download"></i> EXPORT</button><button class="ab c" onclick="D.getElementById(\'impF\').click()"><i class="fas fa-upload"></i> IMPORT</button><input type="file" id="impF" accept=".json" style="display:none" onchange="importAll(event)"></div>';
}

// ═══════════ USERS ═══════════
function rUsers(b){
var h='<div style="display:flex;gap:8px;margin-bottom:12px;"><input class="ai" id="uSrch" placeholder="Search..." oninput="filterU()" style="flex:1;"><button class="ab g" onclick="addU()"><i class="fas fa-plus"></i> ADD</button><button class="ab c" onclick="expCSV()"><i class="fas fa-file-csv"></i> CSV</button></div>';
users.forEach(function(u,i){
h+='<div class="sc" data-usr="'+u.username+'">'+
'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'+
'<i class="fas fa-'+(u.role==='main_admin'?'crown':u.role==='admin'?'star':'user')+'" style="color:'+(u.role==='main_admin'?'#ffd600':u.role==='admin'?'#00ff41':'#888')+';"></i>'+
'<span style="color:#fff;font-weight:bold;">'+u.username+'</span>'+
'<span style="color:'+(u.online?'#00ff41':'#888')+';font-size:9px;"><i class="fas fa-circle"></i> '+(u.online?'Online':'Offline')+'</span>'+
'<span style="border:1px solid '+(u.role==='main_admin'?'#ffd600':u.role==='admin'?'#00ff41':'#888')+';color:'+(u.role==='main_admin'?'#ffd600':u.role==='admin'?'#00ff41':'#888')+';padding:2px 8px;font-size:8px;margin-left:auto;">'+u.role.replace('_',' ')+'</span></div>'+
'<div style="font-size:9px;color:#888;"><i class="fas fa-envelope"></i> '+(u.email||'N/A')+' | <i class="fas fa-calendar"></i> '+(u.joined||'')+'</div>'+
'<div style="border-top:1px solid #1a1a1a;padding-top:6px;margin-top:6px;">'+
'<button class="ab" onclick="edU('+i+')"><i class="fas fa-pen"></i> EDIT</button>'+
'<button class="ab c" onclick="rstP('+i+')"><i class="fas fa-key"></i> PWD</button>'+
'<button class="ab y" onclick="kickU('+i+')"><i class="fas fa-user-slash"></i> KICK</button>'+
'<button class="ab r" onclick="banU('+i+')"><i class="fas fa-ban"></i> BAN</button>'+
(u.role!=='main_admin'?'<button class="ab r" onclick="delU('+i+')"><i class="fas fa-trash"></i> DELETE</button>':'')+
'</div></div>';
});
b.innerHTML=h;
}
W.filterU=function(){var q=(D.getElementById('uSrch')?.value||'').toLowerCase();D.querySelectorAll('[data-usr]').forEach(function(e){e.style.display=(!q||(e.dataset.usr||'').toLowerCase().indexOf(q)>-1)?'':'none';});};
W.addU=function(){showM('ADD USER','<input class="ai" id="auN" placeholder="Username"><input class="ai" id="auE" placeholder="Email"><input class="ai" id="auP" type="password" placeholder="Password"><select class="ai" id="auR"><option value="viewer">Viewer</option><option value="admin">Admin</option></select>',function(){var n=D.getElementById('auN')?.value?.trim();if(!n)return;users.push({username:n,email:D.getElementById('auE')?.value||'',password:D.getElementById('auP')?.value||'pass123',role:D.getElementById('auR')?.value||'viewer',online:false,joined:new Date().toLocaleDateString(),perms:{files:{v:true,c:false,e:false,d:false},repos:{v:true,c:false,e:false,d:false},bots:{v:true,d:false,s:false},tools:{v:true,u:false},admin:{p:false,m:false,l:false,k:false}}});saveU();closeM();swT('users');});};
W.edU=function(i){var u=users[i];if(!u)return;showM('EDIT: '+u.username,'<input class="ai" id="euN" value="'+u.username+'"><input class="ai" id="euE" value="'+(u.email||'')+'"><select class="ai" id="euR"><option value="viewer" '+(u.role==='viewer'?'selected':'')+'>Viewer</option><option value="admin" '+(u.role==='admin'?'selected':'')+'>Admin</option></select>',function(){u.username=D.getElementById('euN')?.value||u.username;u.email=D.getElementById('euE')?.value||'';u.role=D.getElementById('euR')?.value||u.role;saveU();closeM();swT('users');});};
W.rstP=function(i){var u=users[i];if(!u)return;showM('RESET PASSWORD','<input class="ai" id="rpN" type="password" placeholder="New password">',function(){var p=D.getElementById('rpN')?.value;if(p){u.password=p;saveU();closeM();swT('users');}});};
W.kickU=function(i){users[i].online=false;saveU();swT('users');};
W.banU=function(i){var u=users[i];if(!u||u.role==='main_admin')return;banned.push(u.username);saveBn();users.splice(i,1);saveU();swT('users');};
W.delU=function(i){if(users[i]?.role==='main_admin')return;showC('DELETE USER','Remove '+users[i].username+'?',function(){users.splice(i,1);saveU();closeM();swT('users');});};

// ═══════════ PERMISSIONS ═══════════
function rPerms(b){
var h='<select class="ai" id="permSel" onchange="ldPerm(this.value)"><option value="">Select user...</option>';
users.forEach(function(u){h+='<option value="'+u.username+'">'+u.username+'</option>';});
h+='</select><div id="permBox"></div>';
b.innerHTML=h;
}
W.ldPerm=function(un){
var u=users.find(function(x){return x.username===un;});if(!u)return;
if(!u.perms)u.perms={files:{v:true,c:false,e:false,d:false},repos:{v:true,c:false,e:false,d:false},bots:{v:true,d:false,s:false},tools:{v:true,u:false},admin:{p:false,m:false,l:false,k:false}};
var p=u.perms,box=D.getElementById('permBox'),h='';
var cats={files:'<i class="fas fa-file-code"></i> FILES',repos:'<i class="fas fa-database"></i> REPOS',bots:'<i class="fas fa-robot"></i> BOTS',tools:'<i class="fas fa-tools"></i> TOOLS',admin:'<i class="fas fa-shield"></i> ADMIN'};
var labels={files:{v:'View',c:'Create',e:'Edit',d:'Delete'},repos:{v:'View',c:'Create',e:'Edit',d:'Delete'},bots:{v:'View',d:'Deploy',s:'Stop'},tools:{v:'View',u:'Use'},admin:{p:'Panel',m:'Manage',l:'Logs',k:'Kick'}};
Object.keys(cats).forEach(function(cat){
h+='<div class="sc"><div style="color:#00ff41;font-size:10px;letter-spacing:1px;margin-bottom:6px;">'+cats[cat]+'</div>';
Object.keys(p[cat]).forEach(function(k){
h+='<label style="display:inline-flex;align-items:center;gap:4px;margin:2px 10px;font-size:9px;color:#888;cursor:pointer;"><input type="checkbox" '+(p[cat][k]?'checked':'')+' onchange="tgP(\''+un+'\',\''+cat+'\',\''+k+'\',this.checked)"> '+labels[cat][k]+'</label>';
});
h+='</div>';
});
h+='<button class="ab g" onclick="saveU();alert(\'Permissions saved!\')"><i class="fas fa-save"></i> SAVE</button>';
box.innerHTML=h;
};
W.tgP=function(un,cat,key,val){var u=users.find(function(x){return x.username===un;});if(u&&u.perms)u.perms[cat][key]=val;};

// ═══════════ BOTS ═══════════
function rBots(b){
var h='<button class="ab g" style="margin-bottom:12px;"><i class="fas fa-plus"></i> NEW BOT</button>';
if(!bots.length){h+='<div class="sc"><span style="color:#888;"><i class="fas fa-inbox"></i> No bots deployed</span></div>';}
else{bots.forEach(function(bt){var c=bt.status==='running'?'#00ff41':'#ff1a1a';h+='<div class="sc"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><i class="fas fa-robot" style="color:#00ff41;"></i><span style="color:#fff;font-weight:bold;">'+bt.name+'</span><span style="color:'+c+';font-size:9px;"><i class="fas fa-circle"></i> '+bt.status.toUpperCase()+'</span></div><div style="border-top:1px solid #1a1a1a;padding-top:6px;"><button class="ab g"><i class="fas fa-play"></i> START</button><button class="ab r"><i class="fas fa-stop"></i> STOP</button><button class="ab c"><i class="fas fa-terminal"></i> LOGS</button></div></div>';});}
b.innerHTML=h;
}

// ═══════════ LOGS ═══════════
function rLogs(b){
var h='<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;"><span style="color:#888;font-size:9px;">'+logs.length+' events</span><button class="ab r" style="margin-left:auto;" onclick="logs=[];saveL();swT(\'logs\');"><i class="fas fa-trash"></i> CLEAR</button><button class="ab c" onclick="expLCSV()"><i class="fas fa-file-csv"></i> CSV</button></div>';
if(!logs.length){h+='<div class="sc"><span style="color:#888;">No logs</span></div>';}
else{logs.slice(0,50).forEach(function(l){var ic=l.type==='login'?'fa-sign-in-alt':l.type==='edit'?'fa-pen':'fa-trash';var cl=l.type==='login'?'#00ff41':l.type==='edit'?'#ffd600':'#ff1a1a';h+='<div class="le"><span class="li" style="color:'+cl+';"><i class="fas '+ic+'"></i></span><span class="lt">'+l.time+'</span><span class="lm">'+l.msg+'</span><span class="lu">'+l.user+'</span></div>';});}
b.innerHTML=h;
}

// ═══════════ SYSTEM ═══════════
function rSystem(b){
b.innerHTML=
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin-bottom:6px;"><i class="fas fa-sliders-h"></i> GENERAL</div><div class="sc">'+
'<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:#888;font-size:10px;">Maintenance</span><span style="color:#ff1a1a;">OFF</span></div>'+
'<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:#888;font-size:10px;">Session Timeout</span><span style="color:#fff;">'+cfg.sessionTimeout+' min</span></div>'+
'<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="color:#888;font-size:10px;">File Alert</span><span style="color:'+(cfg.fileAlert?'#00ff41':'#ff1a1a')+';">'+(cfg.fileAlert?'ON':'OFF')+'</span></div>'+
'</div>'+
'<div style="font-size:10px;color:#ff1a1a;letter-spacing:2px;margin:12px 0 6px;"><i class="fas fa-shield-alt"></i> DANGER ZONE</div><div class="sc">'+
'<button class="ab r" onclick="showC(\'DESTROY?\',\'Wipe ALL data?\',function(){L.clear();location.reload();})"><i class="fas fa-skull"></i> SELF DESTRUCT</button>'+
'<button class="ab y" onclick="if(confirm(\'Reset?\'))location.reload()"><i class="fas fa-sync"></i> RESET</button>'+
'<button class="ab c" onclick="exportAll()"><i class="fas fa-download"></i> EXPORT ALL</button>'+
'</div>';
}

// ═══════════ SETTINGS ═══════════
function rSet(b){
b.innerHTML=
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin-bottom:6px;"><i class="fas fa-palette"></i> THEME</div><div class="sc" style="display:flex;gap:8px;">'+
'<button class="ab g" onclick="setTh(\'green\')">GREEN</button><button class="ab c" onclick="setTh(\'cyan\')">CYAN</button><button class="ab r" onclick="setTh(\'red\')">RED</button><button class="ab y" onclick="setTh(\'purple\')">PURPLE</button>'+
'</div>'+
'<div style="font-size:10px;color:#00ff41;letter-spacing:2px;margin:12px 0 6px;"><i class="fas fa-info-circle"></i> ABOUT</div><div class="sc" style="font-size:9px;color:#888;line-height:2;">'+
'<i class="fas fa-code-branch"></i> SYBER VAULT v8.0<br><i class="fas fa-user"></i> MD ALL MAMUN<br><i class="fas fa-at"></i> @allmamun209209<br><i class="fab fa-github"></i> syber-vault/sybervault'+
'</div>';
}
W.setTh=function(t){var th={green:'#00ff41',cyan:'#00e5ff',red:'#ff1a1a',purple:'#bd00ff'};D.documentElement.style.setProperty('--neon',th[t]||'#00ff41');cfg.theme=t;saveC();};

// ═══════════ MODALS ═══════════
function showM(t,body,fn){
var m=D.getElementById('adModal');m.style.display='flex';
m.innerHTML='<div style="background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);width:460px;max-width:92vw;box-shadow:0 0 30px rgba(0,255,65,0.1);" onclick="event.stopPropagation()"><div style="display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #1a1a1a;color:#00ff41;font-size:11px;letter-spacing:2px;font-weight:bold;">'+t+' <button onclick="closeM()" style="background:none;border:none;color:#888;cursor:pointer;font-size:16px;">&times;</button></div><div style="padding:14px;">'+body+'</div><div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #1a1a1a;"><button class="ab" onclick="closeM()">CANCEL</button><button class="ab g" id="mSave">SAVE</button></div></div>';
D.getElementById('mSave').onclick=function(){if(fn)fn();};
m.addEventListener('click',function(e){if(e.target===this)closeM();});
}
function showC(t,msg,fn){
var m=D.getElementById('adModal');m.style.display='flex';
m.innerHTML='<div style="background:#0a0a0a;border:1px solid #ff1a1a;width:400px;max-width:90vw;text-align:center;box-shadow:0 0 30px rgba(255,0,0,0.2);" onclick="event.stopPropagation()"><div style="padding:16px;color:#ff1a1a;font-size:12px;letter-spacing:2px;font-weight:bold;">'+t+'</div><div style="padding:0 16px 16px;color:#888;font-size:10px;">'+msg+'</div><div style="display:flex;gap:8px;justify-content:center;padding:12px 16px;border-top:1px solid #1a1a1a;"><button class="ab" onclick="closeM()">CANCEL</button><button class="ab r" id="cOk">CONFIRM</button></div></div>';
D.getElementById('cOk').onclick=function(){closeM();if(fn)fn();};
m.addEventListener('click',function(e){if(e.target===this)closeM();});
}
W.closeM=function(){var m=D.getElementById('adModal');m.style.display='none';m.innerHTML='';};

// ═══════════ EXPORT ═══════════
W.exportAll=function(){var d={users:users,logs:logs,bots:bots,blocked:blocked,banned:banned,cfg:cfg};var b=new Blob([JSON.stringify(d)],{type:'application/json'});var a=D.createElement('a');a.href=URL.createObjectURL(b);a.download='sybervault-admin-'+Date.now()+'.json';a.click();};
W.expCSV=function(){var c='Username,Email,Role\n';users.forEach(function(u){c+=u.username+','+(u.email||'')+','+u.role+'\n';});var b=new Blob([c],{type:'text/csv'});var a=D.createElement('a');a.href=URL.createObjectURL(b);a.download='users.csv';a.click();};
W.expLCSV=function(){var c='Time,Type,Message,User\n';logs.forEach(function(l){c+=(l.time||'')+','+(l.type||'')+','+(l.msg||'')+','+(l.user||'')+'\n';});var b=new Blob([c],{type:'text/csv'});var a=D.createElement('a');a.href=URL.createObjectURL(b);a.download='logs.csv';a.click();};
W.importAll=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(confirm('Overwrite all data?')){if(d.users){users=d.users;saveU();}if(d.logs){logs=d.logs;saveL();}if(d.bots){bots=d.bots;saveBt();}if(d.blocked){blocked=d.blocked;saveBk();}if(d.banned){banned=d.banned;saveBn();}if(d.cfg){cfg=d.cfg;saveC();}location.reload();}}catch(ex){alert('Invalid file!');}};r.readAsText(f);e.target.value='';};

})();
