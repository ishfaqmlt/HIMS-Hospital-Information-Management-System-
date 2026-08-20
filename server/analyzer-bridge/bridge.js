/**
 * HIMS Laboratory Analyzer Socket & Serial Bridge Daemon
 * Google DeepMind / HIMS Architecture
 *
 * Supports:
 * - TCP / IP Sockets (Net module)
 * - RS-232 Serial COM Ports (serialport module)
 * - ASTM E1381/E1394 & HL7 v2.x Message Protocols
 */

const path = require("path");
const fs = require("fs");

// Smart .env resolution: Always find .env next to HIMS-Analyzer-Bridge.exe regardless of launch directory
const exeDir = path.dirname(process.execPath);
const envInExeDir = path.join(exeDir, ".env");
const envInCwd = path.join(process.cwd(), ".env");

if (fs.existsSync(envInExeDir)) {
  require("dotenv").config({ path: envInExeDir });
} else if (fs.existsSync(envInCwd)) {
  require("dotenv").config({ path: envInCwd });
} else {
  require("dotenv").config();
}

const http = require("http");
const net = require("net");
const axios = require("axios");
const { parseAstmFrame, CONTROL_CHARS } = require("./astmParser");
const { parseHl7Message } = require("./hl7Parser");

// Fallback configuration if .env is missing
const HIMS_API_URL = process.env.HIMS_API_URL || "http://localhost:8000/api";
const HIMS_API_TOKEN = process.env.HIMS_API_TOKEN || "";
const DEFAULT_TCP_PORT = parseInt(process.env.DEFAULT_TCP_PORT || "5100", 10);
const GUI_PORT = parseInt(process.env.GUI_PORT || "5101", 10);

let SerialPort = null;
let ReadlineParser = null;

try {
  const sp = require("serialport");
  SerialPort = sp.SerialPort;
  ReadlineParser = require("@serialport/parser-readline").ReadlineParser;
} catch (e) {
  console.log("⚠️ [WARNING] serialport module not installed. Serial COM features disabled.");
}

const bridgeLogs = [];
const activeConnections = [];
let isConnectionPaused = false;

function addLog(type, message, details = null) {
  const logItem = {
    id: Date.now() + Math.random().toString(36).substring(2, 5),
    time: new Date().toLocaleTimeString(),
    type,
    message,
    details,
  };
  bridgeLogs.unshift(logItem);
  if (bridgeLogs.length > 100) bridgeLogs.pop();
}

console.log("==================================================================");
console.log("🚀 HIMS LABORATORY ANALYZER BRIDGE DAEMON STARTED");
console.log(`🌐 Target HIMS API URL: ${HIMS_API_URL}`);
console.log("==================================================================");

function getGuiHtmlContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HIMS Analyzer Bridge Monitor</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white">📡</div>
        <div>
          <h1 class="text-xl font-bold text-white">HIMS Laboratory Analyzer Monitor</h1>
          <p class="text-xs text-slate-400">Real-time Serial COM & TCP Socket Daemon Interface</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button id="pauseBtn" onclick="togglePause()" class="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow">
          ⏸️ Pause Connection
        </button>
        <button onclick="fetchStatus()" class="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
          🔄 Refresh
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <p class="text-xs font-medium text-slate-400">Connection Status</p>
        <div id="statusBadge" class="mt-2 flex items-center gap-2 font-semibold text-emerald-400">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Listening & Active
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <p class="text-xs font-medium text-slate-400">Target HIMS API</p>
        <p id="himsApiUrl" class="mt-2 text-sm font-mono text-indigo-400 truncate">Loading...</p>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <p class="text-xs font-medium text-slate-400">Active Analyzers</p>
        <p id="activeCount" class="mt-2 text-sm font-semibold text-slate-200">0 Machine(s)</p>
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <h2 class="text-sm font-semibold text-slate-300 mb-3">📟 Active Machine Connections</h2>
      <div id="machinesList" class="space-y-2 text-xs font-mono text-slate-300">
        <p class="text-slate-500 italic">Fetching machine configurations...</p>
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-300">📋 Real-Time Data Stream & CBC Logs</h2>
        <span class="text-xs text-slate-500">Auto-refreshing every 2s</span>
      </div>
      <div id="logsFeed" class="space-y-3 max-h-[500px] overflow-y-auto pr-2 font-mono text-xs">
        <p class="text-slate-500 italic">Waiting for analyzer transmission...</p>
      </div>
    </div>
  </div>

  <script>
    let isPaused = false;

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        isPaused = data.isPaused;

        const badge = document.getElementById('statusBadge');
        const btn = document.getElementById('pauseBtn');
        if (isPaused) {
          badge.className = "mt-2 flex items-center gap-2 font-semibold text-amber-400";
          badge.innerHTML = '<span class="w-3 h-3 rounded-full bg-amber-500"></span> Paused';
          btn.className = "px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow";
          btn.innerHTML = '▶️ Resume Connection';
        } else {
          badge.className = "mt-2 flex items-center gap-2 font-semibold text-emerald-400";
          badge.innerHTML = '<span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span> Listening & Active';
          btn.className = "px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow";
          btn.innerHTML = '⏸️ Pause Connection';
        }

        document.getElementById('himsApiUrl').innerText = data.himsUrl;
        document.getElementById('activeCount').innerText = \`\${data.connections.length} Machine(s)\`;

        const mList = document.getElementById('machinesList');
        if (data.connections.length === 0) {
          mList.innerHTML = '<p class="text-slate-500 italic">No active machines connected.</p>';
        } else {
          mList.innerHTML = data.connections.map(m => \`
            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="font-semibold text-indigo-300">\${m.name}</span>
              <span class="text-slate-400">\${m.communicationType === 'SERIAL' ? \`\${m.comPort} @ \${m.baudRate} baud\` : \`Port :\${m.port}\`} (\${m.protocol})</span>
              <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
            </div>
          \`).join('');
        }

        fetchLogs();
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchLogs() {
      try {
        const res = await fetch('/api/logs');
        const logs = await res.json();
        const feed = document.getElementById('logsFeed');

        if (logs.length === 0) {
          feed.innerHTML = '<p class="text-slate-500 italic">Waiting for analyzer transmission...</p>';
          return;
        }

        feed.innerHTML = logs.map(l => {
          if (l.type === 'CBC' && l.details) {
            return \`
              <div class="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-2">
                <div class="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
                  <span>📋 CBC RESULTS — Case [\${l.details.caseNo}]</span>
                  <span class="text-slate-400 text-[10px]">\${l.time}</span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-slate-200">
                  \${l.details.results.map(r => \`<div><span class="text-slate-400">\${r.paramName}:</span> <span class="font-bold text-emerald-400">\${r.result}</span></div>\`).join('')}
                </div>
              </div>
            \`;
          }
          return \`
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
              <span class="text-slate-500 text-[10px] mt-0.5">\${l.time}</span>
              <span class="text-slate-300 flex-1">\${l.message}</span>
            </div>
          \`;
        }).join('');
      } catch (e) {
        console.error(e);
      }
    }

    async function togglePause() {
      const endpoint = isPaused ? '/api/resume' : '/api/pause';
      await fetch(endpoint, { method: 'POST' });
      fetchStatus();
    }

    fetchStatus();
    setInterval(fetchStatus, 2000);
  </script>
</body>
</html>`;
}

function startGuiServer() {
  const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === "/api/status") {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(JSON.stringify({
        isPaused: isConnectionPaused,
        himsUrl: HIMS_API_URL,
        connections: activeConnections,
        logCount: bridgeLogs.length,
      }));
    }

    if (url === "/api/logs") {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(JSON.stringify(bridgeLogs));
    }

    if (url === "/api/pause" && req.method === "POST") {
      isConnectionPaused = true;
      addLog("INFO", "⏸️ Analyzer Connection PAUSED by User via GUI");
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(JSON.stringify({ message: "Connection Paused" }));
    }

    if (url === "/api/resume" && req.method === "POST") {
      isConnectionPaused = false;
      addLog("INFO", "▶️ Analyzer Connection RESUMED by User via GUI");
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(JSON.stringify({ message: "Connection Resumed" }));
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getGuiHtmlContent());
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`ℹ️ [GUI DASHBOARD] Web GUI is already active at http://localhost:${GUI_PORT}`);
    } else {
      console.error(`⚠️ [GUI ERROR]: ${err.message}`);
    }
  });

  server.listen(GUI_PORT, () => {
    console.log(`💻 [GUI DASHBOARD] Monitor Web GUI available at http://localhost:${GUI_PORT}`);
    try {
      require("child_process").exec(`start http://localhost:${GUI_PORT}`);
    } catch (e) {}
  });
}

startGuiServer();

/**
 * Send parsed machine results to HIMS Backend API
 */
async function postResultsToHims(analyzerInfo, parsedData) {
  if (!parsedData || !parsedData.results || parsedData.results.length === 0) {
    console.log(`ℹ️ [${analyzerInfo.name}] Received packet but contained no valid result records.`);
    return;
  }

  const payloadResults = parsedData.results.map((r) => ({
    analyzerId: analyzerInfo.id || null,
    analyzerReffno: (r.analyzerReffno && r.analyzerReffno.trim()) ? r.analyzerReffno.trim() : ((r.caseNo && r.caseNo.trim()) ? r.caseNo.trim() : (parsedData.analyzerReffno || parsedData.caseNo || "UNKNOWN")),
    caseNo: (r.caseNo && r.caseNo.trim()) ? r.caseNo.trim() : (parsedData.caseNo || "UNKNOWN"),
    tdate: r.tdate || new Date().toISOString().slice(0, 19).replace("T", " "),
    paramName: r.paramName,
    result: r.result,
    unit: r.unit || "",
    flag: r.flag || "N",
    isSynced: false,
  }));

  // Display clean formatted CBC table in console
  console.log("\n==================================================================");
  console.log(`📋 [${analyzerInfo.name}] PARSED CBC RESULTS (ReffNo: ${payloadResults[0]?.analyzerReffno} | Date: ${payloadResults[0]?.tdate})`);
  console.log("------------------------------------------------------------------");
  for (const res of payloadResults) {
    console.log(`  ${res.paramName.padEnd(10)} : ${res.result.padEnd(10)} ${res.unit}`);
  }
  console.log("==================================================================\n");

  addLog("CBC", `Parsed ${payloadResults.length} result(s) for Case [${payloadResults[0]?.caseNo}]`, {
    caseNo: payloadResults[0]?.caseNo,
    results: payloadResults,
  });

  const payload = {
    analyzerId: analyzerInfo.id || null,
    results: payloadResults,
  };

  try {
    const headers = {};
    if (HIMS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${HIMS_API_TOKEN}`;
    }

    const response = await axios.post(`${HIMS_API_URL}/lab-analyzer-data`, payload, { headers });
    console.log(
      `✅ [SUCCESS] [${analyzerInfo.name}] Saved ${payload.results.length} result(s) into database for Case [${payload.results[0]?.caseNo}]. Server Response: ${response.data.message || "OK"}`
    );
  } catch (err) {
    console.error(
      `❌ [ERROR] [${analyzerInfo.name}] Failed to post data to HIMS API: ${err.response?.data?.message || err.message}`
    );
  }
}

const sessionBuffers = new Map();

/**
 * Handle incoming raw machine buffer stream (TCP Socket or Serial Port)
 */
function handleMachineBuffer(analyzerInfo, socketOrPort, dataBuffer) {
  if (isConnectionPaused) {
    console.log(`⏸️ [PAUSED] Connection is paused via Web GUI. Ignoring packet from [${analyzerInfo.name}]`);
    return;
  }

  const machineKey = analyzerInfo.id || analyzerInfo.name;

  // 1. Check ASTM ENQ Handshake (0x05)
  if (dataBuffer.includes(CONTROL_CHARS.ENQ[0])) {
    console.log(`🤝 [HANDSHAKE] [${analyzerInfo.name}] Received ENQ -> Sending ACK.`);
    sessionBuffers.set(machineKey, []);
    socketOrPort.write(CONTROL_CHARS.ACK);
    return;
  }

  // 2. Accumulate incoming chunks
  let currentChunks = sessionBuffers.get(machineKey) || [];
  currentChunks.push(dataBuffer);
  sessionBuffers.set(machineKey, currentChunks);

  const fullBuffer = Buffer.concat(currentChunks);
  const fullText = fullBuffer.toString("ascii");

  // 3. Check for Mindray BC-3000 AAA Packet or EOT (0x04)
  const isEot = dataBuffer.includes(CONTROL_CHARS.EOT[0]);
  const isBc3000Payload = fullText.includes("AAA") && fullText.length >= 100;

  if (isEot || isBc3000Payload) {
    const protocol = (analyzerInfo.protocol || "ASTM").toUpperCase();
    const parsed = protocol === "HL7" ? parseHl7Message(fullBuffer) : parseAstmFrame(fullBuffer);

    if (parsed.results && parsed.results.length > 0) {
      sessionBuffers.delete(machineKey);
      postResultsToHims(analyzerInfo, parsed);
      return;
    }
  }

  // 4. Send ACK (0x06) back for each frame received in ASTM protocol
  const protocol = (analyzerInfo.protocol || "ASTM").toUpperCase();
  if (protocol === "ASTM") {
    socketOrPort.write(CONTROL_CHARS.ACK);
  }
}

/**
 * Start TCP Socket Listener for an Analyzer
 */
function startTcpListener(analyzerInfo) {
  const port = analyzerInfo.port || DEFAULT_TCP_PORT;

  const server = net.createServer((socket) => {
    const clientIp = socket.remoteAddress;
    console.log(`🔌 [TCP CONNECTED] [${analyzerInfo.name}] Machine connected from ${clientIp}`);

    socket.on("data", (data) => {
      handleMachineBuffer(analyzerInfo, socket, data);
    });

    socket.on("end", () => {
      console.log(`🔌 [TCP DISCONNECTED] [${analyzerInfo.name}] Machine connection closed.`);
    });

    socket.on("error", (err) => {
      console.error(`⚠️ [TCP ERROR] [${analyzerInfo.name}]: ${err.message}`);
    });
  });

  server.listen(port, () => {
    activeConnections.push(analyzerInfo);
    addLog("INFO", `📡 TCP Listening [${analyzerInfo.name}] on port :${port} (${analyzerInfo.protocol})`);
    console.log(`📡 [TCP LISTENING] [${analyzerInfo.name}] Server listening on port :${port} (${analyzerInfo.protocol})`);
  });
}

/**
 * Start Serial RS-232 COM Port Listener for an Analyzer
 */
function startSerialListener(analyzerInfo) {
  if (!SerialPort) {
    console.error(`❌ [SERIAL ERROR] Cannot start COM listener for [${analyzerInfo.name}] - serialport module not found.`);
    return;
  }

  const comPort = analyzerInfo.comPort || "COM1";
  const baudRate = parseInt(analyzerInfo.baudRate || 9600, 10);
  const dataBits = parseInt(analyzerInfo.dataBits || 8, 10);
  const stopBits = parseFloat(analyzerInfo.stopBits || 1);
  const parity = (analyzerInfo.parity || "none").toLowerCase();

  try {
    const port = new SerialPort({
      path: comPort,
      baudRate: baudRate,
      dataBits: dataBits,
      stopBits: stopBits,
      parity: parity,
      autoOpen: true,
    });

    activeConnections.push(analyzerInfo);
    addLog("INFO", `📟 Opened ${comPort} @ ${baudRate} baud (${analyzerInfo.name})`);
    console.log(`📟 [SERIAL LISTENING] [${analyzerInfo.name}] Opened ${comPort} @ ${baudRate} baud, ${dataBits}N${stopBits} (${analyzerInfo.protocol})`);

    port.on("data", (data) => {
      handleMachineBuffer(analyzerInfo, port, data);
    });

    port.on("error", (err) => {
      console.error(`⚠️ [SERIAL ERROR] [${analyzerInfo.name}] ${comPort}: ${err.message}`);
    });
  } catch (err) {
    console.error(`❌ [SERIAL FAILED] [${analyzerInfo.name}] Could not open port ${comPort}: ${err.message}`);
  }
}

/**
 * Initialize all analyzers configured in HIMS Database
 */
async function initBridge() {
  try {
    console.log("🔍 Fetching configured analyzers from HIMS API...");
    const headers = {};
    if (HIMS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${HIMS_API_TOKEN}`;
    }

    const res = await axios.get(`${HIMS_API_URL}/lab-analyzers`, { headers });
    const analyzers = res.data || [];

    if (!Array.isArray(analyzers) || analyzers.length === 0) {
      console.log("ℹ️ No active analyzers returned from HIMS API. Starting default TCP listener on port :" + DEFAULT_TCP_PORT);
      startTcpListener({
        id: null,
        name: "Default TCP Analyzer Listener",
        communicationType: "TCP",
        protocol: "ASTM",
        port: DEFAULT_TCP_PORT,
      });
      return;
    }

    console.log(`✅ Loaded ${analyzers.length} analyzer(s) from HIMS API.`);

    for (const machine of analyzers) {
      const isActive = machine.isActive === true || machine.isActive === 1 || machine.isActive === "1";
      if (!isActive) {
        console.log(`⏸️ [SKIPPED] [${machine.name}] is marked INACTIVE.`);
        continue;
      }

      if (machine.communicationType === "SERIAL") {
        startSerialListener(machine);
      } else {
        startTcpListener(machine);
      }
    }
  } catch (err) {
    console.error(`⚠️ Failed to connect to HIMS API (${HIMS_API_URL}): ${err.message}`);
    console.log("ℹ️ Fallback: Starting default TCP listener on port :" + DEFAULT_TCP_PORT);
    startTcpListener({
      id: null,
      name: "Default TCP Analyzer Listener",
      communicationType: "TCP",
      protocol: "ASTM",
      port: DEFAULT_TCP_PORT,
    });
  }
}

initBridge();
