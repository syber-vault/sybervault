// ═══════════════════════════════════════
// SYBER VAULT v8.0 | TOOLS + AI EDITOR
// ═══════════════════════════════════════

(function() {
  'use strict';

  // SECURE API KEYS
  var API_KEYS = {};
  function loadKeys() {
    try {
      var keys = JSON.parse(localStorage.getItem('sv_api_keys') || '{}');
      API_KEYS = {
        openrouter: keys.openrouter || '',
        groq: keys.groq || '',
        mistral: keys.mistral || '',
        github: keys.github || ''
      };
    } catch(e) {}
  }
  function saveKeys() {
    localStorage.setItem('sv_api_keys', JSON.stringify(API_KEYS));
  }
  loadKeys();

  // MODEL LISTS
  var MODELS = {
    openrouter: [
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash [FAST]' },
      { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Lite [FREE]' },
      { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B [PRO]' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B [POWER]' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B [FAST]' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B [BEST]' },
      { id: 'deepseek/deepseek-r1-distill-qwen-32b', name: 'DeepSeek R1 32B [SMART]' },
      { id: 'nvidia/nemotron-3-super-120b', name: 'Nemotron 120B [HUGE]' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B [FREE]' }
    ],
    groq: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B [BEST]' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B [FAST]' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B [POWER]' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B [FREE]' }
    ],
    mistral: [
      { id: 'codestral-latest', name: 'Codestral [BEST]' },
      { id: 'mistral-large-latest', name: 'Mistral Large [POWER]' },
      { id: 'mistral-small-latest', name: 'Mistral Small [FAST]' }
    ],
    github: [
      { id: 'gpt-4o', name: 'GPT-4o [BEST]' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini [FAST]' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet [SMART]' },
      { id: 'codestral-latest', name: 'Codestral [DEV]' }
    ]
  };

  // GitHub API endpoint
  var GITHUB_API = 'https://models.inference.ai.azure.com/chat/completions';

  // STATE
  var api = 'openrouter', mdl = '', chatH = [], gen = '', mem = 15;
  var TRAIN = {
    system: 'You are a coding assistant. Reply in users language. Return code in ```html``` blocks.',
    rules: 'Complete code. Modern design. Responsive.'
  };

  // ═══════════ RENDER TOOLS GRID ═══════════
  window.renderTools = function(container) {
    container.innerHTML =
      '<div style="font-size:12px;color:#00ff41;letter-spacing:2px;margin-bottom:12px;font-weight:bold;"><i class="fas fa-tools"></i> TOOLS</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">' +
        '<div class="tool-card" onclick="openAICodeEditor()" style="background:#0c0c0c;border:1px solid #1a1a1a;padding:16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#00ff41\'" onmouseout="this.style.borderColor=\'#1a1a1a\'">' +
          '<i class="fas fa-robot" style="font-size:24px;color:#00ff41;display:block;margin-bottom:8px;"></i>' +
          '<div style="color:#fff;font-size:10px;">AI Code Generator</div>' +
          '<div style="color:#888;font-size:8px;margin-top:4px;">Multi-Model AI</div>' +
        '</div>' +
        '<div class="tool-card" style="background:#0c0c0c;border:1px solid #1a1a1a;padding:16px;text-align:center;cursor:pointer;" onmouseover="this.style.borderColor=\'#00ff41\'" onmouseout="this.style.borderColor=\'#1a1a1a\'">' +
          '<i class="fas fa-key" style="font-size:24px;color:#00ff41;display:block;margin-bottom:8px;"></i>' +
          '<div style="color:#fff;font-size:10px;">API Key Manager</div>' +
          '<div style="color:#888;font-size:8px;margin-top:4px;">Manage Keys</div>' +
        '</div>' +
        '<div class="tool-card" style="background:#0c0c0c;border:1px solid #1a1a1a;padding:16px;text-align:center;cursor:pointer;opacity:0.5;">' +
          '<i class="fas fa-fingerprint" style="font-size:24px;color:#888;display:block;margin-bottom:8px;"></i>' +
          '<div style="color:#888;font-size:10px;">Hash Cracker</div>' +
          '<div style="color:#555;font-size:8px;margin-top:4px;">Soon...</div>' +
        '</div>' +
        '<div class="tool-card" style="background:#0c0c0c;border:1px solid #1a1a1a;padding:16px;text-align:center;cursor:pointer;opacity:0.5;">' +
          '<i class="fas fa-globe" style="font-size:24px;color:#888;display:block;margin-bottom:8px;"></i>' +
          '<div style="color:#888;font-size:10px;">DNS Lookup</div>' +
          '<div style="color:#555;font-size:8px;margin-top:4px;">Soon...</div>' +
        '</div>' +
      '</div>' +
      '<div id="aiEditorOverlay" style="display:none;"></div>' +
      '<div id="keyManagerOverlay" style="display:none;"></div>';
  };

  // ═══════════ AI CODE EDITOR ═══════════
  window.openAICodeEditor = function() {
    var ov = document.getElementById('aiEditorOverlay');
    ov.style.display = 'flex';
    ov.style.cssText = 'position:fixed;inset:0;z-index:5000;align-items:center;justify-content:center;';
    ov.innerHTML =
      '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.9);" onclick="closeAIEditor()"></div>' +
      '<div style="position:relative;background:#0a0a0a;border:1px solid rgba(0,255,65,0.3);width:95vw;max-width:900px;height:90vh;display:flex;flex-direction:column;box-shadow:0 0 40px rgba(0,255,65,0.1);" onclick="event.stopPropagation()">' +
        '<div style="display:flex;justify-content:space-between;padding:10px 16px;background:#080808;border-bottom:1px solid #1a1a1a;color:#00ff41;font-size:11px;letter-spacing:2px;font-weight:bold;flex-shrink:0;">' +
          '<span><i class="fas fa-robot"></i> AI CODE GENERATOR</span>' +
          '<button onclick="closeAIEditor()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;">&times;</button>' +
        '</div>' +
        '<div style="display:flex;border-bottom:1px solid #1a1a1a;flex-shrink:0;overflow-x:auto;">' +
          '<button class="aibtn active" onclick="selAI(\'openrouter\',this)"><i class="fas fa-globe"></i> OpenRouter</button>' +
          '<button class="aibtn" onclick="selAI(\'groq\',this)"><i class="fas fa-bolt"></i> Groq</button>' +
          '<button class="aibtn" onclick="selAI(\'mistral\',this)"><i class="fas fa-gem"></i> Mistral</button>' +
          '<button class="aibtn" onclick="selAI(\'github\',this)"><i class="fab fa-github"></i> GitHub</button>' +
          '<select onchange="selModel(this.value)" style="background:#000;border:1px solid #333;color:#0f0;font-family:monospace;font-size:9px;padding:5px;margin-left:auto;">' +
            '<option value="">Auto Model</option>' +
            (MODELS[api] || []).map(function(m) { return '<option value="' + m.id + '">' + m.name + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">' +
          '<div id="aiChatArea" style="flex:1;overflow-y:auto;padding:10px;font-size:10px;line-height:1.8;background:#000;">' +
            '<div style="color:#00ff41;">🤖 AI Ready. Type your request below.</div>' +
          '</div>' +
          '<div style="border-top:1px solid #1a1a1a;padding:8px;">' +
            '<textarea id="aiInput" placeholder="Tell me what code you need..." style="width:100%;padding:8px;background:#000;border:1px solid #333;color:#e0e0e0;font-family:monospace;font-size:10px;resize:none;min-height:50px;outline:none;" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendAI();}"></textarea>' +
            '<button onclick="sendAI()" style="width:100%;margin-top:6px;padding:8px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-family:monospace;font-size:10px;"><i class="fas fa-paper-plane"></i> SEND</button>' +
          '</div>' +
        '</div>' +
        '<div style="border-top:1px solid #1a1a1a;padding:8px;background:#080808;">' +
          '<div id="aiCodeArea" style="max-height:200px;overflow-y:auto;padding:8px;background:#000;font-family:monospace;font-size:10px;color:#c0c0c0;white-space:pre-wrap;margin-bottom:6px;">// Generated code will appear here...</div>' +
          '<div style="display:flex;gap:6px;">' +
            '<button onclick="copyAICode()" style="padding:5px 12px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;"><i class="fas fa-copy"></i> COPY</button>' +
            '<button onclick="downloadAICode()" style="padding:5px 12px;background:transparent;border:1px solid #333;color:#888;cursor:pointer;font-size:9px;"><i class="fas fa-download"></i> DL</button>' +
            '<button onclick="saveToVault()" style="padding:5px 12px;background:transparent;border:1px solid #00ff41;color:#00ff41;cursor:pointer;font-size:9px;"><i class="fas fa-save"></i> SAVE TO VAULT</button>' +
            '<button onclick="previewAI()" style="padding:5px 12px;background:transparent;border:1px solid #00e5ff;color:#00e5ff;cursor:pointer;font-size:9px;"><i class="fas fa-eye"></i> PREVIEW</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    
    // CSS for AI buttons
    if (!document.getElementById('aiStyles')) {
      var s = document.createElement('style'); s.id = 'aiStyles';
      s.textContent = '.aibtn{flex:1;padding:8px 6px;background:transparent;border:none;color:#888;cursor:pointer;font-size:9px;font-family:monospace;border-bottom:2px solid transparent;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:4px}.aibtn.active,.aibtn:hover{color:#00ff41;border-bottom-color:#00ff41}';
      document.head.appendChild(s);
    }
  };

  window.closeAIEditor = function() {
    document.getElementById('aiEditorOverlay').style.display = 'none';
  };

  window.selAI = function(a, btn) {
    api = a; mdl = '';
    document.querySelectorAll('.aibtn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
  };

  window.selModel = function(m) { mdl = m; };

  window.sendAI = function() {
    var input = document.getElementById('aiInput');
    var msg = input.value.trim();
    if (!msg) return;

    var chat = document.getElementById('aiChatArea');
    chat.innerHTML += '<div style="color:#00e5ff;">YOU: ' + escH(msg) + '</div>';
    input.value = '';

    var ld = document.createElement('div');
    ld.innerHTML = '<span style="color:#ffd600;"><i class="fas fa-spinner fa-spin"></i> Generating...</span>';
    chat.appendChild(ld);
    document.getElementById('aiCodeArea').textContent = 'Loading...';

    var prompt = buildPrompt(msg);
    callAI(prompt, function(text) {
      if (ld) ld.remove();
      var result = extractCode(text);
      chat.innerHTML += '<div style="color:#00ff41;">AI: ' + escH(result.text) + '</div>';
      document.getElementById('aiCodeArea').textContent = result.code;
      gen = result.code;
      chat.scrollTop = chat.scrollHeight;
    });
  };

  function buildPrompt(msg) {
    return TRAIN.system + '\n' + TRAIN.rules + '\n\nRequest: ' + msg;
  }

  function callAI(query, cb) {
    var key = API_KEYS[api];
    if (!key) {
      document.getElementById('aiCodeArea').textContent = 'Error: No API key set!\nClick API Key Manager to add keys.';
      return;
    }

    var url, headers, body;
    
    if (api === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, 'HTTP-Referer': 'https://sybervault.app', 'X-Title': 'SyberVault' };
      body = { model: mdl || 'google/gemini-2.0-flash-001', messages: [{ role: 'user', content: query }], max_tokens: 4096 };
    } else if (api === 'groq') {
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key };
      body = { model: mdl || 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: query }], max_tokens: 4096 };
    } else if (api === 'mistral') {
      url = 'https://api.mistral.ai/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key };
      body = { model: mdl || 'codestral-latest', messages: [{ role: 'user', content: query }], max_tokens: 4096 };
    } else if (api === 'github' && key) {
      url = GITHUB_API;
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key };
      body = { model: mdl || 'gpt-4o-mini', messages: [{ role: 'user', content: query }], max_tokens: 4096 };
    }

    fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var c = '';
        if (d.choices && d.choices[0] && d.choices[0].message) c = d.choices[0].message.content;
        cb(c);
      })
      .catch(function(err) {
        document.getElementById('aiCodeArea').textContent = 'Error: ' + err.message;
      });
  }

  function extractCode(text) {
    var code = '', msg = '';
    var match = text.match(/```[\w]*\n?([\s\S]*?)```/);
    if (match) {
      code = match[1].replace(/```/g, '').trim();
      msg = text.replace(/```[\s\S]*?```/g, '').trim();
    } else {
      code = text;
      msg = 'Code ready!';
    }
    if (!msg || msg.length < 3) msg = 'Code generated successfully!';
    return { text: msg, code: code };
  }

  window.copyAICode = function() {
    if (!gen) return;
    navigator.clipboard.writeText(gen);
    alert('Copied!');
  };

  window.downloadAICode = function() {
    if (!gen) return;
    var b = new Blob([gen], { type: 'text/html' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'code.html';
    a.click();
  };

  window.saveToVault = function() {
    if (!gen) return;
    var V = window.VAULT_DATA;
    V.files[V.currentRepo] = V.files[V.currentRepo] || [];
    V.files[V.currentRepo].push({
      id: 'f' + Date.now(),
      name: 'generated-' + Date.now().toString(36) + '.html',
      type: 'html',
      size: gen.length + 'B',
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      parent: V.currentFolder,
      content: gen
    });
    alert('Saved to vault!');
    if (typeof window.refreshVault === 'function') {
      var m = document.getElementById('mainpanel');
      if (m) window.renderVault(m);
    }
  };

  window.previewAI = function() {
    if (!gen) return;
    var w = window.open();
    w.document.write(gen);
    w.document.close();
  };

  function escH(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

})();
