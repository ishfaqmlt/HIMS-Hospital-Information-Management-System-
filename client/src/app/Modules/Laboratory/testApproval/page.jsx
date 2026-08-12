"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  RefreshCw,
  User,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import testPerformService from "@/services/testPerform.service";
import { calculateAge, toLocalISOString } from "@/lib/utils";

const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

const TestApproval = () => {
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
  const [statusFilter, setStatusFilter] = useState("Reported");

  const [testParameters, setTestParameters] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [analyzerReffno, setAnalyzerReffno] = useState("");
  const [sampledAt, setSampledAt] = useState("");
  const [performedAt, setPerformedAt] = useState("");
  const [orReffBy, setOrReffBy] = useState("");

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
      setSelectedTest(null);
      setTestParameters([]);
      setRemarks("");
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
    fetchCases();
  }, []);

  // Click on "Select" button in Patient List table
  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setSelectedTest(null); // Do NOT select all parameters on case selection
    setTestParameters([]);
    setRemarks("");
    setAnalyzerReffno(c.analyzerReffno || "");
    setOrReffBy(c.orReffBy || "");
    setSampledAt("");
    setPerformedAt("");
  };

  // Click on "Select Test" button in Selected Tests data table
  const handleSelectTestForApproval = async (test) => {
    setSelectedTest(test);
    setResultsLoading(true);
    setRemarks(test.remarks || "");

    try {
      const res = await testPerformService.getParameters(test.id);
      setTestParameters(
        (res.data || []).map((p) => ({
          ...p,
          _testId: test.id,
          _testName: test.testName,
        }))
      );

      if (test.sampledAt) setSampledAt(test.sampledAt);
      if (test.performedAt) setPerformedAt(test.performedAt);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load parameters." });
    } finally {
      setResultsLoading(false);
    }
  };

  // Click on "Approve Test" button
  const handleApproveTest = async () => {
    if (!selectedTest) return;
    try {
      setApproving(true);
      await testPerformService.updateTestStatus(selectedTest.id, {
        status: "Approved",
        approvedAt: toLocalISOString(new Date()),
        remarks: remarks,
      });

      setMessage({ type: "success", text: `Test "${selectedTest.testName}" approved successfully.` });

      // Update local state for immediate feedback
      setSelectedTest((prev) => (prev ? { ...prev, testStatus: "Approved", remarks } : null));

      // Refresh case list to reflect updated test/case statuses
      fetchCases();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to approve test." });
    } finally {
      setApproving(false);
    }
  };

  // Click on "Request Re-Test / Disapprove" button
  const handleDisapproveTest = async () => {
    if (!selectedTest) return;
    try {
      setApproving(true);
      await testPerformService.updateTestStatus(selectedTest.id, {
        status: "InProcess",
        remarks: remarks || "Returned by Pathologist for re-testing",
      });

      setMessage({ type: "success", text: `Test "${selectedTest.testName}" returned for re-testing with remarks.` });

      // Update local state for immediate feedback
      setSelectedTest((prev) => (prev ? { ...prev, testStatus: "InProcess", remarks } : null));

      // Refresh case list
      fetchCases();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to return test for re-testing." });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-4">
      {message && (
        <div
          className={`px-4 py-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
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
                      <SelectItem value="Reported">Reported</SelectItem>
                      <SelectItem value="InProcess">InProcess</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
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
                              c.status === "Approved"
                                ? "border-blue-500 text-blue-700 bg-blue-50"
                                : c.status === "Reported"
                                ? "border-green-500 text-green-700 bg-green-50"
                                : c.status === "InProcess"
                                ? "border-amber-500 text-amber-700 bg-amber-50"
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

          {/* Selected Tests Data Table */}
          <div
            className="border rounded-md flex flex-col overflow-hidden"
            style={{ height: "45%" }}
          >
            <div className="px-3 py-1 bg-sky-50 border-b">
              <h3 className="text-[10px] font-semibold text-sky-700">
                {selectedCase
                  ? `Selected Tests (${(selectedCase.tests || []).length})`
                  : "Select a patient"}
              </h3>
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
                      <TableHead className="text-[10px]">Test Status</TableHead>
                      <TableHead className="text-[10px] text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedCase.tests || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-[10px] text-muted-foreground py-6"
                        >
                          No tests found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (selectedCase.tests || []).map((test, idx) => (
                        <TableRow
                          key={test.id}
                          className={`h-7 ${
                            test.testStatus === "Reported"
                              ? "cursor-pointer hover:bg-muted/50"
                              : "opacity-75"
                          } ${
                            selectedTest?.id === test.id ? "bg-sky-100" : ""
                          }`}
                          onClick={() => {
                            if (test.testStatus === "Reported") {
                              handleSelectTestForApproval(test);
                            }
                          }}
                        >
                          <TableCell className="text-[10px]">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-[10px] font-medium">
                            {test.testName}
                          </TableCell>
                          <TableCell className="text-[10px]">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 font-normal ${
                                test.testStatus === "Approved"
                                  ? "border-blue-500 text-blue-700 bg-blue-50"
                                  : test.testStatus === "Reported"
                                  ? "border-green-500 text-green-700 bg-green-50"
                                  : test.testStatus === "InProcess"
                                  ? "border-amber-500 text-amber-700 bg-amber-50"
                                  : "border-gray-400 text-gray-700 bg-gray-50"
                              }`}
                            >
                              {test.testStatus || "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {test.testStatus === "Reported" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTestForApproval(test);
                                }}
                              >
                                Select Test
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">-</span>
                            )}
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

        {/* Right Panel - 65% (Selected Test Result to Approve) */}
        <div className="w-[65%] border rounded-md flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-sky-50 border-b flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sky-700">
              Selected Test Result to Approve {selectedTest ? `(${selectedTest.testName})` : ""}
            </h3>
            {selectedTest && (
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 ${
                  selectedTest.testStatus === "Approved"
                    ? "border-blue-500 text-blue-700 bg-blue-50"
                    : "border-amber-500 text-amber-700 bg-amber-50"
                }`}
              >
                {selectedTest.testStatus || "Pending"}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-auto p-3">
            {!selectedCase ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Select a patient from the list, then click &quot;Select Test&quot; to approve results.
              </div>
            ) : !selectedTest ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Click &quot;Select Test&quot; in the Selected Tests list to view results for approval.
              </div>
            ) : (
              <div className="space-y-4">
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
                        <Label className="text-[10px] text-muted-foreground">
                          Analyzer Reff No
                        </Label>
                        <Input
                          value={analyzerReffno}
                          readOnly
                          className="h-7 text-xs bg-muted cursor-not-allowed"
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
                          readOnly
                          className="h-7 text-xs bg-muted cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parameters Table (READ ONLY) */}
                {resultsLoading ? (
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
                              <TableHead className="text-xs min-w-[120px]">
                                Result
                              </TableHead>
                              <TableHead className="text-xs min-w-[110px] w-28 whitespace-nowrap">
                                Units
                              </TableHead>
                              <TableHead className="text-xs min-w-[110px] w-28 whitespace-nowrap">
                                Reff. Value
                              </TableHead>
                              <TableHead className="text-xs min-w-[110px] w-28 whitespace-nowrap">
                                Status
                              </TableHead>
                              <TableHead className="text-xs w-12 text-center whitespace-nowrap">
                                Print
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {testParameters.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={9}
                                  className="text-center text-xs text-muted-foreground py-6"
                                >
                                  No parameters found for this test.
                                </TableCell>
                              </TableRow>
                            ) : (
                              testParameters.map((param, idx) => (
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
                                      value={param.result || ""}
                                      readOnly
                                      className="h-7 text-xs w-full bg-muted cursor-not-allowed font-medium text-foreground"
                                    />
                                  </TableCell>
                                  <TableCell className="min-w-[110px] w-28">
                                    <Input
                                      value={param.units || ""}
                                      readOnly
                                      className="h-7 text-xs w-full px-2 bg-muted cursor-not-allowed text-foreground"
                                    />
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap min-w-[110px] w-28">
                                    {stripHtml(param.normalRange) || "-"}
                                  </TableCell>
                                  <TableCell className="min-w-[110px] w-28">
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] px-1.5 py-0 font-normal ${
                                        param.paramStatus === "A"
                                          ? "border-amber-500 text-amber-700 bg-amber-50"
                                          : param.paramStatus === "C"
                                          ? "border-red-500 text-red-700 bg-red-50"
                                          : "border-green-500 text-green-700 bg-green-50"
                                      }`}
                                    >
                                      {param.paramStatus === "A"
                                        ? "Abnormal"
                                        : param.paramStatus === "C"
                                        ? "Critical"
                                        : "Normal"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Checkbox
                                      checked={param.print}
                                      disabled
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

                {/* Remarks & Approval Action Section */}
                <div className="pt-2 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-sky-700">
                      Approval Remarks
                    </Label>
                    <Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Type approval comments or remarks here..."
                      rows={2}
                      className="text-xs resize-none"
                      disabled={selectedTest?.testStatus === "Approved"}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium px-4"
                      onClick={handleDisapproveTest}
                      disabled={
                        approving ||
                        !selectedTest ||
                        selectedTest.testStatus === "Approved"
                      }
                    >
                      {approving ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                      )}
                      Request Re-Test
                    </Button>

                    <Button
                      size="sm"
                      className="h-8 bg-green-600 hover:bg-green-700 text-white font-medium px-4"
                      onClick={handleApproveTest}
                      disabled={
                        approving ||
                        !selectedTest ||
                        selectedTest.testStatus === "Approved"
                      }
                    >
                      {approving ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                      )}
                      {selectedTest?.testStatus === "Approved"
                        ? "Test Approved"
                        : "Approve Test"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApproval;
