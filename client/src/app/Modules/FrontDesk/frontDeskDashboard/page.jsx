"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Calendar,
  CreditCard,
  Receipt,
  Search,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import patientVisitService from "@/services/patientVisitService";
import patientPaymentService from "@/services/patientPaymentService";
import patientService from "@/services/patient.service";
import billingService from "@/services/billing.service";
import { formatDate, toLocalISOString } from "@/lib/utils";

export default function FrontDeskDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter States for Recent Visits Table
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Metrics State
  const [stats, setStats] = useState({
    todayRegistrations: 0,
    todayVisits: 0,
    todayBillingTotal: 0,
    todayCollections: 0,
  });

  // Recent Data States
  const [recentVisits, setRecentVisits] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const fromDate = toLocalISOString(startOfDay);
      const toDate = toLocalISOString(endOfDay);

      // Fetch Patient Visits, Payments, Patients & Billings in parallel
      const [visitsRes, paymentsRes, patientsRes, billingsRes] =
        await Promise.allSettled([
          patientVisitService.getAll({ fromDate, toDate }),
          patientPaymentService.getAll({ fromDate, toDate }),
          patientService.getAll({ limit: 10 }),
          billingService.getAll({ fromDate, toDate }),
        ]);

      // Process Visits Data
      const visitsList =
        visitsRes.status === "fulfilled" ? visitsRes.value.data || [] : [];
      const totalVisitsCount = Array.isArray(visitsList)
        ? visitsList.length
        : visitsList.total || 0;
      const visitsArray = Array.isArray(visitsList)
        ? visitsList
        : visitsList.data || [];

      // Process Payments Data
      const paymentsList =
        paymentsRes.status === "fulfilled"
          ? paymentsRes.value.data || []
          : [];
      const paymentsArray = Array.isArray(paymentsList)
        ? paymentsList
        : paymentsList.data || [];

      const totalCollectionsSum = paymentsArray.reduce((acc, curr) => {
        const amt = parseFloat(curr.AmountPaid || curr.amount || curr.Paid || 0);
        return acc + (isNaN(amt) ? 0 : amt);
      }, 0);

      // Process Patients Data
      const patientsList =
        patientsRes.status === "fulfilled"
          ? patientsRes.value.data || []
          : [];
      const patientsArray = Array.isArray(patientsList)
        ? patientsList
        : patientsList.data || [];

      // Process Billings Data
      const billingsList =
        billingsRes.status === "fulfilled"
          ? billingsRes.value.data || []
          : [];
      const billingsArray = Array.isArray(billingsList)
        ? billingsList
        : billingsList.data || [];

      const totalBillingSum = billingsArray.reduce((acc, curr) => {
        const amt = parseFloat(curr.TotalAmount || curr.netAmount || curr.SubTotal || 0);
        return acc + (isNaN(amt) ? 0 : amt);
      }, 0);

      // Calculate Department Breakdown
      const deptCounts = {};
      visitsArray.forEach((v) => {
        const dName =
          v.departmentName || v.department?.name || v.DeptName || "General OPD";
        deptCounts[dName] = (deptCounts[dName] || 0) + 1;
      });

      const breakdown = Object.keys(deptCounts).map((dept) => ({
        name: dept,
        count: deptCounts[dept],
      }));

      setStats({
        todayRegistrations: patientsArray.length,
        todayVisits: totalVisitsCount,
        todayBillingTotal: totalBillingSum,
        todayCollections: totalCollectionsSum,
      });

      setRecentVisits(visitsArray.slice(0, 8));
      setRecentPayments(paymentsArray.slice(0, 5));
      setDeptBreakdown(breakdown.slice(0, 5));
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError("Failed to synchronize live front desk dashboard metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filtered Visits computed list
  const filteredVisits = recentVisits.filter((v) => {
    const matchSearch =
      !searchTerm.trim() ||
      (v.visitNo && v.visitNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.patientName && v.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.mrn && v.mrn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.doctorName && v.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchDept =
      deptFilter === "All" ||
      (v.departmentName && v.departmentName === deptFilter) ||
      (v.department?.name && v.department.name === deptFilter);

    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-5 max-w-full mx-auto">
      {/* Top Banner / Welcome Bar */}
      <Card className="border shadow-xs bg-linear-to-r from-blue-900 via-sky-800 to-sky-950 text-white overflow-hidden">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[10px] px-2 py-0.5">
                <Clock className="h-3 w-3 mr-1 text-sky-300" />
                Live Desk Station
              </Badge>
              <span className="text-xs text-sky-200 font-mono">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Hospital Front Desk Reception & Counter Operations
            </h1>
            <p className="text-xs text-sky-100 max-w-2xl">
              Central reception desk for patient registrations, visit queues, OPD doctor consultations, billings, and payment receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white font-medium"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/Modules/FrontDesk/patientRegistration">
              <Button size="sm" className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                + New Patient
              </Button>
            </Link>
            <Link href="/Modules/FrontDesk/patientVisits">
              <Button size="sm" className="h-8 text-xs bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-xs">
                <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
                + New Visit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Registrations */}
        <Card className="shadow-xs border-slate-200 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Today Registrations
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <Skeleton className="h-8 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {stats.todayRegistrations}
                </span>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> Today
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500">
              New patient files created today
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 2: Today's Visits */}
        <Card className="shadow-xs border-slate-200 border-l-4 border-l-sky-500 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Today Patient Visits
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Stethoscope className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <Skeleton className="h-8 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {stats.todayVisits}
                </span>
                <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200 font-semibold">
                  <Clock className="h-3 w-3 mr-0.5" /> Active Queue
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500">
              Total OPD & emergency consultations
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 3: Today's Total Billing */}
        <Card className="shadow-xs border-slate-200 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Today Invoiced Total
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">
                  Rs. {stats.todayBillingTotal.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 font-semibold">
                  Billed
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500">
              Total billings created at counter
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 4: Today's Cash Collections */}
        <Card className="shadow-xs border-slate-200 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Today Cash Collections
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <Skeleton className="h-8 w-28 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">
                  Rs. {stats.todayCollections.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  Collected
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500">
              Total cash & advance payments received
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Modules Bar */}
      <Card className="shadow-xs border bg-slate-50/50">
        <CardHeader className="px-4 py-3 border-b bg-white">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span>Front Desk Service Short-Cuts</span>
            <span className="text-[11px] text-muted-foreground font-normal">Click to open counter module</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Link href="/Modules/FrontDesk/patientRegistration">
              <div className="p-3 bg-white border rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Registration
                </p>
                <p className="text-[10px] text-slate-500">Add Patient</p>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/patientVisits">
              <div className="p-3 bg-white border rounded-lg hover:border-sky-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-sky-100 text-sky-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                  Visits Queue
                </p>
                <p className="text-[10px] text-slate-500">Book Doctor Visit</p>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/billing">
              <div className="p-3 bg-white border rounded-lg hover:border-amber-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                  Billing Counter
                </p>
                <p className="text-[10px] text-slate-500">Create Invoices</p>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/patientPayments">
              <div className="p-3 bg-white border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                  Payments
                </p>
                <p className="text-[10px] text-slate-500">Receive Cash</p>
              </div>
            </Link>

            <Link href="/Modules/laboratory/patientReports">
              <div className="p-3 bg-white border rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                  Lab Reports
                </p>
                <p className="text-[10px] text-slate-500">Print Results</p>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/collectionReports">
              <div className="p-3 bg-white border rounded-lg hover:border-slate-500 hover:shadow-sm transition-all group cursor-pointer text-center space-y-1.5">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-slate-700">
                  Collection
                </p>
                <p className="text-[10px] text-slate-500">Day Summary</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Section: Recent Visits Table (8 Cols) + Right Widgets (4 Cols) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column: Recent Patient Visits (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card className="shadow-xs border">
            <CardHeader className="px-4 py-3 bg-slate-50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Today Patient Visits Queue
                </CardTitle>
                <CardDescription className="text-[11px] mt-0.5">
                  Recent patient tokens, assigned doctors, and consultation status
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search name, MRN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 text-xs bg-white"
                  />
                </div>

                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 text-xs w-36 bg-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Depts</SelectItem>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Users className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No patient visits found for selected filter.</p>
                  <p className="text-[11px] text-slate-400">Click "+ New Visit" to register a patient consultation.</p>
                </div>
              ) : (
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="h-8">
                      <TableHead className="font-bold text-slate-700">Token / Visit No</TableHead>
                      <TableHead className="font-bold text-slate-700">Patient</TableHead>
                      <TableHead className="font-bold text-slate-700">MRN</TableHead>
                      <TableHead className="font-bold text-slate-700">Doctor / Dept</TableHead>
                      <TableHead className="font-bold text-slate-700">Time</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((v, idx) => (
                      <TableRow key={v.id || idx} className="h-9 hover:bg-slate-50/80">
                        <TableCell className="font-mono font-bold text-slate-900">
                          {v.visitNo || `VT-${idx + 1}`}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">
                            {v.patientName || v.patient?.pName || "Walk-in Patient"}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {v.mobile || v.patient?.mobile || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-slate-600">
                          {v.mrn || v.patient?.mrn || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800">
                            {v.doctorName || v.doctor?.Name || "Duty Doctor"}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-slate-300 text-slate-600 bg-slate-50"
                          >
                            {v.departmentName || v.department?.name || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px]">
                          {v.visitDate
                            ? v.visitDate.replace("T", " ").substring(11, 16)
                            : "Just Now"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/Modules/FrontDesk/billing?mrn=${v.mrn || ""}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-sky-700 hover:text-sky-900 hover:bg-sky-50 px-2">
                              Bill <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column Widgets (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Department Breakdown Widget */}
          <Card className="shadow-xs border">
            <CardHeader className="px-4 py-3 bg-slate-50 border-b">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Visits by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {deptBreakdown.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No visits recorded today.</p>
              ) : (
                deptBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.count} Patients</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.count / Math.max(1, stats.todayVisits)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Collections Stream Widget */}
          <Card className="shadow-xs border">
            <CardHeader className="px-4 py-3 bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Recent Cash Receipts
              </CardTitle>
              <Link href="/Modules/FrontDesk/patientPayments">
                <Button size="sm" variant="link" className="h-auto p-0 text-[11px] text-blue-600">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              {recentPayments.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  <Receipt className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                  <p>No payment receipts today.</p>
                </div>
              ) : (
                recentPayments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-2 border rounded-md bg-white hover:bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">
                        {p.patientName || p.patient?.pName || `Rec #${p.ReceiptNo || idx + 101}`}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {p.PaymentMode || "Cash"} • {p.mrn || "MRN-N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-xs">
                        +Rs. {parseFloat(p.AmountPaid || p.amount || 0).toLocaleString()}
                      </span>
                      <p className="text-[9px] text-slate-400">
                        {p.created_at ? p.created_at.substring(11, 16) : "Today"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
