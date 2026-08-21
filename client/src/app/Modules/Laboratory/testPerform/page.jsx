"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  RefreshCw,
  User,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { fetchLabBoundings } from "@/reduxToolKit/slices/labBoundingSlice";
import { fetchLabShortKeys } from "@/reduxToolKit/slices/labShortKeysSlice";
import testPerformService from "@/services/testPerform.service";
import labAnalyzerDataService from "@/services/labAnalyzerData.service";
import { calculateAge, calculateAgeInDays, toLocalISOString } from "@/lib/utils";
import { evaluateTestParameters } from "@/lib/formulaEvaluator";

const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

const TestPerform = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { boundings } = useSelector((state) => state.labBoundings || { boundings: [] });
  const { items: shortKeys } = useSelector((state) => state.labShortKeys || { items: [] });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [dtFrom, setDtFrom] = useState(
    toLocalISOString(new Date(new Date().setHours(0, 0, 0, 0)))
  );
  const [dtTo, setDtTo] = useState(
    toLocalISOString(new Date(new Date().setHours(23, 59, 0, 0)))
  );
  const [statusFilter, setStatusFilter] = useState("InProcess");

  const [testParameters, setTestParameters] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [fetchingAnalyzer, setFetchingAnalyzer] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  const [analyzerReffno, setAnalyzerReffno] = useState("");
  const [sampledAt, setSampledAt] = useState("");
  const [performedAt, setPerformedAt] = useState("");
  const [orReffBy, setOrReffBy] = useState("");

  const resultInputRefs = useRef({});

  useEffect(() => {
    dispatch(fetchLabBoundings());
    dispatch(fetchLabShortKeys());
  }, [dispatch]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const evaluateResultStatus = useCallback(
    (resultVal, paramId) => {
      if (!resultVal || String(resultVal).trim() === "") {
        return "N";
      }

      const valStr = String(resultVal).trim();

      // Special rule: if string contains "*", force Abnormal ("A")
      if (valStr.includes("*")) {
        return "A";
      }

      const valNum = parseFloat(valStr);
      if (isNaN(valNum)) {
        return "N";
      }

      const patientGender = selectedCase?.patient?.gender || "Both";
      const dob = selectedCase?.patient?.dob;
      const ageDays = calculateAgeInDays(dob);

      // 1. Match specific gender & age range in days
      let matchedBounding = (boundings || []).find((b) => {
        const matchParam = String(b.parameterId) === String(paramId);
        const matchGender =
          String(b.gender).toLowerCase() === String(patientGender).toLowerCase();
        const fDays = Number(b.fromAgeDays ?? b.fagedays) || 0;
        const tDays = Number(b.toAgeDays ?? b.tagedays) || 0;
        const matchAge = tDays > 0 ? ageDays >= fDays && ageDays <= tDays : true;
        return matchParam && matchGender && matchAge;
      });

      // 2. Fallback to gender === 'Both'
      if (!matchedBounding) {
        matchedBounding = (boundings || []).find((b) => {
          const matchParam = String(b.parameterId) === String(paramId);
          const matchGender = String(b.gender).toLowerCase() === "both";
          const fDays = Number(b.fromAgeDays ?? b.fagedays) || 0;
          const tDays = Number(b.toAgeDays ?? b.tagedays) || 0;
          const matchAge = tDays > 0 ? ageDays >= fDays && ageDays <= tDays : true;
          return matchParam && matchGender && matchAge;
        });
      }

      let isNormal = "N";

      if (matchedBounding) {
        const lbound = Number(matchedBounding.lowerBound ?? matchedBounding.lbound) || 0;
        const ubound = Number(matchedBounding.upperBound ?? matchedBounding.ubound) || 0;
        const lcritical = Number(matchedBounding.lowerCritical ?? matchedBounding.lcritical) || 0;
        const ucritical = Number(matchedBounding.upperCritical ?? matchedBounding.ucritical) || 0;

        // Normal bounds check
        if (lbound > 0 && ubound > 0) {
          if (valNum < lbound || valNum > ubound) {
            isNormal = "A";
          }
        } else if (lbound === 0 && ubound > 0) {
          if (valNum > ubound) {
            isNormal = "A";
          }
        } else if (lbound > 0 && ubound === 0) {
          if (valNum < lbound) {
            isNormal = "A";
          }
        }

        // Critical bounds check (overrides Abnormal)
        if (lcritical > 0 && ucritical > 0) {
          if (valNum < lcritical || valNum > ucritical) {
            isNormal = "C";
          }
        } else if (lcritical === 0 && ucritical > 0) {
          if (valNum > ucritical) {
            isNormal = "C";
          }
        } else if (lcritical > 0 && ucritical === 0) {
          if (valNum < lcritical) {
            isNormal = "C";
          }
        }
      }

      return isNormal;
    },
    [boundings, selectedCase]
  );

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await testPerformService.getAll({
        fromDate: dtFrom,
        toDate: dtTo,
        status: statusFilter,
      });
      setCases(res.data || []);
      setSelectedCase(null);
      setSelectedTest(null);
      setTestParameters([]);
      setAnalyzerReffno("");
      setSampledAt("");
      setPerformedAt("");
      setOrReffBy("");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load cases." });
    } finally {
      setLoading(false);
    }
  }, [dtFrom, dtTo, statusFilter]);

  useEffect(() => {
    let isCancelled = false;
    const loadInitialCases = async () => {
      try {
        setLoading(true);
        const res = await testPerformService.getAll({
          fromDate: dtFrom,
          toDate: dtTo,
          status: statusFilter,
        });
        if (!isCancelled) {
          setCases(res.data || []);
          setSelectedCase(null);
          setSelectedTest(null);
          setTestParameters([]);
          setAnalyzerReffno("");
          setSampledAt("");
          setPerformedAt("");
          setOrReffBy("");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setMessage({ type: "error", text: "Failed to load cases." });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialCases();
    return () => {
      isCancelled = true;
    };
  }, [dtFrom, dtTo, statusFilter]);

  const handleSelectCase = async (c) => {
    setSelectedCase(c);
    setSelectedTest(null);
    setAnalyzerReffno(c.analyzerReffno || "");
    setOrReffBy(c.orReffBy || "");
    setSampledAt("");
    setPerformedAt("");

    const tests = [...(c.tests || [])].sort((a, b) => Number(a.testSort ?? 999999) - Number(b.testSort ?? 999999));
    if (tests.length === 0) {
      setTestParameters([]);
      return;
    }

    setResultsLoading(true);
    try {
      const allParams = [];
      for (const test of tests) {
        const res = await testPerformService.getParameters(test.id);
        const rawParams = (res.data || []).map((p) => {
          const evalStatus = p.paramStatus || evaluateResultStatus(p.result, p.id);
          const isPrinted = p.isPrint === 1 || p.isPrint === true || p.isPrint === "1" || p.isPrint === "true";
          return {
            ...p,
            paramStatus: evalStatus,
            print: isPrinted,
            isPrint: isPrinted,
            _testId: test.id,
            _testName: test.testName,
          };
        });
        const params = evaluateTestParameters(rawParams);
        allParams.push(...params);
      }
      setTestParameters(allParams);

      if (tests[0]?.sampledAt) setSampledAt(tests[0].sampledAt);
      if (tests[0]?.performedAt) setPerformedAt(tests[0].performedAt);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load parameters." });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleOpenInterpretation = async (test) => {
    setSelectedTest(test);
    setResultsLoading(true);

    try {
      const res = await testPerformService.getParameters(test.id);
      const rawParams = (res.data || []).map((p) => {
        const evalStatus = p.paramStatus || evaluateResultStatus(p.result, p.id);
        const isPrinted = p.isPrint === 1 || p.isPrint === true || p.isPrint === "1" || p.isPrint === "true";
        return {
          ...p,
          paramStatus: evalStatus,
          print: isPrinted,
          isPrint: isPrinted,
          _testId: test.id,
          _testName: test.testName,
        };
      });
      const newParams = evaluateTestParameters(rawParams);
      setTestParameters((prev) => {
        const otherParams = prev.filter((p) => p._testId !== test.id);
        return [...otherParams, ...newParams];
      });

      if (test.sampledAt) setSampledAt(test.sampledAt);
      if (test.performedAt) setPerformedAt(test.performedAt);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load parameters." });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleResultChange = (paramId, field, value) => {
    setTestParameters((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === paramId) {
          const updated = { ...p, [field]: value };
          if (field === "result") {
            const evalStatus = evaluateResultStatus(value, paramId);
            updated.paramStatus = evalStatus;
            updated.print = value !== null && value !== undefined && String(value).trim() !== "";
          }
          return updated;
        }
        return p;
      });

      if (field === "result") {
        const testGroups = {};
        updatedList.forEach((p) => {
          const tid = p._testId || "default";
          if (!testGroups[tid]) testGroups[tid] = [];
          testGroups[tid].push(p);
        });

        const finalCalculatedList = [];
        Object.values(testGroups).forEach((groupParams) => {
          const calculatedGroup = evaluateTestParameters(groupParams);
          calculatedGroup.forEach((cp) => {
            if (cp.isCalculated && cp.result !== null && cp.result !== undefined && String(cp.result).trim() !== "") {
              const formattedVal = formatResultValue(String(cp.result).trim(), cp.decimal ?? 0);
              cp.result = formattedVal;
              cp.paramStatus = evaluateResultStatus(formattedVal, cp.id);
            }
          });
          finalCalculatedList.push(...calculatedGroup);
        });

        return finalCalculatedList;
      }

      return updatedList;
    });
  };

  const formatResultValue = useCallback((val, decimalPlaces = 0) => {
    if (val === null || val === undefined) return "";
    let cvalue = String(val).trim();
    if (cvalue === "") return "";

    // 1. Dash formatting: If contains "-" and not "--" or "---", replace "-" with "---"
    if (!cvalue.includes("---") && !cvalue.includes("--")) {
      if (cvalue.includes("-")) {
        cvalue = cvalue.replace(/-/g, "---");
      }
    }

    if (cvalue.includes("---")) {
      return cvalue;
    }

    // 2. Numeric & decimal places formatting
    const num = parseFloat(cvalue);
    if (!isNaN(num)) {
      const dec = decimalPlaces !== null && decimalPlaces !== undefined && decimalPlaces !== ""
        ? parseInt(decimalPlaces, 10)
        : 0;

      const validDec = !isNaN(dec) && dec >= 0 ? dec : 0;

      cvalue = num.toFixed(validDec);

      // 3. Single-digit leading zero formatting (e.g. "5" -> "05" when decimal=0)
      if (validDec === 0 && cvalue.length === 1 && cvalue !== "0" && !cvalue.startsWith("0")) {
        cvalue = "0" + cvalue;
      }
    }

    return cvalue;
  }, []);

  const applyShortKeyAndFormat = useCallback(
    (rawInput, decimalPlaces = 0, paramId) => {
      if (rawInput === null || rawInput === undefined) {
        return { result: "", paramStatus: "N", print: false };
      }

      let valStr = String(rawInput).trim();

      const keysList = Array.isArray(shortKeys)
        ? shortKeys
        : (shortKeys && Array.isArray(shortKeys.data) ? shortKeys.data : []);

      if (valStr !== "" && keysList.length > 0) {
        const matchedKey = keysList.find((k) => {
          const key = (k.sKey || k.skey || k.SKey || "").toString().trim().toLowerCase();
          return key === valStr.toLowerCase();
        });
        if (matchedKey) {
          valStr = (matchedKey.correctedKey || matchedKey.correctedkey || matchedKey.CorrectedKey || valStr).toString();
        }
      }

      const formattedVal = formatResultValue(valStr, decimalPlaces);
      const evalStatus = evaluateResultStatus(formattedVal, paramId);

      return {
        result: formattedVal,
        paramStatus: evalStatus || "N",
        print: formattedVal.trim() !== "",
      };
    },
    [shortKeys, formatResultValue, evaluateResultStatus]
  );

  const processAndFormatParam = useCallback(
    (paramId) => {
      setTestParameters((prev) => {
        const param = prev.find((p) => p.id === paramId);
        if (!param) return prev;

        if (!param.result || param.result.trim() === "") {
          return prev.map((p) => (p.id === paramId ? { ...p, print: false } : p));
        }

        const processed = applyShortKeyAndFormat(param.result, param.decimal ?? 0, paramId);

        const updatedList = prev.map((p) => (p.id === paramId ? { ...p, ...processed } : p));

        const testGroups = {};
        updatedList.forEach((p) => {
          const tid = p._testId || "default";
          if (!testGroups[tid]) testGroups[tid] = [];
          testGroups[tid].push(p);
        });

        const finalCalculatedList = [];
        Object.values(testGroups).forEach((groupParams) => {
          const calculatedGroup = evaluateTestParameters(groupParams);
          calculatedGroup.forEach((cp) => {
            if (cp.isCalculated && cp.result !== null && cp.result !== undefined && String(cp.result).trim() !== "") {
              const formattedVal = formatResultValue(String(cp.result).trim(), cp.decimal ?? 0);
              cp.result = formattedVal;
              cp.paramStatus = evaluateResultStatus(formattedVal, cp.id);
            }
          });
          finalCalculatedList.push(...calculatedGroup);
        });

        return finalCalculatedList;
      });
    },
    [applyShortKeyAndFormat, evaluateResultStatus]
  );

  const handleResultBlur = (paramId) => {
    processAndFormatParam(paramId);
  };

  const handleResultKeyDown = (e, paramId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processAndFormatParam(paramId);

      const currentIdx = displayParams.findIndex((p) => p.id === paramId);
      if (currentIdx < displayParams.length - 1) {
        const nextId = displayParams[currentIdx + 1].id;
        const nextEl = resultInputRefs.current[nextId];
        if (nextEl) {
          nextEl.focus();
          setTimeout(() => nextEl.select?.(), 10);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIdx = displayParams.findIndex((p) => p.id === paramId);
      if (currentIdx < displayParams.length - 1) {
        const nextId = displayParams[currentIdx + 1].id;
        const nextEl = resultInputRefs.current[nextId];
        if (nextEl) {
          nextEl.focus();
          setTimeout(() => nextEl.select?.(), 10);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIdx = displayParams.findIndex((p) => p.id === paramId);
      if (currentIdx > 0) {
        const prevId = displayParams[currentIdx - 1].id;
        const prevEl = resultInputRefs.current[prevId];
        if (prevEl) {
          prevEl.focus();
          setTimeout(() => prevEl.select?.(), 10);
        }
      }
    }
  };

  const handleSaveResults = async () => {
    if (!selectedCase) return;
    try {
      setSavingResults(true);
      const currentUserId = user?.id || user?.userId || null;
      const currentPerformedAt = performedAt || toLocalISOString(new Date());

      const testsToSave = selectedTest ? [selectedTest] : (selectedCase.tests || []);

      for (const test of testsToSave) {
        const testParams = testParameters.filter((r) => r._testId === test.id);

        const validParams = testParams.filter((r) => {
          return r.result !== null && r.result !== undefined && String(r.result).trim() !== "";
        });

        const payload = {
          performedBy: currentUserId,
          performedAt: currentPerformedAt,
          results: validParams.map((r) => ({
            parameterId: r.id,
            result: String(r.result).trim(),
            units: r.units || null,
            paramStatus: r.paramStatus || "N",
            isPrint: r.print ? 1 : 0,
            normalRange: r.normalRange || null,
          })),
        };

        await testPerformService.storeResults(test.id, payload);
      }

      setMessage({ type: "success", text: "Results saved successfully." });
      fetchCases();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save results." });
    } finally {
      setSavingResults(false);
    }
  };

  const handleFetchAnalyzerData = async () => {
    const searchReffNo = analyzerReffno.trim() || selectedCase?.analyzerReffno?.trim() || selectedCase?.caseNo?.trim();
    if (!searchReffNo) {
      setMessage({
        type: "error",
        text: "Please enter or select an Analyzer Reff No first.",
      });
      return;
    }

    setFetchingAnalyzer(true);
    try {
      const res = await labAnalyzerDataService.getByReffNo(searchReffNo);
      const rawData = res.data || [];

      if (!rawData || rawData.length === 0) {
        setMessage({
          type: "error",
          text: `No raw machine measurements found in database for Reff No: ${searchReffNo}`,
        });
        return;
      }

      const cleanStr = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");

      let matchedCount = 0;

      setTestParameters((prevParams) => {
        const updatedList = prevParams.map((p) => {
          const targetCodes = [
            p.analyzerCode,
            p.pCode,
            p.parameterName,
          ].filter((val) => val && String(val).trim() !== "");

          const matchedData = rawData.find((item) => {
            if (!item || item.result === null || item.result === undefined || String(item.result).trim() === "") {
              return false;
            }

            const rawName = (item.paramName || "").trim().toLowerCase();
            const rawClean = cleanStr(rawName);

            return targetCodes.some((code) => {
              const cLower = String(code).trim().toLowerCase();
              const cClean = cleanStr(cLower);

              // Match analyzerCode from lab_master_test_parameters directly (exact or normalized)
              return rawName === cLower || (cClean.length > 0 && rawClean === cClean);
            });
          });

          if (matchedData && matchedData.result !== null && matchedData.result !== undefined && String(matchedData.result).trim() !== "") {
            matchedCount++;
            const rawResult = String(matchedData.result).trim();
            const formattedResult = formatResultValue(rawResult, p.decimal ?? 0);
            const evalStatus = evaluateResultStatus(formattedResult, p.id);
            return {
              ...p,
              result: formattedResult,
              paramStatus: evalStatus,
            };
          }
          return p;
        });

        const testGroups = {};
        updatedList.forEach((p) => {
          const tid = p._testId || "default";
          if (!testGroups[tid]) testGroups[tid] = [];
          testGroups[tid].push(p);
        });

        const finalCalculatedList = [];
        Object.values(testGroups).forEach((groupParams) => {
          const calculatedGroup = evaluateTestParameters(groupParams);
          calculatedGroup.forEach((cp) => {
            if (cp.isCalculated && cp.result !== null && cp.result !== undefined && String(cp.result).trim() !== "") {
              const formattedVal = formatResultValue(String(cp.result).trim(), cp.decimal ?? 0);
              cp.result = formattedVal;
              cp.paramStatus = evaluateResultStatus(formattedVal, cp.id);
            }
          });
          finalCalculatedList.push(...calculatedGroup);
        });

        return finalCalculatedList;
      });

      if (matchedCount > 0) {
        setMessage({
          type: "success",
          text: `Successfully matched & filled ${matchedCount} parameter result(s) for Reff No: ${searchReffNo}`,
        });
      } else {
        const receivedParams = Array.from(new Set(rawData.map((r) => r.paramName).filter(Boolean))).join(", ");
        setMessage({
          type: "error",
          text: `Analyzer data received for Reff No ${searchReffNo} (Machine Params: ${receivedParams}), but could not match with current test parameter codes. Please check analyzerCode in Master Test Parameters.`,
        });
      }

      // Auto-focus and select text of the first row's result input box
      setTimeout(() => {
        const firstParamId = displayParams[0]?.id || testParameters[0]?.id;
        if (firstParamId) {
          const firstEl = resultInputRefs.current[firstParamId];
          if (firstEl) {
            firstEl.focus();
            firstEl.select?.();
          }
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to fetch analyzer data.",
      });
    } finally {
      setFetchingAnalyzer(false);
    }
  };

  const displayParams = selectedTest
    ? testParameters.filter((p) => p._testId === selectedTest.id)
    : testParameters;

  useEffect(() => {
    if (!resultsLoading && displayParams && displayParams.length > 0) {
      const timer = setTimeout(() => {
        const firstParamId = displayParams[0]?.id;
        if (firstParamId && resultInputRefs.current[firstParamId]) {
          resultInputRefs.current[firstParamId].focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [resultsLoading, selectedCase?.id, selectedTest?.id]);

  return (
    <div className="p-4 max-w-full mx-auto space-y-4">
      {message && (
        <div
          className={`px-4 py-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* Left Panel - 35% */}
        <div className="w-[35%] flex flex-col gap-4">
          {/* Filters + Patients List */}
          <div className="border rounded-md flex flex-col overflow-hidden flex-1">
            <div className="px-3 py-2 bg-sky-50 border-b space-y-2">
              <div className="flex items-end gap-2 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground">
                    From Date
                  </Label>
                  <Input
                    type="datetime-local"
                    value={dtFrom}
                    onChange={(e) => setDtFrom(e.target.value)}
                    className="h-7 text-xs w-40"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-medium text-muted-foreground">
                    To Date
                  </Label>
                  <Input
                    type="datetime-local"
                    value={dtTo}
                    onChange={(e) => setDtTo(e.target.value)}
                    className="h-7 text-xs w-40"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-[10px] font-medium text-muted-foreground">
                    Case Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-7 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="InProcess">InProcess</SelectItem>
                      <SelectItem value="Sampled">Sampled</SelectItem>
                      <SelectItem value="Registered">Registered</SelectItem>
                      <SelectItem value="Reported">Reported</SelectItem>
                      <SelectItem value="All">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  className="h-7"
                  onClick={fetchCases}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="px-3 py-1 bg-sky-50/50 border-b">
                <h3 className="text-[10px] font-semibold text-sky-700">
                  Patients List ({cases.length})
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="h-7">
                    <TableHead className="text-[10px] w-8">SL</TableHead>
                    <TableHead className="text-[10px]">Patient</TableHead>
                    <TableHead className="text-[10px]">Case No</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px] text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-[10px] text-muted-foreground py-8"
                      >
                        {loading
                          ? "Loading..."
                          : "No cases found. Click Refresh."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    cases.map((c, idx) => (
                      <TableRow
                        key={c.id}
                        className={`h-7 cursor-pointer hover:bg-muted/50 ${
                          selectedCase?.id === c.id ? "bg-sky-100" : ""
                        }`}
                        onClick={() => handleSelectCase(c)}
                      >
                        <TableCell className="text-[10px]">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="text-[10px] font-medium">
                          {c.patient?.pName || "-"}
                        </TableCell>
                        <TableCell className="text-[10px]">
                          {c.caseNo}
                        </TableCell>
                        <TableCell className="text-[10px]">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 font-normal ${
                              c.status === "Reported"
                                ? "border-green-500 text-green-700 bg-green-50"
                                : c.status === "InProcess"
                                ? "border-amber-500 text-amber-700 bg-amber-50"
                                : c.status === "Approved"
                                ? "border-blue-500 text-blue-700 bg-blue-50"
                                : c.status === "Sampled"
                                ? "border-purple-500 text-purple-700 bg-purple-50"
                                : c.status === "Cancelled"
                                ? "border-red-500 text-red-700 bg-red-50"
                                : "border-gray-400 text-gray-700 bg-gray-50"
                            }`}
                          >
                            {c.status || "Registered"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCase(c);
                            }}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Selected Tests */}
          <div
            className="border rounded-md flex flex-col overflow-hidden"
            style={{ height: "40%" }}
          >
            <div className="px-3 py-1 bg-sky-50 border-b flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-sky-700">
                {selectedCase
                  ? `Selected Tests (${(selectedCase.tests || []).length})`
                  : "Select a patient"}
              </h3>
              {selectedCase && selectedTest && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] px-1.5 text-sky-700 hover:text-sky-900"
                  onClick={() => setSelectedTest(null)}
                >
                  Show All Tests
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {!selectedCase ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
                  Select a patient to view tests.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="h-7">
                      <TableHead className="text-[10px] w-8">SL</TableHead>
                      <TableHead className="text-[10px]">Test Name</TableHead>
                      <TableHead className="text-[10px] text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedCase.tests || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-[10px] text-muted-foreground py-6"
                        >
                          No tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(selectedCase.tests || [])]
                        .sort((a, b) => Number(a.testSort ?? 999999) - Number(b.testSort ?? 999999))
                        .map((test, idx) => (
                        <TableRow
                          key={test.id}
                          className={`h-7 cursor-pointer hover:bg-muted/50 ${
                            selectedTest?.id === test.id ? "bg-sky-100" : ""
                          }`}
                          onClick={() => handleOpenInterpretation(test)}
                        >
                          <TableCell className="text-[10px]">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-[10px] font-medium">
                            {test.testName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5 text-[10px] text-blue-600 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenInterpretation(test);
                              }}
                            >
                              Enter Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - 65% */}
        <div className="w-[65%] border rounded-md flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-sky-50 border-b flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sky-700">
              Enter Results {selectedTest ? `(${selectedTest.testName})` : selectedCase ? "(All Tests)" : ""}
            </h3>
            {selectedCase && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 font-semibold"
                  onClick={handleFetchAnalyzerData}
                  disabled={fetchingAnalyzer}
                >
                  {fetchingAnalyzer ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  Fetch Analyzer
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSaveResults}
                  disabled={savingResults || !selectedCase || testParameters.length === 0}
                >
                  {savingResults ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : null}
                  Save Results
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto p-3">
            {!selectedCase ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Select a patient from the list to enter results.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Patient Details Card */}
                <Card className="shadow-sm border border-border/50">
                  <CardHeader className="px-3 py-1.5 bg-sky-50">
                    <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {selectedCase.patient?.pName || "-"}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span>MRN: {selectedCase.patient?.mrn || "-"}</span>
                      <span className="text-muted-foreground">|</span>
                      <span>
                        Age: {calculateAge(selectedCase.patient?.dob)}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span>Case: {selectedCase.caseNo}</span>
                      <span className="text-muted-foreground">|</span>
                      <span>Dr. {selectedCase.doctor?.Name || "-"}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 py-2">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground font-semibold">
                          Analyzer Reff No
                        </Label>
                        <Input
                          value={analyzerReffno}
                          onChange={(e) => setAnalyzerReffno(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleFetchAnalyzerData();
                            }
                          }}
                          placeholder="e.g. LAB-26-1"
                          className="h-7 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Sampled At
                        </Label>
                        <Input
                          type="datetime-local"
                          value={sampledAt}
                          readOnly
                          className="h-7 text-xs bg-muted cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Performed At
                        </Label>
                        <Input
                          type="datetime-local"
                          value={performedAt}
                          readOnly
                          className="h-7 text-xs bg-muted cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">
                          Or Reff By
                        </Label>
                        <Input
                          value={orReffBy}
                          onChange={(e) => setOrReffBy(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Table */}
                {!selectedTest && testParameters.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
                    Click &quot;Enter Results&quot; on a test to view
                    parameters.
                  </div>
                ) : resultsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Card className="shadow-sm border border-border/50">
                    <CardContent className="p-0">
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="h-8">
                              <TableHead className="text-xs w-10">
                                Sr. No
                              </TableHead>
                              <TableHead className="text-xs w-28 whitespace-nowrap">
                                Test Name
                              </TableHead>
                              <TableHead className="text-xs w-24 whitespace-nowrap">
                                Sub Header
                              </TableHead>
                              <TableHead className="text-xs w-32 whitespace-nowrap">
                                Parameter
                              </TableHead>
                              <TableHead className="text-xs min-w-30">
                                Result
                              </TableHead>
                              <TableHead className="text-xs min-w-27 w-28 whitespace-nowrap">
                                Units
                              </TableHead>
                              <TableHead className="text-xs min-w-27 w-28 whitespace-nowrap">
                                Reff. Value
                              </TableHead>
                              <TableHead className="text-xs min-w-27 w-28 whitespace-nowrap">
                                Status
                              </TableHead>
                              <TableHead className="text-xs w-12 text-center whitespace-nowrap">
                                Print
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayParams.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={9}
                                  className="text-center text-xs text-muted-foreground py-6"
                                >
                                  No parameters found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              displayParams.map((param, idx) => (
                                <TableRow
                                  key={param.id}
                                  className="h-8"
                                >
                                  <TableCell className="text-xs">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="text-xs font-medium whitespace-nowrap">
                                    {param._testName}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {param.subHeaderName || "-"}
                                  </TableCell>
                                  <TableCell className="text-xs font-medium whitespace-nowrap">
                                    {param.parameterName}
                                  </TableCell>
                                  <TableCell className="w-full min-w-[120px]">
                                    <Input
                                      ref={(el) => { resultInputRefs.current[param.id] = el; }}
                                      value={param.result || ""}
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) =>
                                        handleResultChange(
                                          param.id,
                                          "result",
                                          e.target.value
                                        )
                                      }
                                      onKeyDown={(e) => handleResultKeyDown(e, param.id)}
                                      // onBlur={() => handleResultBlur(param.id)}
                                      className={`h-7 text-xs w-full transition-colors ${
                                        param.paramStatus === "C"
                                          ? "bg-red-500 text-white font-bold placeholder:text-red-100"
                                          : param.paramStatus === "A"
                                          ? "bg-pink-100 text-pink-900 border-pink-400 font-semibold"
                                          : param.paramStatus === "N" && param.result
                                          ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-medium"
                                          : ""
                                      }`}
                                    />
                                  </TableCell>
                                  <TableCell className="min-w-[110px] w-28">
                                    <Input
                                      value={param.units || ""}
                                      onChange={(e) =>
                                        handleResultChange(
                                          param.id,
                                          "units",
                                          e.target.value
                                        )
                                      }
                                      className="h-7 text-xs w-full px-2"
                                    />
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap min-w-[110px] w-28">
                                    {stripHtml(param.normalRange) || "-"}
                                  </TableCell>
                                  <TableCell className="min-w-[110px] w-28">
                                    <Select
                                      value={param.paramStatus}
                                      onValueChange={(val) =>
                                        handleResultChange(
                                          param.id,
                                          "paramStatus",
                                          val
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs w-full px-2">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="N">
                                          Normal
                                        </SelectItem>
                                        <SelectItem value="A">
                                          Abnormal
                                        </SelectItem>
                                        <SelectItem value="C">
                                          Critical
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Checkbox
                                      checked={param.print}
                                      onCheckedChange={(checked) =>
                                        handleResultChange(
                                          param.id,
                                          "print",
                                          checked
                                        )
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPerform;
