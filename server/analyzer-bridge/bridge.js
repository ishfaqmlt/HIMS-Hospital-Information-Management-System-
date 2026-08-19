/**
 * HIMS Laboratory Analyzer Socket & Serial Bridge Daemon
 * Google DeepMind / HIMS Architecture
 *
 * Supports:
 * - TCP / IP Sockets (Net module)
 * - RS-232 Serial COM Ports (serialport module)
 * - ASTM E1381/E1394 & HL7 v2.x Message Protocols
 */

require("dotenv").config();
const net = require("net");
const axios = require("axios");
const { parseAstmFrame, CONTROL_CHARS } = require("./astmParser");
const { parseHl7Message } = require("./hl7Parser");

// Fallback configuration if .env is missing
const HIMS_API_URL = process.env.HIMS_API_URL || "http://localhost:8000/api";
const HIMS_API_TOKEN = process.env.HIMS_API_TOKEN || "";
const DEFAULT_TCP_PORT = parseInt(process.env.DEFAULT_TCP_PORT || "5100", 10);

let SerialPort = null;
let ReadlineParser = null;

try {
  const sp = require("serialport");
  SerialPort = sp.SerialPort;
  ReadlineParser = require("@serialport/parser-readline").ReadlineParser;
} catch (e) {
  console.log("⚠️ [WARNING] serialport module not installed. Serial COM features disabled.");
}

console.log("==================================================================");
console.log("🚀 HIMS LABORATORY ANALYZER BRIDGE DAEMON STARTED");
console.log(`🌐 Target HIMS API URL: ${HIMS_API_URL}`);
console.log("==================================================================");

/**
 * Send parsed machine results to HIMS Backend API
 */
async function postResultsToHims(analyzerInfo, parsedData) {
  if (!parsedData || !parsedData.results || parsedData.results.length === 0) {
    console.log(`ℹ️ [${analyzerInfo.name}] Received packet but contained no valid result records.`);
    return;
  }

  const payload = {
    analyzerId: analyzerInfo.id || null,
    results: parsedData.results.map((r) => ({
      analyzerId: analyzerInfo.id || null,
      caseNo: r.caseNo || parsedData.caseNo || "UNKNOWN",
      tdate: r.tdate || new Date().toISOString().slice(0, 19).replace("T", " "),
      paramName: r.paramName,
      result: r.result,
      unit: r.unit || "",
      flag: r.flag || "N",
      isSynced: false,
    })),
  };

  try {
    const headers = {};
    if (HIMS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${HIMS_API_TOKEN}`;
    }

    const response = await axios.post(`${HIMS_API_URL}/lab-analyzer-data`, payload, { headers });
    console.log(
      `✅ [SUCCESS] [${analyzerInfo.name}] Sent ${payload.results.length} result(s) for Case [${payload.results[0]?.caseNo}]. Response: ${response.data.message || "OK"}`
    );
  } catch (err) {
    console.error(
      `❌ [ERROR] [${analyzerInfo.name}] Failed to post data to HIMS API: ${err.response?.data?.message || err.message}`
    );
  }
}

/**
 * Handle incoming raw machine buffer stream (TCP Socket or Serial Port)
 */
function handleMachineBuffer(analyzerInfo, socketOrPort, dataBuffer) {
  // 1. Check ASTM ENQ Handshake (0x05)
  if (dataBuffer.length === 1 && dataBuffer[0] === CONTROL_CHARS.ENQ[0]) {
    console.log(`🤝 [HANDSHAKE] [${analyzerInfo.name}] Received ENQ -> Sending ACK.`);
    socketOrPort.write(CONTROL_CHARS.ACK);
    return;
  }

  // 2. Determine protocol and parse frame
  const protocol = (analyzerInfo.protocol || "ASTM").toUpperCase();
  let parsed = { caseNo: null, results: [] };

  if (protocol === "HL7") {
    parsed = parseHl7Message(dataBuffer);
  } else {
    parsed = parseAstmFrame(dataBuffer);
  }

  if (parsed.results && parsed.results.length > 0) {
    postResultsToHims(analyzerInfo, parsed);
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
  const baudRate = analyzerInfo.baudRate || 9600;

  try {
    const port = new SerialPort({
      path: comPort,
      baudRate: baudRate,
      autoOpen: true,
    });

    console.log(`📟 [SERIAL LISTENING] [${analyzerInfo.name}] Opened ${comPort} @ ${baudRate} baud (${analyzerInfo.protocol})`);

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
      if (machine.isActive === false) {
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
