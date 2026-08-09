"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  User,
  TestTube,
  FileText,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import testPerformService from "@/services/testPerform.service";
import { calculateAge, toLocalISOString } from "@/lib/utils";

const TestPerform = () => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [dtFrom, setDtFrom] = useState(
    toLocalISOString(new Date(new Date().setHours(0, 0, 0, 0)))
  );
  const [dtTo, setDtTo] = useState(
    toLocalISOString(new Date(new Date().setHours(23, 59, 0, 0)))
  );
  const [statusFilter, setStatusFilter] = useState("InProcess");

  const [interpretDialogOpen, setInterpretDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testParameters, setTestParameters] = useState([]);
  const [results, setResults] = useState({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

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
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load cases." });
    } finally {
      setLoading(false);
    }
  }, [dtFrom, dtTo, statusFilter]);

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c) => {
    setSelectedCase(c);
  };

  const handleOpenInterpretation = async (test) => {
    setSelectedTest(test);
    setResultsLoading(true);
    setInterpretDialogOpen(true);

    try {
      const paramRes = await import("@/lib/axios").then((m) =>
        m.default.get("/lab-master-test-parameters", {
          params: { master_test_id: test.masterTestId },
        })
      );

      const existingRes = await testPerformService.getResults(test.id);
      const existingResults = existingRes.data || [];

      const resultMap = {};
      (paramRes.data || []).forEach((param) => {
        const existing = existingResults.find(
          (r) => r.parameterId === param.id
        );
        resultMap[param.id] = {
          parameterId: param.id,
          parameterName: param.parameterName,
          units: existing?.units || param.units || "",
          result: existing?.result || "",
          paramStatus: existing?.paramStatus || "N",
          normalRange: existing?.normalRange || param.normalRange || "",
          decimal: param.decimal || 0,
          sortNo: param.sortNo || 0,
        };
      });

      setTestParameters(Object.values(resultMap));
      setResults(resultMap);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load test parameters." });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleResultChange = (paramId, field, value) => {
    setResults((prev) => ({
      ...prev,
      [paramId]: { ...prev[paramId], [field]: value },
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedTest) return;
    try {
      setSavingResults(true);
      const payload = {
        results: Object.values(results).map((r) => ({
          parameterId: r.parameterId,
          result: r.result || null,
          units: r.units || null,
          paramStatus: r.paramStatus,
          normalRange: r.normalRange || null,
        })),
      };
      await testPerformService.storeResults(selectedTest.id, payload);
      setMessage({ type: "success", text: "Results saved successfully." });
      setInterpretDialogOpen(false);
      setSelectedTest(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save results." });
    } finally {
      setSavingResults(false);
    }
  };

  const paramStatusColor = (s) => {
    if (s === "N") return "text-green-600 bg-green-50";
    if (s === "A") return "text-red-600 bg-red-50";
    if (s === "C") return "text-amber-600 bg-amber-50";
    return "text-gray-400 bg-gray-50";
  };

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

      {/* Top Filters */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            From Date
          </Label>
          <Input
            type="datetime-local"
            value={dtFrom}
            onChange={(e) => setDtFrom(e.target.value)}
            className="h-8 text-xs w-48"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            To Date
          </Label>
          <Input
            type="datetime-local"
            value={dtTo}
            onChange={(e) => setDtTo(e.target.value)}
            className="h-8 text-xs w-48"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Case Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="InProcess">InProcess</SelectItem>
              <SelectItem value="Sampled">Sampled</SelectItem>
              <SelectItem value="Registered">Registered</SelectItem>
              <SelectItem value="All">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="h-8"
          onClick={fetchCases}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
          )}
          Refresh List
        </Button>
      </div>

      {/* Two Panel Layout */}
      <div className="flex gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Left Panel - 35% */}
        <div className="w-[35%] flex flex-col gap-4">
          {/* Patients List - 50% height */}
          <div className="border rounded-md flex flex-col overflow-hidden" style={{ height: "50%" }}>
            <div className="px-3 py-1.5 bg-sky-50 border-b">
              <h3 className="text-xs font-semibold text-sky-700">
                Patients List ({cases.length})
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-xs w-10">SL</TableHead>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Case No</TableHead>
                    <TableHead className="text-xs text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-xs text-muted-foreground py-8"
                      >
                        {loading
                          ? "Loading..."
                          : "No cases found. Click Refresh List."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    cases.map((c, idx) => (
                      <TableRow
                        key={c.id}
                        className={`h-8 cursor-pointer hover:bg-muted/50 ${
                          selectedCase?.id === c.id ? "bg-sky-100" : ""
                        }`}
                        onClick={() => handleSelectCase(c)}
                      >
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-medium">
                          {c.patient?.pName || "-"}
                        </TableCell>
                        <TableCell className="text-xs">{c.caseNo}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
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

          {/* Selected Tests - 50% height */}
          <div className="border rounded-md flex flex-col overflow-hidden" style={{ height: "50%" }}>
            <div className="px-3 py-1.5 bg-sky-50 border-b">
              <h3 className="text-xs font-semibold text-sky-700">
                {selectedCase
                  ? `Selected Tests (${(selectedCase.tests || []).length})`
                  : "Select a patient from the list"}
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
              {!selectedCase ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                  Click &quot;Select&quot; on a patient to view their tests.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="text-xs w-10">SL</TableHead>
                      <TableHead className="text-xs">Test Name</TableHead>
                      <TableHead className="text-xs text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedCase.tests || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-xs text-muted-foreground py-6"
                        >
                          No tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (selectedCase.tests || []).map((test, idx) => (
                        <TableRow key={test.id} className="h-8">
                          <TableCell className="text-xs">{idx + 1}</TableCell>
                          <TableCell className="text-xs font-medium">
                            {test.testName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => handleOpenInterpretation(test)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Add Interpretation
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
          <div className="px-3 py-1.5 bg-sky-50 border-b">
            <h3 className="text-xs font-semibold text-sky-700">
              Enter Results
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {!selectedCase ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Select a patient from the list to enter results.
              </div>
            ) : (
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
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground">
                    Click &quot;Add Interpretation&quot; on a test to enter results.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Interpretation Dialog */}
      <Dialog
        open={interpretDialogOpen}
        onOpenChange={setInterpretDialogOpen}
      >
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Enter Results - {selectedTest?.testName} ({selectedTest?.testCode})
            </DialogTitle>
          </DialogHeader>

          {resultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-xs w-10">SL</TableHead>
                    <TableHead className="text-xs">Parameter</TableHead>
                    <TableHead className="text-xs w-32">Result</TableHead>
                    <TableHead className="text-xs w-24">Units</TableHead>
                    <TableHead className="text-xs w-32">Normal Range</TableHead>
                    <TableHead className="text-xs w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testParameters.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-xs text-muted-foreground py-6"
                      >
                        No parameters found for this test.
                      </TableCell>
                    </TableRow>
                  ) : (
                    testParameters.map((param, idx) => (
                      <TableRow key={param.parameterId} className="h-8">
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-medium">
                          {param.parameterName}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={param.result}
                            onChange={(e) =>
                              handleResultChange(
                                param.parameterId,
                                "result",
                                e.target.value
                              )
                            }
                            className="h-7 text-xs"
                            placeholder="Enter result"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={param.units}
                            onChange={(e) =>
                              handleResultChange(
                                param.parameterId,
                                "units",
                                e.target.value
                              )
                            }
                            className="h-7 text-xs"
                            placeholder="Units"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {param.normalRange || "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={param.paramStatus}
                            onValueChange={(val) =>
                              handleResultChange(
                                param.parameterId,
                                "paramStatus",
                                val
                              )
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="N">Normal</SelectItem>
                              <SelectItem value="A">Abnormal</SelectItem>
                              <SelectItem value="C">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setInterpretDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleSaveResults}
                  disabled={savingResults}
                >
                  {savingResults ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : null}
                  Save Results
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestPerform;
