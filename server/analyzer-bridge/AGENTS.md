# HIMS Analyzer Bridge - Agent & Developer Guide

## Module Overview
The `analyzer-bridge` is a specialized Node.js daemon and standalone Windows application (`HIMS-Analyzer-Bridge.exe`) designed to interface hardware laboratory analyzers (Mindray, Sysmex, Roche Cobas, Beckman Coulter, etc.) with the HIMS Laravel Backend API.

---

## Tech Stack & Dependencies
- **Runtime:** Node.js 18+, Standalone Windows Binary (`caxa`)
- **Hardware Drivers:** `serialport` v12 (RS-232 COM), Node `net` (TCP/IP Sockets)
- **HTTP Client:** `axios` v1.7
- **Web GUI Server:** Embedded Node `http` server on port `5101`
- **Configuration:** `dotenv` with smart `process.execPath` resolution

---

## Architecture & Code Structure

```
server/analyzer-bridge/
├── bridge.js                  # Main daemon, TCP/Serial listeners, Web GUI server (port 5101)
├── astmParser.js              # ASTM E1381/E1394 parser & Mindray BC-3000 Plus "AAA" parser
├── hl7Parser.js               # HL7 v2.x parser (OBR / OBX records)
├── HIMS-Analyzer-Bridge.exe   # Standalone 39MB Windows Executable application
├── install-service.bat        # PM2 24/7 Windows Service setup script
├── start-service.bat          # 1-Click service start script
├── stop-service.bat           # 1-Click service stop script
├── open-gui.bat               # 1-Click shortcut to open Web GUI (http://localhost:5101)
└── build-exe.bat              # 1-Click caxa build script for HIMS-Analyzer-Bridge.exe
```

---

## Smart Environment (.env) Resolution Rule
To ensure `HIMS-Analyzer-Bridge.exe` can be placed in **any folder** on a client PC without path restrictions:
```javascript
const path = require("path");
const fs = require("fs");

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
```

---

## Protocol & Parsing Rules

### 1. ASTM E1381 / E1394 Handshaking
- **ENQ (`0x05`)**: When received, reply `ACK` (`0x06`) immediately.
- **Data Frames**: Reply `ACK` (`0x06`) after each frame.
- **EOT (`0x04`)**: Triggers session parsing & posts structured results to `/api/lab-analyzer-data`.

### 2. Mindray BC-3000 Plus Protocol ("AAA" Delimiter)
- **Serial RS-232 Settings:** `19200` baud rate, `7` data bits, `1` stop bit, `None` parity (`7N1`).
- **Delimiter:** Payload string starts with `"AAA"`.
- **Parsing Trigger:** Triggers immediately when `fullText.includes("AAA") && fullText.length >= 100`.
- **Sample/Case No:** Extracted from `data.substring(8, 18).trim()`. Defaults to `'UNKNOWN'` if empty.

### 3. Decimal Scaling Rules (Mindray BC-3000 Plus)
```javascript
function formatOneDecimal(valStr) {
  if (!valStr || valStr.trim() === "") return "0.0";
  const num = parseFloat(valStr);
  if (isNaN(num)) return valStr.trim();
  return (num / 10).toFixed(1);
}
```
- **1 Decimal Place (`/ 10`)**: `WBC`, `LYM%`, `MID%`, `GRAN%`, `HGB`, `MCHC`, `MCV`, `MCH`, `RDW-CV`, `HCT`, `MPV`, `PDW`, `RDW-SD`.
- **2 Decimal Places**: `RBC` (e.g., `430` $\rightarrow$ `4.30`).
- **Leading Decimal**: `PCT` (e.g., `204` $\rightarrow$ `.204`).
- **Integers**: `LYM#`, `MID#`, `GRAN#`, `PLT`.

---

## Database Integration (`db_hims`)

### `lab_analyzer_data` Table Schema
- `id` (UUID string)
- `analyzerId` (Foreign UUID to `lab_analyzers.id`)
- `caseNo` (Case / Sample Number, e.g. `0726-001` or `UNKNOWN`)
- `tdate` (Datetime string `YYYY-MM-DD HH:mm:ss`)
- `paramName` (Test parameter name, e.g. `WBC`, `RBC`, `HGB`, `PLT`)
- `result` (Measured test value, e.g. `8.6`, `4.30`, `11.4`)
- `unit` (Unit string, e.g. `10^3/uL`, `g/dL`)
- `flag` (Abnormality flag, e.g. `N`, `H`, `L`)
- `isSynced` (Boolean, `0` = pending, `1` = applied to patient lab report)

---

## API Endpoints

### Laravel Backend API (`HIMS_API_URL`)
- `GET /api/lab-analyzers` (Public: Fetches active machine configurations)
- `POST /api/lab-analyzer-data` (Public: Stores parsed machine test results)

### Local Web GUI Monitor API (`http://localhost:5101`)
- `GET /` (Renders interactive HTML Dashboard)
- `GET /api/status` (JSON: Active connection health & machine list)
- `GET /api/logs` (JSON: Last 100 log messages & formatted CBC cards)
- `POST /api/pause` (Pauses machine data processing)
- `POST /api/resume` (Resumes machine data processing)

---

## Standalone Executable Build Command
To compile a fresh standalone Windows `.exe` application:
```cmd
npx caxa --input . --exclude node_modules --output HIMS-Analyzer-Bridge.exe -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/bridge.js"
```
Or double-click [`build-exe.bat`](file:///d:/Projects/React%20+%20Laravel%20Projects/hims-next-laravel/server/analyzer-bridge/build-exe.bat).
