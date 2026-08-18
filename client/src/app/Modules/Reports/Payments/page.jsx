"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Printer, Search, RefreshCw, DollarSign, Wallet, PieChart, Users, AlertCircle } from "lucide-react";
import reportService from "@/services/report.service";
import userService from "@/services/user.service";
import departmentService from "@/services/department.service";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function PaymentCollectionReportsPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [fromDate, setFromDate] = useState(toLocalISOString(todayStart));
  const [toDate, setToDate] = useState(toLocalISOString(todayEnd));
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [activeTab, setActiveTab] = useState("user-summary");

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Report States
  const [userSummary, setUserSummary] = useState({ data: [], totals: {} });
  const [deptSummary, setDeptSummary] = useState({ data: [], grand_total: 0 });
  const [patientDues, setPatientDues] = useState({ data: [], total_due_balance: 0, total_count: 0 });
  const [dueSearch, setDueSearch] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadInitialData = async () => {
      try {
        const [userRes, deptRes] = await Promise.all([
          userService.getAll().catch(() => ({ data: [] })),
          departmentService.getAll().catch(() => ({ data: [] })),
        ]);
        if (!isCancelled) {
          setUsers(Array.isArray(userRes.data) ? userRes.data : []);
          setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const fDate = fromDate ? fromDate.replace("T", " ") : "";
      const tDate = toDate ? toDate.replace("T", " ") : "";

      if (activeTab === "user-summary") {
        const params = { fromDate: fDate, toDate: tDate };
        if (selectedUser !== "all") params.userId = selectedUser;
        const res = await reportService.getPaymentSummary(params);
        setUserSummary(res.data);
      } else if (activeTab === "dept-summary") {
        const params = { fromDate: fDate, toDate: tDate };
        if (selectedDept !== "all") params.departmentId = selectedDept;
        const res = await reportService.getDepartmentRevenue(params);
        setDeptSummary(res.data);
      } else if (activeTab === "patient-dues") {
        const params = { fromDate: fDate, toDate: tDate };
        if (dueSearch.trim()) params.search = dueSearch.trim();
        const res = await reportService.getPatientDues(params);
        setPatientDues(res.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load report data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadReports = async () => {
      setLoading(true);
      try {
        const fDate = fromDate ? fromDate.replace("T", " ") : "";
        const tDate = toDate ? toDate.replace("T", " ") : "";

        if (activeTab === "user-summary") {
          const params = { fromDate: fDate, toDate: tDate };
          if (selectedUser !== "all") params.userId = selectedUser;
          const res = await reportService.getPaymentSummary(params);
          if (!isCancelled) setUserSummary(res.data);
        } else if (activeTab === "dept-summary") {
          const params = { fromDate: fDate, toDate: tDate };
          if (selectedDept !== "all") params.departmentId = selectedDept;
          const res = await reportService.getDepartmentRevenue(params);
          if (!isCancelled) setDeptSummary(res.data);
        } else if (activeTab === "patient-dues") {
          const params = { fromDate: fDate, toDate: tDate };
          if (dueSearch.trim()) params.search = dueSearch.trim();
          const res = await reportService.getPatientDues(params);
          if (!isCancelled) setPatientDues(res.data);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setMessage({ type: "error", text: "Failed to load report data." });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadReports();

    return () => {
      isCancelled = true;
    };
  }, [fromDate, toDate, selectedUser, selectedDept, activeTab]);

  const setPresetDate = (type) => {
    const now = new Date();
    if (type === "today") {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      setFromDate(toLocalISOString(start));
      setToDate(toLocalISOString(end));
    } else if (type === "yesterday") {
      const yStart = new Date();
      yStart.setDate(yStart.getDate() - 1);
      yStart.setHours(0, 0, 0, 0);

      const yEnd = new Date();
      yEnd.setDate(yEnd.getDate() - 1);
      yEnd.setHours(23, 59, 59, 999);

      setFromDate(toLocalISOString(yStart));
      setToDate(toLocalISOString(yEnd));
    } else if (type === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      setFromDate(toLocalISOString(start));
      setToDate(toLocalISOString(end));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Payment Collections & Revenue Reports
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor daily cashier collections, department revenue split, and patient balance dues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1" /> Print Report
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <Card className="shadow-xs border border-slate-200">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs font-semibold">From Date & Time</Label>
              <Input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs font-semibold">To Date & Time</Label>
              <Input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {activeTab === "user-summary" && (
              <div className="md:col-span-3 space-y-1">
                <Label className="text-xs font-semibold">Cashier / User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="All Cashiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cashiers</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "dept-summary" && (
              <div className="md:col-span-3 space-y-1">
                <Label className="text-xs font-semibold">Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.DepartmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === "patient-dues" && (
              <div className="md:col-span-3 space-y-1">
                <Label className="text-xs font-semibold">Search Patient / MRN / Bill #</Label>
                <div className="flex gap-1">
                  <Input
                    placeholder="Search..."
                    value={dueSearch}
                    onChange={(e) => setDueSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchReports()}
                    className="h-8 text-xs"
                  />
                  <Button size="sm" className="h-8 px-2" onClick={fetchReports}>
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="md:col-span-3 flex gap-1 items-center">
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-2 flex-1" onClick={() => setPresetDate("today")}>
                Today
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-2 flex-1" onClick={() => setPresetDate("yesterday")}>
                Yesterday
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[11px] px-2 flex-1" onClick={() => setPresetDate("thisMonth")}>
                This Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation Buttons */}
      <div className="flex items-center gap-1 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("user-summary")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "user-summary"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Cashier Collections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dept-summary")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "dept-summary"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <PieChart className="h-3.5 w-3.5" /> Dept Revenue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("patient-dues")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "patient-dues"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Wallet className="h-3.5 w-3.5" /> Patient Dues
        </button>
      </div>

      {/* 1. Cashier Collection Summary */}
      {activeTab === "user-summary" && (
        <Card>
          <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700">Cashier / User Collection Summary</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-white">
              Total Received: PKR {userSummary.totals?.total_received?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="h-8 bg-slate-100/60">
                  <TableHead className="text-xs font-semibold">Cashier / User</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Invoices</TableHead>
                  <TableHead className="text-xs font-semibold text-right">SubTotal (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Discount (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Net Bill (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-emerald-700">Cash (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-blue-700">Card (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-purple-700">Online (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-rose-700">Due Balance (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !userSummary.data || userSummary.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                      No collection records found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  userSummary.data.map((row, idx) => (
                    <TableRow key={`${row.user_id || "user"}-${idx}`} className="h-9 hover:bg-slate-50">
                      <TableCell className="text-xs font-medium text-slate-800">{row.user_name}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{row.invoice_count}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.sub_total.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-amber-700">{row.discount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold">{row.net_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold text-emerald-700">{row.cash_received.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-blue-700">{row.card_received.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-purple-700">{row.online_received.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold text-rose-600">{row.due_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {userSummary.data && userSummary.data.length > 0 && (
                <TableHeader>
                  <TableRow className="h-9 bg-slate-100 font-bold">
                    <TableCell className="text-xs">TOTAL</TableCell>
                    <TableCell className="text-xs text-center font-mono">{userSummary.totals?.total_invoices}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{userSummary.totals?.total_sub?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-amber-700">{userSummary.totals?.total_discount?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{userSummary.totals?.total_net?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-700">{userSummary.totals?.total_cash?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-blue-700">{userSummary.totals?.total_card?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-purple-700">{userSummary.totals?.total_online?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-rose-600">{userSummary.totals?.total_due?.toFixed(2)}</TableCell>
                  </TableRow>
                </TableHeader>
              )}
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 2. Department Revenue Breakdown */}
      {activeTab === "dept-summary" && (
        <Card>
          <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700">Department Revenue Distribution</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-white">
              Grand Total: PKR {deptSummary.grand_total?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="h-8 bg-slate-100/60">
                  <TableHead className="text-xs font-semibold">Department Name</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Invoices</TableHead>
                  <TableHead className="text-xs font-semibold text-right">SubTotal (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Discount (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Net Revenue (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Contribution %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !deptSummary.data || deptSummary.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No department revenue records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  deptSummary.data.map((row, idx) => (
                    <TableRow key={idx} className="h-9 hover:bg-slate-50">
                      <TableCell className="text-xs font-medium text-slate-800">{row.department_name}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{row.invoice_count}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.sub_total.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-amber-700">{row.discount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-semibold text-emerald-700">{row.net_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-center font-mono">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700">
                          {row.revenue_percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 3. Patient Outstanding Dues */}
      {activeTab === "patient-dues" && (
        <Card>
          <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700">Patient Balance Dues Report</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] bg-white">
                Total Patients: {patientDues.total_count || 0}
              </Badge>
              <Badge className="font-mono text-[10px] bg-rose-600 text-white">
                Total Due: PKR {patientDues.total_due_balance?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="h-8 bg-slate-100/60">
                  <TableHead className="text-xs font-semibold">Invoice No</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">MRN</TableHead>
                  <TableHead className="text-xs font-semibold">Patient Name</TableHead>
                  <TableHead className="text-xs font-semibold">Mobile</TableHead>
                  <TableHead className="text-xs font-semibold">Doctor / Dept</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Total Bill (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Paid (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-rose-700">Balance Due (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !patientDues.data || patientDues.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                      No outstanding balance dues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  patientDues.data.map((row) => (
                    <TableRow key={row.billing_id} className="h-9 hover:bg-slate-50">
                      <TableCell className="text-xs font-mono font-medium text-slate-800">{row.invoice_no}</TableCell>
                      <TableCell className="text-xs font-mono">{new Date(row.invoice_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">{row.mrn}</TableCell>
                      <TableCell className="text-xs font-medium">{row.patient_name}</TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">{row.mobile}</TableCell>
                      <TableCell className="text-xs text-slate-600">{row.doctor_name} / {row.department_name}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-emerald-700">{row.paid_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-rose-600">{row.due_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
