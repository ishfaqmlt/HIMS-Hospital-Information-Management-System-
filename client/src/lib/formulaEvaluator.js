/**
 * Safe Formula Evaluator for Lab Test Parameters
 * Computes formulas for laboratory parameters (e.g., DLC Eosinophils, MCV, MCH, MCHC, VLDL, INR, ANC, A/G Ratio, etc.)
 */

// Helper to normalize strings for comparison (lowercase, stripped spaces & special chars)
const normalizeKey = (str) => {
  if (!str) return "";
  return str.toString().toLowerCase().replace(/[^a-z0-9]/g, "");
};

// Safely convert result string/number to numeric float
const parseNum = (val) => {
  if (val === null || val === undefined) return NaN;
  const str = val.toString().trim();
  if (str === "") return NaN;
  const num = parseFloat(str);
  return isNaN(num) ? NaN : num;
};

/**
 * Evaluate automatic parameter calculations across a list of test parameters.
 * @param {Array} parameters - Array of parameter objects with { id, parameterName, pCode, formula, result, decimal, ... }
 * @returns {Array} - Copy of parameters array with updated results for formula-driven parameters
 */
export function evaluateTestParameters(parameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return parameters;
  }

  // Build key-value map of parameter numeric results
  // Keys will include normalized parameterName, pCode, and item index
  const paramMap = {};

  parameters.forEach((param, index) => {
    const val = parseNum(param.result);
    if (!isNaN(val)) {
      if (param.parameterName) {
        paramMap[normalizeKey(param.parameterName)] = val;
      }
      if (param.pCode) {
        paramMap[normalizeKey(param.pCode)] = val;
      }
      if (param.id) {
        paramMap[normalizeKey(param.id)] = val;
      }
      paramMap[`idx_${index}`] = val;
    }
  });

  // Helper to look up numeric value by dynamic keywords
  const getValue = (...keys) => {
    for (const key of keys) {
      const norm = normalizeKey(key);
      if (norm && paramMap[norm] !== undefined && !isNaN(paramMap[norm])) {
        return paramMap[norm];
      }
    }
    return NaN;
  };

  // Process parameters that require calculation
  return parameters.map((param) => {
    const pNameNorm = normalizeKey(param.parameterName);
    const pCodeNorm = normalizeKey(param.pCode);
    const customFormula = param.formula ? param.formula.trim() : "";
    const decimal = typeof param.decimal === "number" ? param.decimal : 2;

    let computedValue = NaN;

    // 1. Custom Formula Evaluation (if explicitly specified in master parameter)
    if (customFormula) {
      computedValue = evaluateCustomFormula(customFormula, paramMap, parameters);
    }

    // 2. Preset Formula Auto-Detection (if no custom formula or custom formula returned NaN)
    if (isNaN(computedValue)) {
      // --- DLC EOSINOPHILS ---
      if (
        pNameNorm.includes("eosinophil") ||
        pCodeNorm === "eos" ||
        pCodeNorm === "eosinophils"
      ) {
        const neut = getValue("neutrophils", "neutrophil", "neut", "polymorphs");
        const lymph = getValue("lymphocytes", "lymphocyte", "lymph");
        const mono = getValue("monocytes", "monocyte", "mono");
        const baso = getValue("basophils", "basophil", "baso") || 0;

        if (!isNaN(neut) && !isNaN(lymph) && !isNaN(mono)) {
          const sum = neut + lymph + mono + baso;
          if (sum <= 100) {
            computedValue = 100 - sum;
          }
        }
      }

      // --- MCV ---
      else if (pNameNorm === "mcv" || pCodeNorm === "mcv") {
        const hct = getValue("hct", "pcv", "hematocrit", "packedcellvolume");
        const rbc = getValue("rbc", "rbccount", "redbloodcells", "totalrbc","RBC Count");
        if (!isNaN(hct) && !isNaN(rbc) && rbc > 0) {
          computedValue = (hct / rbc) * 10;
        }
      }

      // --- MCH ---
      else if (pNameNorm === "mch" || pCodeNorm === "mch") {
        const hb = getValue("hb", "hemoglobin", "haemoglobin","Hemoglobin (Hb)");
        const rbc = getValue("rbc", "rbccount", "redbloodcells", "totalrbc","RBC Count");
        if (!isNaN(hb) && !isNaN(rbc) && rbc > 0) {
          computedValue = (hb / rbc) * 10;
        }
      }

      // --- MCHC ---
      else if (pNameNorm === "mchc" || pCodeNorm === "mchc") {
        const hb = getValue("hb", "hemoglobin", "haemoglobin","Hemoglobin (Hb)");
        const hct = getValue("hct", "pcv", "hematocrit", "packedcellvolume","Hematocrit (HCT)");
        if (!isNaN(hb) && !isNaN(hct) && hct > 0) {
          computedValue = (hb / hct) * 100;
        }
      }

      // --- VLDL ---
      else if (pNameNorm === "vldl" || pNameNorm.includes("vldlcholesterol") || pCodeNorm === "vldl") {
        const tg = getValue("triglycerides", "triglyceride", "tg","Triglycerides");
        if (!isNaN(tg) && tg >= 0) {
          computedValue = tg / 5;
        }
      }

      // --- LDL (Friedewald Equation) ---
      else if (pNameNorm === "ldl" || pNameNorm.includes("ldlcholesterol") || pCodeNorm === "ldl") {
        const tc = getValue("totalcholesterol", "cholesterol", "tc");
        const hdl = getValue("hdl", "hdlcholesterol");
        const tg = getValue("triglycerides", "triglyceride", "tg","Triglycerides");
        if (!isNaN(tc) && !isNaN(hdl) && !isNaN(tg)) {
          computedValue = tc - (hdl + tg / 5);
        }
      }

      // --- INR ---
      else if (pNameNorm === "inr" || pCodeNorm === "inr") {
        const pt = getValue("patientpt", "pt", "prothrombintime");
        const controlPt = getValue("controlpt", "control", "ptcontrol") || 12; // default control ~12s if not specified
        const isi = getValue("isi") || 1.0;
        if (!isNaN(pt) && !isNaN(controlPt) && controlPt > 0) {
          computedValue = Math.pow(pt / controlPt, isi);
        }
      }

      // --- ABSOLUTE NEUTROPHIL COUNT (ANC) ---
      else if (pNameNorm === "anc" || pNameNorm.includes("absoluteneutrophil")) {
        const tlc = getValue("tlc", "wbc", "totalleucocytecount", "wbccount");
        const neut = getValue("neutrophils", "neutrophil", "neut");
        if (!isNaN(tlc) && !isNaN(neut)) {
          computedValue = (tlc * neut) / 100;
        }
      }

      // --- ABSOLUTE LYMPHOCYTE COUNT (ALC) ---
      else if (pNameNorm === "alc" || pNameNorm.includes("absolutelymphocyte")) {
        const tlc = getValue("tlc", "wbc", "totalleucocytecount", "wbccount");
        const lymph = getValue("lymphocytes", "lymphocyte", "lymph");
        if (!isNaN(tlc) && !isNaN(lymph)) {
          computedValue = (tlc * lymph) / 100;
        }
      }

      // --- GLOBULIN ---
      else if (pNameNorm === "globulin" || pCodeNorm === "globulin") {
        const tp = getValue("totalprotein", "tp", "protein");
        const alb = getValue("albumin", "alb");
        if (!isNaN(tp) && !isNaN(alb)) {
          computedValue = tp - alb;
        }
      }

      // --- A/G RATIO ---
      else if (pNameNorm === "agratio" || pNameNorm.includes("agratio") || pCodeNorm === "agratio") {
        const alb = getValue("albumin", "alb");
        const glob = getValue("globulin", "glob");
        if (!isNaN(alb) && !isNaN(glob) && glob > 0) {
          computedValue = alb / glob;
        }
      }

      // --- INDIRECT BILIRUBIN ---
      else if (pNameNorm.includes("indirectbilirubin") || pCodeNorm === "indirectbilirubin") {
        const totalBili = getValue("totalbilirubin", "tbili", "bilirubintotal");
        const directBili = getValue("directbilirubin", "dbili", "bilirubindirect");
        if (!isNaN(totalBili) && !isNaN(directBili)) {
          computedValue = totalBili - directBili;
        }
      }
    }

    // Apply calculated result if a valid number was obtained
    if (!isNaN(computedValue) && isFinite(computedValue)) {
      const formattedResult =
        decimal > 0
          ? computedValue.toFixed(decimal)
          : Math.round(computedValue).toString();

      // Only update if value actually changed
      if (param.result !== formattedResult) {
        return {
          ...param,
          result: formattedResult,
          isCalculated: true,
          print: true, // Auto-check print when computed
        };
      }
    }

    return param;
  });
}

/**
 * Custom Expression Evaluator
 * Evaluates dynamic formulas like:
 * "100 - ({Neutrophils} + {Lymphocytes} + {Monocytes})"
 * "{HB} / {RBC} * 10"
 */
function evaluateCustomFormula(formulaStr, paramMap, parameters) {
  try {
    let expr = formulaStr;

    // Replace parameter place-holders like {Parameter Name} or {idx_0} or {pCode}
    expr = expr.replace(/\{([^}]+)\}/g, (match, key) => {
      const normKey = normalizeKey(key);
      if (paramMap[normKey] !== undefined && !isNaN(paramMap[normKey])) {
        return paramMap[normKey];
      }
      // Check by 1-based index if number e.g. {1}
      const numIdx = parseInt(key, 10);
      if (!isNaN(numIdx) && numIdx > 0 && numIdx <= parameters.length) {
        const paramAtIdx = parameters[numIdx - 1];
        const valAtIdx = parseNum(paramAtIdx?.result);
        if (!isNaN(valAtIdx)) return valAtIdx;
      }
      return "NaN";
    });

    if (expr.includes("NaN")) return NaN;

    // Sanitize string to allow only numbers, basic operators +, -, *, /, %, (, ), .
    if (!/^[0-9\s\+\-\*\/\%\(\)\.]*$/.test(expr)) {
      return NaN;
    }

    // Function constructor for safe math evaluation
    const evalFunc = new Function(`"use strict"; return (${expr});`);
    const res = evalFunc();
    return typeof res === "number" && !isNaN(res) && isFinite(res) ? res : NaN;
  } catch (e) {
    return NaN;
  }
}
