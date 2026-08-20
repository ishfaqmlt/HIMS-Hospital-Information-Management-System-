# HIMS Laboratory Analyzer Socket & Serial Bridge Daemon

Production-grade Node.js bridge service that connects Automated Laboratory Analyzers (Mindray, Sysmex, Roche Cobas, Beckman, etc.) to your **HIMS Laravel API** (`db_hims.lab_analyzer_data`).

---

## 🛠️ Key Features
- **Standalone Windows Executable (`HIMS-Analyzer-Bridge.exe`)**: No Node.js or npm required on client PCs!
- **Built-in Web GUI Monitor (`http://localhost:5101`)**: Live Machine Status, Pause/Resume Controls, Real-time Stream Logs, and Formatted CBC Result Cards.
- **Smart `.env` Resolution**: Automatically finds `.env` sitting right next to `HIMS-Analyzer-Bridge.exe` regardless of launch directory.
- **RS-232 Serial COM Ports**: Opens Windows COM ports (e.g. `COM1`, `COM6`) with full parameter control (`baudRate`, `dataBits`, `stopBits`, `parity`).
- **TCP / IP Network Sockets**: Listens on Ethernet TCP ports (e.g. `:5100`, `:9100`).
- **ASTM E1381 / E1394 & ENQ/ACK Handshaking**: Full frame buffering, acknowledgement framing, and EOT session parsing.
- **Mindray BC-3000 Plus Protocol**: Native support for Mindray fixed-width `"AAA"` string protocol with exact 19 CBC decimal formatting.
- **HL7 v2.x Support**: Parses `OBR` (Case/Sample ID) and `OBX` (Parameter results).
- **Auto-Sync with HIMS**: Syncs active machine configurations from `/api/lab-analyzers` and posts results to `/api/lab-analyzer-data`.

---

## 🚀 Quick Deployment Guide for Client Lab PCs

### Option A: Standalone Executable Deployment (Recommended)
1. Copy **`HIMS-Analyzer-Bridge.exe`** and **`.env`** to any folder on the client PC (e.g. `C:\HIMS-Bridge\`).
2. Edit `.env` to point to your HIMS server IP:
   ```env
   HIMS_API_URL=http://192.168.1.50:8000/api
   ```
3. Double-click **`HIMS-Analyzer-Bridge.exe`**.
   - It will start the background service and automatically open the **Web GUI Dashboard** (`http://localhost:5101`) in Chrome/Edge!

### Option B: 1-Click Batch Scripts Setup
If deploying from source folder:
- **Install 24/7 Service**: Right-click `install-service.bat` $\rightarrow$ *Run as Administrator*.
- **Open Web GUI**: Double-click `open-gui.bat`.
- **Stop Connection**: Double-click `stop-service.bat`.
- **Resume Connection**: Double-click `start-service.bat`.
- **Re-build Standalone `.exe`**: Double-click `build-exe.bat`.

---

## 💻 Web GUI Monitor Dashboard (`http://localhost:5101`)

Double-clicking `open-gui.bat` or navigating to `http://localhost:5101` opens the interactive dashboard:

- **🟢 Live Machine Status Cards**: View COM port settings (`COM6 @ 19200 baud, 7N1`), active TCP sockets, and connection health.
- **⏸️ 1-Click Controls**: Pause or resume machine connection without restarting the service.
- **📋 Real-time CBC Cards**: Displays formatted CBC parameters (`WBC`, `RBC`, `HGB`, `PLT`, etc.) as soon as test packets arrive from the machine.

---

## 📊 Mindray BC-3000 Plus Parameter Formatting

| Parameter | Raw String | Formatted Result | Format Rule |
| :--- | :--- | :--- | :--- |
| **WBC** | `86` | `8.6` | 1 Decimal Place (`/ 10`) |
| **LYM#** | `39` | `39` | Integer |
| **MID#** | `6` | `6` | Integer |
| **GRAN#** | `41` | `41` | Integer |
| **LYM%** | `453` | `45.3` | 1 Decimal Place (`/ 10`) |
| **MID%** | `73` | `7.3` | 1 Decimal Place (`/ 10`) |
| **GRAN%** | `474` | `47.4` | 1 Decimal Place (`/ 10`) |
| **RBC** | `430` | `4.30` | 2 Decimal Places |
| **HGB** | `114` | `11.4` | 1 Decimal Place (`/ 10`) |
| **MCHC** | `312` | `31.2` | 1 Decimal Place (`/ 10`) |
| **MCV** | `849` | `84.9` | 1 Decimal Place (`/ 10`) |
| **MCH** | `265` | `26.5` | 1 Decimal Place (`/ 10`) |
| **RDW-CV** | `142` | `14.2` | 1 Decimal Place (`/ 10`) |
| **HCT** | `365` | `36.5` | 1 Decimal Place (`/ 10`) |
| **PLT** | `249` | `249` | Integer |
| **MPV** | `82` | `8.2` | 1 Decimal Place (`/ 10`) |
| **PDW** | `155` | `15.5` | 1 Decimal Place (`/ 10`) |
| **PCT** | `204` | `.204` | Leading Decimal |
| **RDW-SD** | `444` | `44.4` | 1 Decimal Place (`/ 10`) |

---

## 📂 File Structure

```
server/analyzer-bridge/
├── HIMS-Analyzer-Bridge.exe   # Standalone Windows Executable App
├── bridge.js                  # Main Daemon & Web GUI HTTP Server (port 5101)
├── astmParser.js              # ASTM E1381/E1394 & Mindray BC-3000 Parser
├── hl7Parser.js               # HL7 v2.x Message Parser
├── .env                       # Target HIMS API Configuration
├── .env.example               # Template environment configuration
├── install-service.bat        # 1-Click PM2 Service Installer
├── start-service.bat          # 1-Click Start Connection Script
├── stop-service.bat           # 1-Click Stop Connection Script
├── open-gui.bat               # 1-Click Shortcut to Open Web GUI Monitor
└── build-exe.bat              # 1-Click Standalone EXE Compiler
```
