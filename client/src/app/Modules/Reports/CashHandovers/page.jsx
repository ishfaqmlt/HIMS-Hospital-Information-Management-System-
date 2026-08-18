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
import { Loader2, Printer, Search, RefreshCw, Wallet, CheckCircle2, XCircle, AlertCircle, Calendar, UserCheck, ShieldCheck } from "lucide-react";
import cashHandoverService from "@/services/cashHandover.service";
import userService from "@/services/user.service";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function CashHandoverAuditPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [fromDate, setFromDate] = useState(toLocalISOString(todayStart));
  const [toDate, setToDate] = useState(toLocalISOString(todayEnd));
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState(null);

  const [handovers, setHandovers] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadHandovers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (fromDate) params.fromDate = fromDate.replace("T", " ");
        if (toDate) params.toDate = toDate.replace("T", " ");
        if (selectedUser !== "all") params.userId = selectedUser;
        if (selectedStatus !== "all") params.status = selectedStatus;
        if (search.trim()) params.search = search.trim();

        const res = await cashHandoverService.getAll(params);
        if (!isCancelled) {
          setHandovers(res.data.data || []);
          setSummary(res.data.summary || {});
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setMessage({ type: "error", text: "Failed to load cash handovers." });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadHandovers();

    return () => {
      isCancelled = true;
    };
  }, [fromDate, toDate, selectedUser, selectedStatus]);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll().catch(() => ({ data: [] }));
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHandovers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate.replace("T", " ");
      if (toDate) params.toDate = toDate.replace("T", " ");
      if (selectedUser !== "all") params.userId = selectedUser;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await cashHandoverService.getAll(params);
      setHandovers(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load cash handovers." });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setActionId(id);
      await cashHandoverService.accept(id);
      setMessage({ type: "success", text: "Cash handover approved successfully!" });
      fetchHandovers();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to approve handover." });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionId(id);
      await cashHandoverService.reject(id);
      setMessage({ type: "success", text: "Cash handover rejected." });
      fetchHandovers();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to reject handover." });
    } finally {
      setActionId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Supervisor Shift Closure & Cash Handover Audit
          </h1>
          <p className="text-xs text-muted-foreground">
            Review cashier shift closures, verify physical cash vs expected system cash, and approve handovers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchHandovers} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1" /> Print Register
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-slate-50 border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500">Total Shift Handovers</span>
          <p className="text-xl font-black text-slate-800 font-mono mt-0.5">{summary.total_handovers || 0}</p>
        </Card>
        <Card className="p-3 bg-amber-50 border-amber-200">
          <span className="text-[10px] uppercase font-bold text-amber-700">Pending Supervisor Approvals</span>
          <p className="text-xl font-black text-amber-900 font-mono mt-0.5">{summary.pending_count || 0}</p>
        </Card>
        <Card className="p-3 bg-emerald-50 border-emerald-200">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Physical Cash Received</span>
          <p className="text-xl font-black text-emerald-900 font-mono mt-0.5">
            PKR {summary.total_physical_cash?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
          </p>
        </Card>
        <Card className="p-3 bg-rose-50 border-rose-200">
          <span className="text-[10px] uppercase font-bold text-rose-700">Net Variance</span>
          <p className={`text-xl font-black font-mono mt-0.5 ${summary.total_variance < 0 ? "text-rose-700" : "text-emerald-700"}`}>
            PKR {summary.total_variance?.toFixed(2) || "0.00"}
          </p>
        </Card>
      </div>

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

            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs font-semibold">Cashier</Label>
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

            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs font-semibold">Search # / Cashier</Label>
              <div className="flex gap-1">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchHandovers()}
                  className="h-8 text-xs"
                />
                <Button size="sm" className="h-8 px-2" onClick={fetchHandovers}>
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handovers Table */}
      <Card>
        <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold text-slate-700">Cash Handover Audit Log</CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] bg-white">
            Count: {handovers.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="h-8 bg-slate-100/60">
                <TableHead className="text-xs font-semibold">Handover #</TableHead>
                <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                <TableHead className="text-xs font-semibold">Cashier Name</TableHead>
                <TableHead className="text-xs font-semibold text-center">Shift</TableHead>
                <TableHead className="text-xs font-semibold text-right">Expected Cash</TableHead>
                <TableHead className="text-xs font-semibold text-right">Physical Cash</TableHead>
                <TableHead className="text-xs font-semibold text-center">Variance</TableHead>
                <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold">Approved By</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : handovers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                    No cash handover records found for the selected period.
                  </TableCell>
                </TableRow>
              ) : (
                handovers.map((row, idx) => (
                  <TableRow key={`${row.id}-${idx}`} className="h-9 hover:bg-slate-50">
                    <TableCell className="text-xs font-mono font-medium text-slate-800">{row.handoverNo}</TableCell>
                    <TableCell className="text-xs font-mono">{new Date(row.createdAt).toLocaleString("en-GB")}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-900">{row.cashierName}</TableCell>
                    <TableCell className="text-xs text-center font-medium">
                      <Badge variant="outline" className="text-[10px] bg-slate-50">
                        {row.shiftType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">{row.systemExpectedCash.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-bold text-emerald-700">{row.physicalCashCounted.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-center font-mono">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          row.varianceType === "Exact"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : row.varianceType === "Shortage"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-blue-50 text-blue-700 border-blue-300"
                        }`}
                      >
                        {row.varianceType === "Exact" ? "0.00" : row.varianceAmount.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center font-mono">
                      <Badge
                        className={`text-[10px] px-2 py-0 ${
                          row.status === "Accepted"
                            ? "bg-emerald-600 text-white"
                            : row.status === "Rejected"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">{row.supervisorName}</TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      {row.status === "Pending" ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAccept(row.id)}
                            disabled={actionId === row.id}
                          >
                            {actionId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-[11px] px-2"
                            onClick={() => handleReject(row.id)}
                            disabled={actionId === row.id}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-sans">Done 🔒</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
