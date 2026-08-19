# HIMS Laboratory Analyzer Socket & Serial Bridge Daemon

Production-grade Node.js bridge service that connects Automated Laboratory Analyzers (Sysmex, Roche Cobas, Mindray, Beckman, etc.) to your **HIMS Laravel API**.

---

## 🛠️ Features
- **TCP / IP Network Sockets**: Listens on TCP Ethernet ports (e.g. `:5100`, `:9100`).
- **RS-232 Serial COM Ports**: Reads Windows COM ports (e.g. `COM1`, `COM3`, `/dev/ttyUSB0`) via serialport hardware drivers.
- **ASTM E1381 / E1394 Support**: Handles ENQ/ACK handshakes, Header, Order, and Result records.
- **HL7 v2.x Support**: Parses `OBR` (Case ID / Sample Barcode) and `OBX` (Parameter results).
- **Auto-Sync**: Automatically fetches machine configurations directly from HIMS API (`/api/lab-analyzers`).

---

## 🚀 Installation & Running on Laboratory Computer

### Step 1: Copy `analyzer-bridge` Folder
Copy the `server/analyzer-bridge/` folder to the laboratory PC connected to your analyzers.

### Step 2: Install Node.js Dependencies
Open Command Prompt (CMD) inside `analyzer-bridge` folder and run:
```bash
npm install
```

### Step 3: Configure Environment (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to point to your HIMS server IP:
```env
HIMS_API_URL=http://192.168.1.50:8000/api
DEFAULT_TCP_PORT=5100
```

### Step 4: Run Bridge Daemon
```bash
npm start
```

---

## 💻 Optional: Running as a Windows Background Service (Auto-Start on PC Boot)

To ensure the bridge starts automatically whenever the laboratory PC turns on:

1. Install `pm2` globally:
```bash
npm install -g pm2 pm2-windows-service
```
2. Start the daemon with PM2:
```bash
pm2 start bridge.js --name "HIMS-Analyzer-Bridge"
pm2 save
pm2-service-install
```

Now the machine bridge will run silently in the background 24/7!
