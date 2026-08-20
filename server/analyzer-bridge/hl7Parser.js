/**
 * HL7 v2.x Message Parser for Clinical Analyzers
 * (Mindray, Horiba, Siemens, etc.)
 */

function parseHl7Message(rawBuffer) {
  const message = rawBuffer.toString("utf8");
  const segments = message.split(/[\r\n]+/);

  let currentCaseNo = null;
  const results = [];

  for (const seg of segments) {
    if (!seg.trim()) continue;

    const fields = seg.split("|");
    const segType = fields[0]?.toUpperCase();

    if (segType === "OBR") {
      // Observation Request Segment:
      // Field[2] or Field[3]: Placer / Filler Order Number (Case / Barcode No)
      const rawOrderId = fields[2] || fields[3] || "";
      const cleanId = rawOrderId.split("^").filter(Boolean)[0] || rawOrderId;
      if (cleanId) {
        currentCaseNo = cleanId.trim();
      }
    } else if (segType === "OBX") {
      // Observation Result Segment:
      // Field[3]: Observation Identifier (Param Code / Name)
      // Field[5]: Observation Value (Result)
      // Field[6]: Units
      // Field[8]: Abnormal Flags (N, H, L, A)
      const rawParam = fields[3] || "";
      const paramParts = rawParam.split("^").filter(Boolean);
      const paramName = paramParts[1] || paramParts[0] || rawParam;
      
      const resultVal = fields[5] || "";
      const unit = fields[6] || "";
      const flag = fields[8] || "N";

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
  parseHl7Message,
};
