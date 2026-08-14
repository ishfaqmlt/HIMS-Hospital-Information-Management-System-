"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Loader2,
  RefreshCw,
  Search,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
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
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import labCaseService from "@/services/labCase.service";
import testPerformService from "@/services/testPerform.service";
import labOutputSettingService from "@/services/labOutputSetting.service";
import LabHeader from "@/components/lab/LabHeader";
import LabFooter from "@/components/lab/LabFooter";
import LabTestBarcodeStamp from "@/components/lab/LabTestBarcodeStamp";
import { calculateAge, toLocalISOString } from "@/lib/utils";

const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

const groupTestsByHeaderAndPerformedAt = (tests) => {
  const groupsMap = new Map();

  for (const tItem of tests || []) {
    const headerTitle = (
      tItem.testObj?.headerName ||
      tItem.testObj?.header_name ||
      tItem.testObj?.testName ||
      tItem.testObj?.departmentName ||
      tItem.testObj?.DepartmentName ||
      "LABORATORY"
    ).trim();
    const performedAt = tItem.testObj?.performedAt || "";

    const groupKey = headerTitle.toUpperCase();

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        headerName: headerTitle,
        performedAt: performedAt,
        testItems: [],
      });
    }

    groupsMap.get(groupKey).testItems.push(tItem);
  }

  return Array.from(groupsMap.values());
};

const groupParametersBySubHeader = (testItems) => {
  const subMap = new Map();

  for (const tItem of testItems || []) {
    for (const param of tItem.parameters || []) {
      const subHeader = (
        param.subHeaderName ||
        param.sub_header_name ||
        ""
      ).trim();

      if (!subMap.has(subHeader)) {
        subMap.set(subHeader, []);
      }

      subMap.get(subHeader).push(param);
    }
  }

  return Array.from(subMap.entries()).map(([subHeaderName, params]) => ({
    subHeaderName,
    parameters: params,
  }));
};

export default function PatientReportsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [cases, setCases] = useState([]);

  // Filter States
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 0, 0));
  const [caseNoSearch, setCaseNoSearch] = useState("");
  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));
  const [statusFilter, setStatusFilter] = useState("All");

  // Checked Tests State: { [testId]: { test, parentCase } }
  const [checkedTests, setCheckedTests] = useState({});

  // Output Settings State
  const [outputSettings, setOutputSettings] = useState(null);

  // Print Data State
  const [printData, setPrintData] = useState([]); // List of { caseObj, testObj, parameters }
  const [printLoading, setPrintLoading] = useState(false);
  const printContentRef = useRef(null);

  const columns = useMemo(() => getColumns(), []);

  const handlePrintTrigger = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: "Lab_Report",
    onAfterPrint: () => {
      markTestsAsPrinted();
    },
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchOutputSettings = useCallback(async () => {
    try {
      const res = await labOutputSettingService.get();
      if (res.data) {
        setOutputSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to load output settings:", err);
    }
  }, []);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        fromDate: dtFrom,
        toDate: dtTo,
      };
      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }
      if (caseNoSearch.trim()) {
        params.search = caseNoSearch.trim();
      }

      const res = await labCaseService.getAll(params);
      const data = res.data || [];
      setCases(data);
      // By default rows are NOT expanded!
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load patient lab reports." });
    } finally {
      setLoading(false);
    }
  }, [dtFrom, dtTo, statusFilter, caseNoSearch]);

  useEffect(() => {
    fetchCases();
    fetchOutputSettings();
  }, []);

  const handleCheckTest = (test, parentCase, checked) => {
    setCheckedTests((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[test.id] = { test, parentCase };
      } else {
        delete updated[test.id];
      }
      return updated;
    });
  };

  const handleCheckAllTestsForCase = (parentCase, checked) => {
    setCheckedTests((prev) => {
      const updated = { ...prev };
      (parentCase.tests || []).forEach((test) => {
        if (checked) {
          updated[test.id] = { test, parentCase };
        } else {
          delete updated[test.id];
        }
      });
      return updated;
    });
  };

  const getApprovalComment = (test) => {
    if (test.rejectReason || test.sampleStatus === "Rejected") {
      return `Sample Rejected: ${test.rejectReason || "Quality issue"}`;
    }
    switch (test.testStatus) {
      case "Approved":
        return "Approved & Verified by Consultant";
      case "Reported":
        return "Results entered; awaiting consultant approval signature";
      case "InProcess":
        return "In process; result entry pending";
      case "Sampled":
        return "Sample collected; test execution in progress";
      case "Registered":
      case "Pending":
        return "Awaiting sample collection";
      case "Cancelled":
        return "Test cancelled";
      default:
        return "Status pending";
    }
  };

  const handlePrintSingleTest = async (test, parentCase) => {
    try {
      setPrintLoading(true);
      const res = await testPerformService.getParameters(test.id);
      const params = res.data || [];

      setPrintData([
        {
          caseObj: parentCase,
          tests: [
            {
              testObj: test,
              parameters: params,
            },
          ],
        },
      ]);

      setTimeout(() => {
        if (handlePrintTrigger) {
          handlePrintTrigger();
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load parameters for printing." });
    } finally {
      setPrintLoading(false);
    }
  };

  const handlePrintCheckedTests = async () => {
    const selectedItems = Object.values(checkedTests);
    if (selectedItems.length === 0) {
      setMessage({ type: "error", text: "Please check at least one test to print." });
      return;
    }

    try {
      setPrintLoading(true);
      const caseMap = {};

      for (const item of selectedItems) {
        const caseId = item.parentCase.id || item.parentCase.caseNo;
        if (!caseMap[caseId]) {
          caseMap[caseId] = {
            caseObj: item.parentCase,
            tests: [],
          };
        }

        const res = await testPerformService.getParameters(item.test.id);
        caseMap[caseId].tests.push({
          testObj: item.test,
          parameters: res.data || [],
        });
      }

      setPrintData(Object.values(caseMap));
      setTimeout(() => {
        if (handlePrintTrigger) {
          handlePrintTrigger();
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to prepare checked reports for printing." });
    } finally {
      setPrintLoading(false);
    }
  };

  const markTestsAsPrinted = async () => {
    try {
      for (const caseGroup of printData) {
        for (const t of caseGroup.tests || []) {
          if (t.testObj?.id) {
            await labCaseService.updateTestStatus(t.testObj.id, { isPrinted: true });
          }
        }
      }
      fetchCases();
    } catch (e) {
      console.error("Failed to update printed status:", e);
    }
  };

  const totalCheckedTestsCount = Object.keys(checkedTests).length;

  const renderSubComponent = ({ row }) => {
    const c = row.original;
    const caseTests = c.tests || [];
    const allTestsChecked =
      caseTests.length > 0 &&
      caseTests.every((t) => !!checkedTests[t.id]);

    return (
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <div className="px-3 py-1.5 bg-slate-100 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allTestsChecked}
              onCheckedChange={(checked) =>
                handleCheckAllTestsForCase(c, !!checked)
              }
              id={`check-all-${c.id}`}
            />
            <Label
              htmlFor={`check-all-${c.id}`}
              className="text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Select All Tests for Case {c.caseNo} ({caseTests.length})
            </Label>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Select tests to bulk print report slips
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="h-7 bg-slate-50">
              <TableHead className="text-[11px] w-12 text-center">
                Print
              </TableHead>
              <TableHead className="text-[11px] font-semibold">
                Test Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold">
                Test Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold">
                Approval / Non-Approval Comment
              </TableHead>
              <TableHead className="text-[11px] font-semibold w-24 text-center">
                Is Printed
              </TableHead>
              <TableHead className="text-[11px] font-semibold w-24 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {caseTests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-xs text-muted-foreground py-4"
                >
                  No tests assigned to this case.
                </TableCell>
              </TableRow>
            ) : (
              caseTests.map((test) => {
                const isChecked = !!checkedTests[test.id];
                const approvalComment = getApprovalComment(test);

                return (
                  <TableRow
                    key={test.id}
                    className="h-8 hover:bg-slate-50/50"
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckTest(test, c, !!checked)
                        }
                      />
                    </TableCell>

                    <TableCell className="text-xs font-medium">
                      {test.testName}
                    </TableCell>

                    <TableCell className="text-xs">
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

                    <TableCell className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {test.testStatus === "Approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      ) : test.rejectReason || test.sampleStatus === "Rejected" ? (
                        <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      )}
                      <span>{approvalComment}</span>
                    </TableCell>

                    <TableCell className="text-center">
                      {test.isPrinted ? (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-green-600 text-green-700 bg-green-50"
                        >
                          Yes
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-slate-300 text-slate-500 bg-slate-50"
                        >
                          No
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintSingleTest(test, c);
                        }}
                        disabled={printLoading}
                      >
                        <Printer className="h-3 w-3 mr-1 text-sky-700" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
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

      {/* Top Filter Bar */}
      <Card className="shadow-sm border border-border/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 flex-1 min-w-[180px]">
              <Label className="text-xs font-medium text-muted-foreground">
                Lab No / Case No
              </Label>
              <Input
                placeholder="Search Case No (e.g. 0826-001)..."
                value={caseNoSearch}
                onChange={(e) => setCaseNoSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchCases();
                }}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1 min-w-[160px]">
              <Label className="text-xs font-medium text-muted-foreground">
                From Date
              </Label>
              <Input
                type="datetime-local"
                value={dtFrom}
                onChange={(e) => setDtFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1 min-w-[160px]">
              <Label className="text-xs font-medium text-muted-foreground">
                To Date
              </Label>
              <Input
                type="datetime-local"
                value={dtTo}
                onChange={(e) => setDtTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1 min-w-[140px]">
              <Label className="text-xs font-medium text-muted-foreground">
                Case Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="InProcess">InProcess</SelectItem>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              className="h-8 px-4 font-medium"
              onClick={fetchCases}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5 mr-1.5" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Parent DataTable */}
      <Card className="shadow-sm border border-border/50 overflow-hidden">
        <CardHeader className="px-4 py-2 bg-sky-50 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Patient Lab Reports ({cases.length} Cases)
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Click arrow button to expand test details
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <DataTable
            columns={columns}
            data={cases}
            filterColumn="caseNo"
            renderSubComponent={renderSubComponent}
          />
        </CardContent>
      </Card>

      {/* Bottom Bulk Action Bar */}
      <div className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
        <div className="text-xs text-muted-foreground">
          {totalCheckedTestsCount > 0 ? (
            <span className="font-semibold text-sky-800">
              {totalCheckedTestsCount} test(s) checked across selected cases for bulk printing.
            </span>
          ) : (
            "Check tests in the expanded tables to enable bulk printing."
          )}
        </div>

        <Button
          size="sm"
          className="h-9 px-5 bg-sky-700 hover:bg-sky-800 text-white font-medium"
          onClick={handlePrintCheckedTests}
          disabled={totalCheckedTestsCount === 0 || printLoading}
        >
          {printLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Printer className="h-4 w-4 mr-2" />
          )}
          Print Checked Tests ({totalCheckedTestsCount})
        </Button>
      </div>

      {/* Hidden Print Container for Direct Browser Printing */}
      <div className="hidden">
        <div ref={printContentRef} className="text-black bg-white">
          {printData.map((caseGroup, caseIdx) => (
            <div
              key={caseGroup.caseObj?.id || caseIdx}
              className={`min-h-[297mm] flex flex-col justify-between p-6 bg-white space-y-4 text-black ${
                caseIdx > 0 ? "page-break-before" : ""
              }`}
            >
              {/* Top Section: Header & All Case Tests */}
              <div className="space-y-3">
                {/* Top Header - Rendered ONCE per case */}
                <LabHeader caseData={caseGroup.caseObj} settings={outputSettings} />

                {/* Static Table Column Header - Rendered ONCE right below patient details */}
                <div className="border-y-2 border-black bg-gray-100/90 py-1.5 px-3 grid grid-cols-12 text-xs font-bold text-black uppercase tracking-wider">
                  <div className="col-span-5">Test Name</div>
                  <div className="col-span-2">Result</div>
                  <div className="col-span-2">Units</div>
                  <div className="col-span-3">Reference Range</div>
                </div>

                {/* Sequential List of Tests Grouped by Header & PerformedAt */}
                <div className="space-y-4 pt-1">
                  {groupTestsByHeaderAndPerformedAt(caseGroup.tests).map(
                    (headerGroup, hIdx) => {
                      const subHeaderGroups = groupParametersBySubHeader(
                        headerGroup.testItems
                      );
                      const firstTest = headerGroup.testItems[0]?.testObj;

                      return (
                        <div key={hIdx} className="space-y-1">
                          <LabTestBarcodeStamp
                            testName={headerGroup.headerName}
                            caseNo={caseGroup.caseObj?.caseNo}
                            testId={firstTest?.id}
                            approvedAt={
                              headerGroup.performedAt || firstTest?.approvedAt
                            }
                            settings={outputSettings}
                          />

                          <div className="border border-gray-300 text-xs divide-y divide-gray-200">
                            {subHeaderGroups.length === 0 ||
                            subHeaderGroups.every(
                              (g) => g.parameters.length === 0
                            ) ? (
                              <div className="text-center text-gray-500 py-2">
                                No result parameters recorded for this test.
                              </div>
                            ) : (
                              subHeaderGroups.map((subGroup, sIdx) => (
                                <React.Fragment key={sIdx}>
                                  {subGroup.subHeaderName ? (
                                    <div className="bg-gray-100/80 font-bold text-xs text-black uppercase tracking-wide py-1 px-3 border-b border-gray-300">
                                      {subGroup.subHeaderName}
                                    </div>
                                  ) : null}

                                  {subGroup.parameters.map((p, pIdx) => (
                                    <div
                                      key={p.id || pIdx}
                                      className="grid grid-cols-12 py-1 px-3 items-center hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0 text-[11px]"
                                    >
                                      <div
                                        className={`col-span-5 font-medium text-slate-900 ${
                                          subGroup.subHeaderName ? "pl-4" : ""
                                        }`}
                                      >
                                        {p.parameterName}
                                      </div>
                                      <div className="col-span-2 font-bold text-black">
                                        {p.result || "-"}
                                      </div>
                                      <div className="col-span-2 text-slate-700">
                                        {p.units || "-"}
                                      </div>
                                      <div className="col-span-3 text-slate-700">
                                        {stripHtml(p.normalRange) || "-"}
                                      </div>
                                    </div>
                                  ))}
                                </React.Fragment>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Bottom Section: Footer - Rendered ONCE per case at page bottom */}
              <div className="pt-4">
                <LabFooter settings={outputSettings} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
