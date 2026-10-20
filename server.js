const http = require('http');
const url = require('url');

const usersDB = [
  { id: 1, email: 'admin@system.com', pass: 'Admin@123', role: 'System Administrator' },
  { id: 2, email: 'user@gmail.com', pass: 'User@456', role: 'Standard Client' }
];

const basketsDB = [
  { id: 101, userId: 1, owner: 'admin@system.com', items: 'MacBook Pro M3 Max, Apple Vision Pro' },
  { id: 102, userId: 2, owner: 'user@gmail.com', items: 'Sách An Toàn Thông Tin, Bàn Phím Cơ Custom' }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 1. API CONTROL
  if (path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // SQL INJECTION
    if (path === '/api/sqli-unsafe') {
      if (query.email && query.email.includes("' OR '1'='1")) {
        return res.end(JSON.stringify({
          status: 'VULNERABLE',
          type: 'SQL Injection Attack Success',
          message: '☠️ BYPASS SUCCESSFUL! System root access granted to Administrator.',
          payload: usersDB[0].email
        }));
      }
      return res.end(JSON.stringify({ status: 'FAILED', message: 'Authentication failed.' }));
    }
    if (path === '/api/sqli-safe') {
      const user = usersDB.find(u => u.email === query.email && u.pass === query.pass);
      if (user) return res.end(JSON.stringify({ status: 'SUCCESS', message: 'Valid login.' }));
      return res.end(JSON.stringify({
        status: 'SECURE',
        type: 'SQLi Defended',
        message: '🛡️ ATTACK BLOCKED! Query parameters sanitized successfully.'
      }));
    }

    // REFLECTED XSS
    if (path === '/api/xss-unsafe') {
      return res.end(JSON.stringify({
        status: 'VULNERABLE',
        type: 'Cross-Site Scripting (XSS)',
        message: '☠️ MALICIOUS SCRIPT EXECUTED! DOM environment compromised.',
        payload: query.name || ''
      }));
    }
    if (path === '/api/xss-safe') {
      const safeName = (query.name || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return res.end(JSON.stringify({
        status: 'SECURE',
        type: 'XSS HTML Sanitized',
        message: '🛡️ SCRIPT NEUTRALIZED! Output string escaped safely.',
        payload: safeName
      }));
    }

    // IDOR ATTACK
    if (path === '/api/idor-unsafe') {
      const basket = basketsDB.find(b => b.id == query.id);
      if (basket) {
        return res.end(JSON.stringify({
          status: 'VULNERABLE',
          type: 'Insecure Direct Object Reference (IDOR)',
          message: '☠️ UNAUTHORIZED DATA EXFILTRATED! Target Basket #' + basket.id + ' (' + basket.owner + ')',
          payload: basket.items
        }));
      }
    }
    if (path === '/api/idor-safe') {
      const currentUserId = 2;
      const basket = basketsDB.find(b => b.id == query.id);
      if (basket && basket.userId !== currentUserId) {
        res.statusCode = 403;
        return res.end(JSON.stringify({
          status: 'SECURE',
          type: 'Authorization Access Control',
          message: '🛡️ [ACCESS DENIED 403] Insufficient clearance level.'
        }));
      }
    }
  }

  // 2. CLIENT SCRIPT
  if (path === '/app.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.end(`
      var endpoints = {
        'sqli-unsafe': '/api/sqli-unsafe?email=' + encodeURIComponent("' OR '1'='1") + '&pass=123',
        'sqli-safe': '/api/sqli-safe?email=' + encodeURIComponent("' OR '1'='1") + '&pass=123',
        'xss-unsafe': '/api/xss-unsafe?name=' + encodeURIComponent("<script>alert('XSS_Hacked')</script>"),
        'xss-safe': '/api/xss-safe?name=' + encodeURIComponent("<script>alert('XSS_Hacked')</script>"),
        'idor-unsafe': '/api/idor-unsafe?id=101',
        'idor-safe': '/api/idor-safe?id=101'
      };

      var attackCount = 0;
      var defenseCount = 0;

      function triggerTest(type) {
        var url = endpoints[type];
        if (url) runTest(url);
      }

      function clearConsole() {
        document.getElementById('console-output').innerHTML = '> Terminal logs flushed. Awaiting exploits...';
      }

      function updateStats(isVulnerable) {
        if (isVulnerable) attackCount++;
        else defenseCount++;
        
        document.getElementById('stat-attack').innerText = attackCount;
        document.getElementById('stat-defense').innerText = defenseCount;
        
        var total = attackCount + defenseCount;
        var score = total === 0 ? 100 : Math.round((defenseCount / total) * 100);
        document.getElementById('stat-score').innerText = score + '%';
      }

      function runTest(endpoint) {
        var consoleBox = document.getElementById('console-output');
        var timeStatus = document.getElementById('time-status');
        timeStatus.innerText = 'INJECTING PAYLOAD...';
        
        fetch(endpoint)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var isVulnerable = data.status === 'VULNERABLE';
            updateStats(isVulnerable);

            var logClass = isVulnerable ? 'log-vulnerable' : 'log-secure';
            var icon = isVulnerable ? '[SYSTEM_EXPLOITED]' : '[DEFENSE_ENGAGED]';
            var payloadInfo = data.payload ? '<div><b>>> RAW PAYLOAD:</b> ' + data.payload + '</div>' : '';
            
            var logHtml = 
              '<div class="log-item ' + logClass + '">' +
                '<div><b>' + icon + ' ' + (data.type || 'EXPLOIT LOG') + '</b></div>' +
                '<div><b>>> TARGET ENDPOINT:</b> ' + endpoint + '</div>' +
                '<div><b>>> STATUS:</b> ' + data.message + '</div>' +
                payloadInfo +
              '</div>';
            
            if (consoleBox.innerHTML.indexOf('Awaiting') !== -1 || consoleBox.innerHTML.indexOf('flushed') !== -1) {
              consoleBox.innerHTML = logHtml;
            } else {
              consoleBox.innerHTML = logHtml + consoleBox.innerHTML;
            }

            timeStatus.innerText = 'TIMESTAMP: ' + new Date().toLocaleTimeString();

            if (data.type === 'Cross-Site Scripting (XSS)' && isVulnerable) {
              setTimeout(function() { alert('⚠️ [XSS ALERT] Arbitrary Code Executed in Target Session!'); }, 200);
            }
          })
          .catch(function(err) {
            consoleBox.innerHTML = '<div class="log-item log-vulnerable">❌ CONNECTION TERMINATED!</div>' + consoleBox.innerHTML;
          });
      }
    `);
  }

  // 3. MATRIX / HACKER UI
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>DARKNET SECURITY COMMAND CENTER</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        
        :root {
          --bg: #030712;
          --panel: #0b1329;
          --neon-green: #00ff66;
          --neon-red: #ff0055;
          --neon-blue: #00f0ff;
          --text: #00ff66;
        }

        body {
          font-family: 'Share Tech Mono', monospace;
          background-color: var(--bg);
          color: var(--text);
          margin: 0;
          padding: 20px;
          background-image: radial-gradient(rgba(0, 255, 102, 0.05) 1px, transparent 0);
          background-size: 24px 24px;
        }

        .container { max-width: 1200px; margin: 0 auto; }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--neon-green);
          padding-bottom: 15px;
          margin-bottom: 25px;
          box-shadow: 0 4px 15px rgba(0, 255, 102, 0.2);
        }

        h1 {
          margin: 0;
          color: var(--neon-green);
          font-size: 26px;
          text-shadow: 0 0 10px var(--neon-green);
          letter-spacing: 2px;
        }

        .badge {
          background: rgba(0, 255, 102, 0.1);
          padding: 6px 14px;
          border: 1px solid var(--neon-green);
          color: var(--neon-green);
          font-size: 13px;
          box-shadow: 0 0 8px rgba(0, 255, 102, 0.3);
        }

        /* METRICS BAR */
        .metrics-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
        .metric-box {
          background: var(--panel);
          border: 1px solid rgba(0, 255, 102, 0.3);
          padding: 15px;
          text-align: center;
          position: relative;
        }
        .metric-title { font-size: 12px; color: #64748b; letter-spacing: 1px; }
        .metric-value { font-size: 28px; font-weight: bold; margin-top: 5px; text-shadow: 0 0 10px currentColor; }

        /* CARDS */
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 25px; }
        .card {
          background: var(--panel);
          border: 1px solid #1e293b;
          border-left: 4px solid var(--neon-blue);
          border-radius: 4px;
          padding: 20px;
          transition: all 0.3s;
        }
        .card:hover {
          border-color: var(--neon-blue);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
        }
        .card h3 { margin-top: 0; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 10px; }
        .card p { font-size: 13px; color: #94a3b8; line-height: 1.5; min-height: 40px; }

        /* BUTTONS */
        .btn-group { display: flex; gap: 10px; margin-top: 15px; }
        .btn {
          flex: 1;
          padding: 12px;
          border: none;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: 0.2s;
        }
        .btn-unsafe {
          background: rgba(255, 0, 85, 0.1);
          color: var(--neon-red);
          border: 1px solid var(--neon-red);
        }
        .btn-unsafe:hover {
          background: var(--neon-red);
          color: #000;
          box-shadow: 0 0 15px var(--neon-red);
        }
        .btn-safe {
          background: rgba(0, 255, 102, 0.1);
          color: var(--neon-green);
          border: 1px solid var(--neon-green);
        }
        .btn-safe:hover {
          background: var(--neon-green);
          color: #000;
          box-shadow: 0 0 15px var(--neon-green);
        }

        /* TERMINAL */
        .console-wrapper {
          background: #000;
          border: 1px solid var(--neon-green);
          border-radius: 4px;
          padding: 15px;
          box-shadow: 0 0 20px rgba(0, 255, 102, 0.15);
        }
        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed var(--neon-green);
          padding-bottom: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--neon-green);
        }
        #console-output {
          min-height: 160px;
          max-height: 250px;
          overflow-y: auto;
          color: var(--neon-green);
          font-size: 14px;
          line-height: 1.6;
        }
        .log-item {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 2px;
          background: rgba(0, 0, 0, 0.8);
          border-left: 3px solid #334155;
        }
        .log-vulnerable {
          border-color: var(--neon-red);
          color: #ff4d88;
          box-shadow: inset 0 0 10px rgba(255, 0, 85, 0.1);
        }
        .log-secure {
          border-color: var(--neon-green);
          color: #66ff99;
          box-shadow: inset 0 0 10px rgba(0, 255, 102, 0.1);
        }
        .btn-clear {
          background: transparent;
          color: var(--neon-green);
          border: 1px solid var(--neon-green);
          padding: 3px 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
        }
        .btn-clear:hover { background: var(--neon-green); color: #000; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1><i class="fa-solid fa-terminal"></i> DARKNET SECURITY COMMAND CENTER</h1>
          <div class="badge"><i class="fa-solid fa-network-wired"></i> NODE.JS ENGINE ONLINE</div>
        </header>

        <!-- METRICS -->
        <div class="metrics-bar">
          <div class="metric-box">
            <div class="metric-title">SYSTEM EXPLOITS</div>
            <div class="metric-value" id="stat-attack" style="color:var(--neon-red);">0</div>
          </div>
          <div class="metric-box">
            <div class="metric-title">DEFENSE SHIELDS</div>
            <div class="metric-value" id="stat-defense" style="color:var(--neon-green);">0</div>
          </div>
          <div class="metric-box">
            <div class="metric-title">SECURITY RATING</div>
            <div class="metric-value" id="stat-score" style="color:var(--neon-blue);">100%</div>
          </div>
        </div>

        <div class="grid">
          <!-- SQLi -->
          <div class="card">
            <h3><i class="fa-solid fa-database" style="color: var(--neon-blue);"></i> 1. SQL Injection</h3>
            <p>Bypass authentication logic via malicious SQL query string concatenation.</p>
            <div class="btn-group">
              <button class="btn btn-unsafe" onclick="triggerTest('sqli-unsafe')"><i class="fa-solid fa-skull"></i> EXPLOIT</button>
              <button class="btn btn-safe" onclick="triggerTest('sqli-safe')"><i class="fa-solid fa-shield-halved"></i> DEFEND</button>
            </div>
          </div>

          <!-- XSS -->
          <div class="card">
            <h3><i class="fa-solid fa-code" style="color: var(--neon-blue);"></i> 2. Reflected XSS</h3>
            <p>Inject unescaped JavaScript code into victim browser DOM execution space.</p>
            <div class="btn-group">
              <button class="btn btn-unsafe" onclick="triggerTest('xss-unsafe')"><i class="fa-solid fa-skull"></i> EXPLOIT</button>
              <button class="btn btn-safe" onclick="triggerTest('xss-safe')"><i class="fa-solid fa-shield-halved"></i> DEFEND</button>
            </div>
          </div>

          <!-- IDOR -->
          <div class="card">
            <h3><i class="fa-solid fa-user-lock" style="color: var(--neon-blue);"></i> 3. IDOR Attack</h3>
            <p>Access unauthorized target resources by manipulating direct object references.</p>
            <div class="btn-group">
              <button class="btn btn-unsafe" onclick="triggerTest('idor-unsafe')"><i class="fa-solid fa-skull"></i> EXPLOIT</button>
              <button class="btn btn-safe" onclick="triggerTest('idor-safe')"><i class="fa-solid fa-shield-halved"></i> DEFEND</button>
            </div>
          </div>
        </div>

        <!-- CONSOLE TERMINAL -->
        <div class="console-wrapper">
          <div class="console-header">
            <span><i class="fa-solid fa-terminal"></i> LIVE AUDIT TERMINAL [REAL-TIME]</span>
            <div>
              <button class="btn-clear" onclick="clearConsole()">FLUSH LOGS</button>
              <span id="time-status" style="margin-left: 10px;">READY</span>
            </div>
          </div>
          <div id="console-output">> Terminal initialized. Awaiting user exploit commands...</div>
        </div>
      </div>

      <script src="/app.js"></script>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log('[Server Ready] Running at http://localhost:3000');
});