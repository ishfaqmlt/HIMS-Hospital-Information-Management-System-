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

function parseAstmFrame(rawBuffer) {
  const str = rawBuffer.toString("ascii");
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

  return { caseNo: currentCaseNo, results };
}

module.exports = {
  CONTROL_CHARS,
  parseAstmFrame,
};
