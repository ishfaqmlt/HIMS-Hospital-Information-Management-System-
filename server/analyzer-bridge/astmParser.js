/**
 * ASTM E1381 / E1394 Frame Parser for Hematology & Biochemistry Analyzers
 * (Sysmex, Roche, Mindray, Cobas, Beckman Coulter, etc.)
 */

const CONTROL_CHARS = {
  ENQ: Buffer.from([0x05]),
  ACK: Buffer.from([0x06]),
  NAK: Buffer.from([0x15]),
  EOT: Buffer.from([0x04]),
  STX: 0x02,
  ETX: 0x03,
  ETB: 0x17,
  CR: 0x0d,
  LF: 0x0a,
};

function formatNumeric(str) {
  if (!str) return "0";
  const num = parseFloat(str);
  return isNaN(num) ? str.trim() : num.toString();
}

function formatOneDecimal(valStr) {
  if (!valStr || valStr.trim() === "") return "0.0";
  const num = parseFloat(valStr);
  if (isNaN(num)) return valStr.trim();
  return (num / 10).toFixed(1);
}

/**
 * Legacy Mindray BC-3000 Plus Fixed-Width Protocol Parser (AAA delimiter)
 */
function parseMindrayBc3000(dataString) {
  const testNames = [
    "WBC", "LYM#", "MID#", "GRAN#", "LYM%", "MID%", "GRAN%",
    "RBC", "HGB", "MCHC", "MCV", "MCH", "RDW-CV", "HCT",
    "PLT", "MPV", "PDW", "PCT", "RDW-SD"
  ];

  const results = [];
  let mainCaseNo = null;

  const patients = dataString.split("AAA");
  for (let i = 1; i < patients.length; i++) {
    const data = patients[i];
    if (data.length < 97) continue;

    const sampleno = data.substring(8, 18).trim();
    if (sampleno) mainCaseNo = sampleno;

    let tdate = new Date().toISOString().slice(0, 19).replace("T", " ");
    try {
      const year = data.substring(23, 27);
      const month = data.substring(19, 21);
      const day = data.substring(21, 23);
      const hour = data.substring(27, 29);
      const minute = data.substring(29, 31);
      tdate = `${year}-${month}-${day} ${hour}:${minute}:00`;
    } catch (e) {}

    const rawRbc = data.substring(56, 59);
    const formattedRbc = rawRbc.length === 3 ? `${rawRbc[0]}.${rawRbc.slice(1)}` : rawRbc;

    const rawPct = data.substring(90, 93);
    const formattedPct = `.${rawPct}`;

    const paramValues = [
      formatOneDecimal(data.substring(31, 35)), // WBC (86 -> 8.6)
      formatNumeric(data.substring(35, 39)),    // LYM# (39 -> 39)
      formatNumeric(data.substring(39, 43)),    // MID# (6 -> 6)
      formatNumeric(data.substring(43, 47)),    // GRAN# (41 -> 41)
      formatOneDecimal(data.substring(47, 50)), // LYM% (453 -> 45.3)
      formatOneDecimal(data.substring(50, 53)), // MID% (73 -> 7.3)
      formatOneDecimal(data.substring(53, 56)), // GRAN% (474 -> 47.4)
      formattedRbc,                             // RBC (4.30)
      formatOneDecimal(data.substring(59, 62)), // HGB (114 -> 11.4)
      formatOneDecimal(data.substring(62, 66)), // MCHC (312 -> 31.2)
      formatOneDecimal(data.substring(66, 70)), // MCV (849 -> 84.9)
      formatOneDecimal(data.substring(70, 74)), // MCH (265 -> 26.5)
      formatOneDecimal(data.substring(74, 77)), // RDW-CV (142 -> 14.2)
      formatOneDecimal(data.substring(77, 80)), // HCT (365 -> 36.5)
      formatNumeric(data.substring(80, 84)),    // PLT (249 -> 249)
      formatOneDecimal(data.substring(84, 87)), // MPV (82 -> 8.2)
      formatOneDecimal(data.substring(87, 90)), // PDW (155 -> 15.5)
      formattedPct,                             // PCT (.204)
      formatOneDecimal(data.substring(93, 97)), // RDW-SD (444 -> 44.4)
    ];

    for (let b = 0; b < testNames.length; b++) {
      results.push({
        caseNo: sampleno,
        paramName: testNames[b],
        result: paramValues[b],
        unit: "",
        flag: "N",
        tdate: tdate,
      });
    }
  }

  return { caseNo: mainCaseNo, results };
}

function parseAstmFrame(rawBuffer) {
  const str = rawBuffer.toString("ascii");

  // Check if payload uses Mindray BC-3000 Plus AAA string format
  if (str.includes("AAA")) {
    return parseMindrayBc3000(str);
  }

  const lines = str.split(/[\r\n]+/);
  
  let currentCaseNo = null;
  const results = [];

  for (let line of lines) {
    // Strip STX, ETX, checksum digits, and leading frame numbers
    line = line.replace(/^\x02?\d?/, "").replace(/\x03.*$/, "").trim();
    if (!line) continue;

    const fields = line.split("|");
    const recordType = fields[0]?.toUpperCase();

    if (recordType === "O") {
      // Order Record: Fields[2] or Fields[3] usually contains Case/Sample Barcode ID
      const orderSpecimenId = fields[2] || fields[3] || "";
      // Extract clean specimen ID (e.g., ^^^LAB-26-100^ or LAB-26-100)
      const cleanId = orderSpecimenId.split("^").filter(Boolean)[0] || orderSpecimenId;
      if (cleanId) {
        currentCaseNo = cleanId.trim();
      }
    } else if (recordType === "R") {
      // Result Record:
      // Fields[2]: Parameter Code/Name (e.g., ^^^WBC or ^^^WBC^1)
      // Fields[3]: Result Value (e.g., 6.8)
      // Fields[4]: Units (e.g., 10^3/uL)
      // Fields[6]: Abnormality Flag (e.g., N, H, L, A)
      const rawParam = fields[2] || "";
      const paramName = rawParam.split("^").filter(Boolean)[0] || rawParam;
      const resultVal = fields[3] || "";
      const unit = fields[4] || "";
      const flag = fields[6] || "N";

      if (paramName && resultVal !== "") {
        results.push({
          analyzerReffno: currentCaseNo,
          caseNo: currentCaseNo,
          paramName: paramName.trim(),
          result: resultVal.trim(),
          unit: unit.trim(),
          flag: flag.trim(),
          tdate: new Date().toISOString().slice(0, 19).replace("T", " "),
        });
      }
    }
  }

  return { analyzerReffno: currentCaseNo, caseNo: currentCaseNo, results };
}

module.exports = {
  CONTROL_CHARS,
  parseAstmFrame,
};
