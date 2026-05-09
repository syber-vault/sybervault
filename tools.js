(function(){
'use strict';
var W=window,D=document,L=localStorage;

// API keys localStorage-e, code-e NEI
var API={};
try{API=JSON.parse(L.getItem('sv_apikeys')||'{}');}catch(e){API={};}
function saveKeys(){L.setItem('sv_apikeys',JSON.stringify(API));}

var gen='',api='openrouter',mdl='',mode='generate',chatH=[],codeH=[],mem=20;
var TRAIN={system:"You are SyberVault AI Developer. Reply in user's language. Put ALL code in ONE ```html block. Remember conversation history.",rules:"Complete code in ONE ```html block. Responsive. Modern. Include HTML+CSS+JS together."};

var MODELS={
openrouter:[
{id:'google/gemini-2.0-flash-001',name:'Gemini 2.0 Flash [FAST]'},
{id:'google/gemma-4-31b-it',name:'Gemma 4 31B [PRO]'},
{id:'meta-llama/llama-3.3-70b-instruct',name:'Llama 3.3 70B'},
{id:'qwen/qwen-2.5-72b-instruct',name:'Qwen 2.5 72B'},
{id:'deepseek/deepseek-r1-distill-qwen-32b',name:'DeepSeek R1'}
],
groq:[
{id:'llama-3.3-70b-versatile',name:'Llama 3.3 70B'},
{id:'qwen-2.5-32b',name:'Qwen 2.5 32B'}
],
mistral:[
{id:'codestral-latest',name:'Codestral'},
{id:'mistral-large-latest',name:'Mistral Large'}
],
github:[
{id:'gpt-4o',name:'GPT-4o'},
{id:'claude-3.5-sonnet',name:'Claude 3.5 Sonnet'}
]};
var GITHUB_URL='https://models.inference.ai.azure.com/chat/completions';

// RENDER TOOLS PAGE
W.renderTools=function(container){
container.innerHTML=
'<div style="font-size:12px;color:#00ff41;letter-spacing:2px;margin-bottom:16px;font-weight:bold;"><i class="fas fa-tools"></i> TOOLS</div>'+
'<div style="display:grid;grid-template-columns:1fr;gap:8px;max-width:500px;">'+
'<div class="tcard" onclick="openAIEditor()" style="background:#0c0c0c;border:1px solid #1a1a1a;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#00ff41\'" onmouseout="this.style.borderColor=\'#1a1a1a\'">'+
'<i class="fas fa-robot" style="font-size:36px;color:#00ff41;display:block;margin-bottom:10px;"></i>'+
'<div style="color:#fff;font-size:14px;font-weight:bold;">AI Code Editor</div>'+
'<div style="color:#888;font-size:10px;margin-top:6px;">Multi-Model AI: OpenRouter, Groq, Mistral, GitHub</div>'+
'</div></div>'+
'<div id="aiOverlay" style="display:none;"></div>';
};

// OPEN AI EDITOR
W.openAIEditor=function(){
var ov=D.getElementById('aiOverlay');ov.style.display='flex';
ov.style.cssText='position:fixed;inset:0;z-index:5000;align-items:center;justify-content:center;';
ov.innerHTML=
'<div style="position:fixed;inset:0;background:rgba(0,0,0,0.95);" onclick="closeAIEditor()"></div>'+
'<div style="position:relative;background:#080808;border:1px solid rgba(0,255,65,0.3);width:97vw;max-width:1300px;height:95vh;display:flex;flex-direction:column;box-shadow:0 0 50px rgba(0,255,65,0.15);" onclick="event.stopPropagation()">'+

// HEADER
'<div style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:#080808;border-bottom:1px solid #1a1a1a;flex-shrink:0;">'+
'<div style="width:44px;height:44px;display:grid;place-items:center;background:rgba(0,255,65,.05);border:1px solid rgba(0,255,65,.2);color:#00ff41;font-size:22px;"><i class="fas fa-skull"></i></div>'+
'<div><div style="font-size:14px;color:#00ff41;letter-spacing:3px;font-weight:bold;">SYBERVAULT</div><div style="font-size:9px;color:#555;letter-spacing:2px;">// CODE EDITOR PRO</div></div>'+
'<button onclick="toggleTrain()" style="margin-left:auto;padding:8px 14px;background:transparent;border:1px solid #bd00ff;color:#bd00ff;cursor:pointer;font-size:9px;font-family:monospace;"><i class="fas fa-brain"></i> TRAIN</button>'+
'<button onclick="clearAll()" style="padding:8px 14px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-size:9px;font-family:monospace;"><i class="fas fa-eraser"></i> CLEAR</button>'+
'<button onclick="closeAIEditor()" style="background:none;border:none;color:#888;cursor:pointer;font-size:20px;">&times;</button>'+
'</div>'+

// API BAR
'<div style="display:flex;gap:4px;padding:8px 12px;background:#080808;border-bottom:1px solid #1a1a1a;flex-shrink:0;overflow-x:auto;" id="aiApiBar">'+
'<button class="aibtn active" onclick="selAI(\'openrouter\',this)"><i class="fas fa-globe"></i> OpenRouter</button>'+
'<button class="aibtn groq" onclick="selAI(\'groq\',this)"><i class="fas fa-bolt"></i> Groq</button>'+
'<button class="aibtn mistral" onclick="selAI(\'mistral\',this)"><i class="fas fa-gem"></i> Mistral</button>'+
'<button class="aibtn github" onclick="selAI(\'github\',this)"><i class="fab fa-github"></i> GitHub</button>'+
'</div>'+

// TRAINING PANEL
'<div id="trainPanel" style="display:none;background:#080808;border-bottom:1px solid rgba(189,0,255,0.4);padding:14px;flex-shrink:0;">'+
'<div style="font-size:11px;color:#bd00ff;margin-bottom:8px;"><i class="fas fa-brain"></i> AI TRAINING</div>'+
'<label style="font-size:9px;color:#bd00ff;">System Instruction</label>'+
'<textarea id="tSys" rows="3" style="width:100%;background:#000;color:#e0e0e0;border:1px solid #1a1a1a;font-size:11px;padding:10px;resize:vertical;font-family:monospace;min-height:50px;outline:none;">'+TRAIN.system+'</textarea>'+
'<label style="font-size:9px;color:#bd00ff;margin-top:8px;">Code Rules</label>'+
'<textarea id="tRules" rows="2" style="width:100%;background:#000;color:#e0e0e0;border:1px solid #1a1a1a;font-size:11px;padding:10px;resize:vertical;font-family:monospace;min-height:40px;outline:none;">'+TRAIN.rules+'</textarea>'+
'<button onclick="saveTraining()" style="margin-top:8px;padding:8px 14px;background:transparent;border:1px solid #bd00ff;color:#bd00ff;cursor:pointer;font-size:9px;"><i class="fas fa-save"></i> SAVE</button>'+
'</div>'+

// MODE + MODEL
'<div style="display:flex;gap:8px;padding:8px 12px;background:#080808;border-bottom:1px solid #1a1a1a;align-items:center;flex-shrink:0;">'+
'<button class="aibtn active" id="tabGen" onclick="setMode(\'generate\',this)"><i class="fas fa-plus-circle"></i> GENERATE</button>'+
'<button class="aibtn" id="tabMod" onclick="setMode(\'modify\',this)"><i class="fas fa-wrench"></i> MODIFY</button>'+
'<select onchange="selModel(this.value)" style="background:#000;border:1px solid #333;color:#e0e0e0;font-family:monospace;font-size:10px;padding:7px;margin-left:auto;"><option value="">Auto Model</option>'+(MODELS[api]||[]).map(function(m){return'<option value="'+m.id+'">'+m.name+'</option>';}).join('')+'</select>'+
'</div>'+

// MAIN SPLIT
'<div style="flex:1;display:flex;overflow:hidden;">'+

// LEFT: CHAT
'<div style="flex:1;display:flex;flex-direction:column;border-right:1px solid #1a1a1a;min-width:0;">'+
'<div style="padding:10px 14px;background:rgba(0,255,65,0.02);border-bottom:1px solid #1a1a1a;font-size:10px;color:#00ff41;flex-shrink:0;"><i class="fas fa-comment-dots"></i> CHAT</div>'+
'<div id="aiChat" style="flex:1;overflow-y:auto;padding:14px;font-size:11px;line-height:1.8;background:#000;"><div style="color:#00ff41;">Welcome! Tell me what to build.</div></div>'+
'<div id="modSec" style="display:none;padding:8px;border-top:1px solid #1a1a1a;">'+
'<div style="font-size:9px;color:#00ff41;margin-bottom:4px;"><i class="fas fa-file-code"></i> YOUR CODE</div>'+
'<textarea id="existCode" placeholder="Paste code to modify..." style="width:100%;padding:10px;background:#000;border:1px solid #1a1a1a;color:#e0e0e0;font-family:monospace;font-size:11px;min-height:80px;resize:vertical;outline:none;"></textarea>'+
'</div>'+
'<div style="padding:8px;border-top:1px solid #1a1a1a;">'+
'<textarea id="aiInput" placeholder="Tell me what you need..." style="width:100%;padding:10px;background:#000;border:1px solid #333;color:#e0e0e0;font-family:monospace;font-size:11px;min-height:50px;resize:none;outline:none;" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendAI();}"></textarea>'+
'<button onclick="sendAI()" style="width:100%;margin-top:6px;padding:10px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-family:monospace;font-size:11px;letter-spacing:1px;"><i class="fas fa-paper-plane"></i> SEND</button>'+
'</div></div>'+

// RIGHT: CODE
'<div style="flex:1;display:flex;flex-direction:column;min-width:0;">'+
'<div style="padding:10px 14px;background:rgba(0,255,65,0.02);border-bottom:1px solid #1a1a1a;font-size:10px;color:#00ff41;display:flex;justify-content:space-between;flex-shrink:0;"><span><i class="fas fa-code"></i> CODE</span><span id="codeStats" style="font-size:8px;color:#888;">No code</span></div>'+
'<div id="aiCode" style="flex:1;overflow-y:auto;padding:14px;font-size:11px;font-family:monospace;white-space:pre-wrap;color:#c0c0c0;background:#000;">// Generated code...</div>'+
'<div style="display:flex;gap:5px;padding:8px;border-top:1px solid #1a1a1a;flex-wrap:wrap;">'+
'<button onclick="copyCode()" id="copyBtn" disabled style="padding:8px 14px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-size:10px;"><i class="fas fa-copy"></i> COPY</button>'+
'<button onclick="downloadCode()" id="dlBtn" disabled style="padding:8px 14px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-size:10px;"><i class="fas fa-download"></i> DL</button>'+
'<button onclick="livePreview()" id="livePrevBtn" disabled style="padding:8px 14px;background:transparent;border:1px solid #00e5ff;color:#00e5ff;cursor:pointer;font-size:10px;"><i class="fas fa-eye"></i> LIVE</button>'+
'<button onclick="insertCode()" id="insBtn" style="padding:8px 14px;background:transparent;border:1px solid #ffd600;color:#ffd600;cursor:pointer;font-size:10px;"><i class="fas fa-arrow-left"></i> INSERT</button>'+
'<button onclick="saveToVault()" style="padding:8px 14px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-size:10px;margin-left:auto;"><i class="fas fa-save"></i> SAVE TO VAULT</button>'+
'</div></div>'+

'</div>'+

// HISTORY
'<div style="border-top:1px solid #1a1a1a;background:#080808;flex-shrink:0;">'+
'<div style="padding:8px 14px;font-size:10px;color:#00ff41;display:flex;justify-content:space-between;"><span><i class="fas fa-history"></i> HISTORY</span><span onclick="clearHist()" style="cursor:pointer;font-size:8px;color:#888;"><i class="fas fa-trash"></i> CLEAR</span></div>'+
'<div id="histList" style="max-height:90px;overflow-y:auto;padding:5px;"></div>'+
'</div>'+
'</div>';

if(!D.getElementById('aibtnCSS')){
var s=D.createElement('style');s.id='aibtnCSS';
s.textContent='.aibtn{flex:1;padding:8px 8px;background:transparent;border:none;color:#888;cursor:pointer;font-size:10px;font-family:monospace;border-bottom:2px solid transparent;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap}.aibtn.active,.aibtn:hover{color:#00ff41;border-bottom-color:#00ff41}.aibtn.groq.active{color:#ff6b35;border-bottom-color:#ff6b35}.aibtn.mistral.active{color:#ffd700;border-bottom-color:#ffd700}.aibtn.github.active{color:#fff;border-bottom-color:#fff}';
D.head.appendChild(s);
}
};

W.closeAIEditor=function(){D.getElementById('aiOverlay').style.display='none';};
W.selAI=function(a,btn){api=a;mdl='';D.querySelectorAll('#aiApiBar .aibtn').forEach(function(b){b.classList.remove('active');});if(btn)btn.classList.add('active');};
W.selModel=function(m){mdl=m;};
W.setMode=function(m,btn){mode=m;D.getElementById('tabGen').classList.toggle('active',m==='generate');D.getElementById('tabMod').classList.toggle('active',m==='modify');D.getElementById('modSec').style.display=m==='modify'?'block':'none';};
W.toggleTrain=function(){var p=D.getElementById('trainPanel');p.style.display=p.style.display==='block'?'none':'block';};
W.saveTraining=function(){TRAIN.system=D.getElementById('tSys').value.trim();TRAIN.rules=D.getElementById('tRules').value.trim();L.setItem('sv_train_v35',JSON.stringify(TRAIN));alert('Saved!');};

function addChat(role,content){chatH.push({role:role,content:content});if(chatH.length>mem*2)chatH=chatH.slice(-mem*2);var c=D.getElementById('aiChat');c.innerHTML+='<div style="margin-bottom:8px;padding:10px 14px;border:1px solid '+(role==='user'?'rgba(0,229,255,0.1)':'rgba(0,255,65,0.08)')+';background:'+(role==='user'?'rgba(0,229,255,0.04)':'rgba(0,255,65,0.03)')+';"><div style="font-size:9px;font-weight:bold;color:'+(role==='user'?'#00e5ff':'#00ff41')+';margin-bottom:3px;"><i class="fas fa-'+(role==='user'?'user':'robot')+'"></i> '+(role==='user'?'YOU':'AI')+'</div>'+escH(content)+'</div>';c.scrollTop=c.scrollHeight;}

W.sendAI=function(){
var inp=D.getElementById('aiInput'),msg=inp.value.trim();if(!msg)return;
addChat('user',msg);inp.value='';
if(mode==='modify'&&!D.getElementById('existCode').value.trim()){addChat('ai','Please paste your code first!');return;}
var ld=D.createElement('div');ld.innerHTML='<span style="color:#ffd600;"><i class="fas fa-spinner fa-spin"></i> Generating...</span>';D.getElementById('aiChat').appendChild(ld);
D.getElementById('aiCode').textContent='Working...';
var key=API[api];if(!key){D.getElementById('aiCode').textContent='Error: No API key! Use API Key Manager.';if(ld)ld.remove();return;}
callAPI(buildPrompt(msg),function(text){if(ld)ld.remove();var r=extract(text);if(r.text)addChat('ai',r.text);if(r.code&&r.code.length>20){gen=r.code;showCode(r.code);addHist(msg,r.code);}else{var cl=clean(text);if(cl.length>20){gen=cl;showCode(cl);addHist(msg,cl);}}});
};

function buildPrompt(msg){var p='';if(true){p+=TRAIN.system+'\n'+TRAIN.rules+'\n';}p+='\n=== HISTORY ===\n';for(var i=0;i<chatH.length;i++)p+=(chatH[i].role==='user'?'User: ':'AI: ')+chatH[i].content+'\n';if(mode==='modify')p+='\n=== CODE TO MODIFY ===\n```\n'+D.getElementById('existCode').value.trim()+'\n```\n';p+='\n=== REQUEST ===\n'+msg+'\nPut ALL code in ONE ```html block.';return p;}

function callAPI(query,cb){var key=API[api],url,headers,body;
if(api==='openrouter'){url='https://openrouter.ai/api/v1/chat/completions';headers={'Content-Type':'application/json','Authorization':'Bearer '+key,'HTTP-Referer':'https://sybervault.app'};body={model:mdl||'google/gemini-2.0-flash-001',messages:[{role:'user',content:query}],max_tokens:16384};}
else if(api==='groq'){url='https://api.groq.com/openai/v1/chat/completions';headers={'Content-Type':'application/json','Authorization':'Bearer '+key};body={model:mdl||'llama-3.3-70b-versatile',messages:[{role:'user',content:query}],max_tokens:8192};}
else if(api==='mistral'){url='https://api.mistral.ai/v1/chat/completions';headers={'Content-Type':'application/json','Authorization':'Bearer '+key};body={model:mdl||'codestral-latest',messages:[{role:'user',content:query}],max_tokens:8192};}
else if(api==='github'){url=GITHUB_URL;headers={'Content-Type':'application/json','Authorization':'Bearer '+key};body={model:mdl||'gpt-4o-mini',messages:[{role:'user',content:query}],max_tokens:4096};if(mdl==='claude-3.5-sonnet')headers['x-ms-model-mesh-model-name']='claude-3.5-sonnet';}
fetch(url,{method:'POST',headers:headers,body:JSON.stringify(body)}).then(function(r){return r.json();}).then(function(d){var c='';if(d.choices&&d.choices[0]&&d.choices[0].message)c=d.choices[0].message.content;cb(c);}).catch(function(err){D.getElementById('aiCode').textContent='Error: '+err.message;});}

function extract(r){var c='',t='';var m=r.match(/```[\w]*\n?([\s\S]*?)```/);if(m){c=m[1].replace(/```/g,'').trim();t=r.replace(/```[\s\S]*?```/g,'').trim();}else{c=r;t='Code ready!';}return{text:t||'Done!',code:c};}
function clean(c){c=String(c);c=c.replace(/\\n/g,'\n').replace(/\\t/g,'\t');c=c.replace(/```[\w]*\s*\n?/g,'').replace(/```/g,'');return c.trim();}
function showCode(c){D.getElementById('aiCode').textContent=c;D.getElementById('copyBtn').disabled=D.getElementById('dlBtn').disabled=D.getElementById('livePrevBtn').disabled=false;D.getElementById('codeStats').textContent=c.split('\n').length+' lines';}
W.copyCode=function(){if(!gen)return;navigator.clipboard.writeText(gen);alert('Copied!');};
W.downloadCode=function(){if(!gen)return;var b=new Blob([gen],{type:'text/html'});var a=D.createElement('a');a.href=URL.createObjectURL(b);a.download='code.html';a.click();};
W.insertCode=function(){if(!gen)return;D.getElementById('existCode').value=gen;W.setMode('modify',D.getElementById('tabMod'));};
W.livePreview=function(){if(!gen)return;var w=W.open();w.document.write(gen);w.document.close();};
W.saveToVault=function(){if(!gen)return;var V=W.VAULT_DATA;V.files[V.currentRepo]=V.files[V.currentRepo]||[];V.files[V.currentRepo].push({id:'f'+Date.now(),name:'generated-'+Date.now().toString(36)+'.html',type:'html',size:gen.length+'B',date:new Date().toLocaleTimeString(),parent:V.currentFolder,content:gen});alert('Saved!');var m=D.getElementById('mainpanel');if(m&&W.renderVault)W.renderVault(m);};
W.clearAll=function(){chatH=[];gen='';D.getElementById('aiChat').innerHTML='<div style="color:#00ff41;">Cleared.</div>';D.getElementById('aiCode').textContent='// Generated code...';D.getElementById('copyBtn').disabled=D.getElementById('dlBtn').disabled=D.getElementById('livePrevBtn').disabled=true;D.getElementById('codeStats').textContent='No code';};

function addHist(p,c){codeH.unshift({prompt:p.substring(0,80),code:c,time:new Date().toLocaleTimeString()});if(codeH.length>50)codeH=codeH.slice(0,50);L.setItem('sv_hist_v35',JSON.stringify(codeH));renderHist();}
function renderHist(){var l=D.getElementById('histList');if(!codeH.length){l.innerHTML='<div style="padding:5px;color:#888;text-align:center;">No history</div>';return;}l.innerHTML=codeH.map(function(it,i){return'<div onclick="loadHistItem('+i+')" style="padding:5px 8px;font-size:9px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.02);display:flex;justify-content:space-between;"><span>'+escH(it.prompt)+'</span><span>'+it.time+'</span></div>';}).join('');}
W.loadHistItem=function(i){if(!codeH[i])return;gen=codeH[i].code;showCode(gen);};
W.clearHist=function(){codeH=[];L.setItem('sv_hist_v35','[]');renderHist();};
function escH(s){var d=D.createElement('div');d.textContent=s||'';return d.innerHTML;}

try{codeH=JSON.parse(L.getItem('sv_hist_v35')||'[]');}catch(e){codeH=[];}
try{var td=JSON.parse(L.getItem('sv_train_v35'));if(td){TRAIN.system=td.system||TRAIN.system;TRAIN.rules=td.rules||TRAIN.rules;}}catch(e){}

})();
