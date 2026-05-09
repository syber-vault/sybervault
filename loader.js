// ═══════════════════════════════════════
// SYBER VAULT v8.0 | LOADER + MATRIX
// ═══════════════════════════════════════

(function() {
  var isLowDevice = window.innerWidth < 768 || (navigator.hardwareConcurrency || 4) < 4;
  
  var style = document.createElement('style');
  style.textContent = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;font-family:'Courier New',monospace;overflow:hidden}
    
    #matrixCanvas{position:fixed;top:0;left:0;z-index:0;opacity:${isLowDevice?'0.15':'0.4'};pointer-events:none}
    
    .loader-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10;flex-direction:column;transition:opacity 0.6s}
    
    .loader-icon{font-size:55px;color:#00ff41;animation:pulse 1.5s infinite}
    .loader-title{font-size:20px;color:#00ff41;letter-spacing:6px;margin-top:15px;font-weight:bold}
    .loader-bar{width:260px;height:3px;border:1px solid rgba(0,255,65,0.3);margin-top:20px;overflow:hidden}
    .loader-fill{height:100%;background:#00ff41;width:0;animation:loadBar 2.5s ease forwards;box-shadow:0 0 8px rgba(0,255,65,0.6)}
    .loader-status{color:#555;font-size:9px;margin-top:15px;letter-spacing:2px}
    .loader-dots{animation:blink 1s step-end infinite}
    
    @keyframes pulse{0%,100%{opacity:1;text-shadow:0 0 20px rgba(0,255,65,0.7)}50%{opacity:0.4;text-shadow:0 0 5px rgba(0,255,65,0.2)}}
    @keyframes loadBar{0%{width:0}100%{width:100%}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  `;
  document.head.appendChild(style);

  document.getElementById('app').innerHTML = `
    <canvas id="matrixCanvas"></canvas>
    <div class="loader-overlay" id="loaderOverlay">
      <div class="loader-icon"><i class="fas fa-skull"></i></div>
      <div class="loader-title">SYBER_VAULT</div>
      <div class="loader-bar"><div class="loader-fill"></div></div>
      <div class="loader-status" id="loaderStatus">INITIALIZING<span class="loader-dots">...</span></div>
    </div>
  `;

  // Matrix Rain
  var canvas = document.getElementById('matrixCanvas');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01';
  var fontSize = isLowDevice ? 12 : 15;
  var columns = Math.floor(canvas.width / fontSize);
  var drops = [];
  
  for (var i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * 25);
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold ' + fontSize + 'px monospace';
    
    for (var i = 0; i < drops.length; i++) {
      var char = chars[Math.floor(Math.random() * chars.length)];
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      
      ctx.fillStyle = '#0f0';
      ctx.fillText(char, x, y);
      
      if (y > fontSize) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);
      }
      
      if (y > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i]++;
    }
    
    if (!isLowDevice || Math.random() > 0.3) {
      requestAnimationFrame(drawMatrix);
    } else {
      setTimeout(function() { requestAnimationFrame(drawMatrix); }, 100);
    }
  }
  drawMatrix();

  // Loading steps
  var steps = ['INITIALIZING', 'LOADING MODULES', 'DECRYPTING VAULT', 'SECURING CONNECTION', 'READY'];
  var stepIndex = 0;
  var stepInterval = setInterval(function() {
    stepIndex++;
    var el = document.getElementById('loaderStatus');
    if (stepIndex < steps.length && el) {
      el.innerHTML = steps[stepIndex] + '<span class="loader-dots">...</span>';
    } else {
      clearInterval(stepInterval);
    }
  }, 520);

  // Complete
  window.addEventListener('load', function() {
    setTimeout(function() {
      var loader = document.getElementById('loaderOverlay');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(function() {
          loader.style.display = 'none';
          window.loaderComplete = true;
          if (typeof window.initLogin === 'function') window.initLogin();
        }, 600);
      }
    }, 2600);
  });

  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) drops[i] = Math.floor(Math.random() * 25);
  });
})();
