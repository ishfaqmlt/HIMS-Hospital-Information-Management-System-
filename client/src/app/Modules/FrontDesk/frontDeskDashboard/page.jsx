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
  Activity,
  DollarSign,
  UserCheck,
  Zap,
  Sparkles,
  RotateCcw,
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
    todayReturnedTotal: 0,
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

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayDateStr = `${year}-${month}-${day}`;

      const fromDate = `${todayDateStr}T00:00:00`;
      const toDate = `${todayDateStr}T23:59:59`;

      // Fetch Patient Visits, Payments, Patients & Billings in parallel filtered strictly by today
      const [visitsRes, paymentsRes, patientsRes, billingsRes] =
        await Promise.allSettled([
          patientVisitService.getAll({ today: true, fromDate, toDate }),
          patientPaymentService.getAll({ today: true, fromDate, toDate, dtFrom: fromDate, dtTo: toDate }),
          patientService.getAll({ today: true, fromDate, toDate }),
          billingService.getAll({ today: true, fromDate, toDate }),
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
        const debit = parseFloat(curr.debit || curr.AmountPaid || curr.amount || curr.Paid || 0);
        const credit = parseFloat(curr.credit || 0);
        return acc + (isNaN(debit) ? 0 : debit) - (isNaN(credit) ? 0 : credit);
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
        if (curr.BillType !== "Return") {
          const amt = parseFloat(curr.TotalAmount || curr.netAmount || curr.SubTotal || 0);
          return acc + (isNaN(amt) ? 0 : amt);
        }
        return acc;
      }, 0);

      const totalReturnedSum = billingsArray.reduce((acc, curr) => {
        if (curr.BillType === "Return") {
          const amt = parseFloat(curr.TotalAmount || curr.netAmount || curr.SubTotal || 0);
          return acc + (isNaN(amt) ? 0 : amt);
        }
        return acc;
      }, 0);

      const totalRefundsFromPayments = paymentsArray.reduce((acc, curr) => acc + (parseFloat(curr.credit || 0) || 0), 0);
      const finalReturnedTotal = Math.max(totalReturnedSum, totalRefundsFromPayments);

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
        todayReturnedTotal: finalReturnedTotal,
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
    <div className="space-y-6 max-w-full mx-auto p-1">
      {/* Top Banner / Premium Header Bar */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden rounded-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <CardContent className="p-6 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 text-xs px-2.5 py-0.5 font-semibold backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 mr-1 text-sky-400 animate-pulse" />
                Live Reception Hub
              </Badge>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Hospital Front Desk & Reception Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Central reception control station for real-time patient registrations, visit queues, OPD doctor consultations, invoicing, and counter cash collections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white font-semibold backdrop-blur-sm transition-all"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Link href="/Modules/FrontDesk/patientRegistration">
              <Button size="sm" className="h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-md transition-all">
                <UserPlus className="h-4 w-4 mr-1.5" />
                + New Patient
              </Button>
            </Link>
            <Link href="/Modules/FrontDesk/patientVisits">
              <Button size="sm" className="h-9 text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-md transition-all">
                <Stethoscope className="h-4 w-4 mr-1.5" />
                + New Visit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-xl shadow-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Top 5 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Today's Registrations */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-background border-l-4 border-l-emerald-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              Today Registrations
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.todayRegistrations}
                </span>
                <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold border-0 px-2 py-0.5">
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-600" /> New Files
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              New patient records registered today
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 2: Today's Visits */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-sky-500/10 via-sky-50/40 to-white dark:from-sky-950/20 dark:to-background border-l-4 border-l-sky-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
              Today Patient Visits
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.todayVisits}
                </span>
                <Badge className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 font-bold border-0 px-2 py-0.5">
                  <Clock className="h-3 w-3 mr-1 text-sky-600" /> Active Queue
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Total OPD & emergency consultations
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 3: Today's Total Billing */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white dark:from-amber-950/20 dark:to-background border-l-4 border-l-amber-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Today Invoiced Total
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-28 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rs. {stats.todayBillingTotal.toLocaleString()}
                </span>
                <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-bold border-0 px-2 py-0.5">
                  Billed
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Total counter billings created
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 4: Today Returned */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-rose-500/10 via-rose-50/40 to-white dark:from-rose-950/20 dark:to-background border-l-4 border-l-rose-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
              Today Returned
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-28 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rs. {stats.todayReturnedTotal.toLocaleString()}
                </span>
                <Badge className="text-[10px] bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 font-bold border-0 px-2 py-0.5">
                  Returned
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Total invoice return refunds
            </CardDescription>
          </CardContent>
        </Card>

        {/* Metric 4: Today's Cash Collections */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-500/10 via-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-background border-l-4 border-l-indigo-600 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
              Today Cash Collections
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-28 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Rs. {stats.todayCollections.toLocaleString()}
                </span>
                <Badge className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 font-bold border-0 px-2 py-0.5">
                  Collected
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Total cash & advance payments received
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Modules Bar */}
      <Card className="border-0 shadow-md bg-white dark:bg-card rounded-2xl overflow-hidden">
        <CardHeader className="px-5 py-3.5 border-b bg-slate-50/80 dark:bg-slate-900/50">
          <CardTitle className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Front Desk Quick Action Launchpad
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">Direct access to counter modules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            <Link href="/Modules/FrontDesk/patientRegistration">
              <div className="p-3.5 bg-slate-50/70 hover:bg-emerald-50/80 dark:bg-slate-900/40 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    Registration
                  </p>
                  <p className="text-[10px] text-slate-500">Add Patient</p>
                </div>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/patientVisits">
              <div className="p-3.5 bg-slate-50/70 hover:bg-sky-50/80 dark:bg-slate-900/40 dark:hover:bg-sky-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-sky-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-400">
                    Visits Queue
                  </p>
                  <p className="text-[10px] text-slate-500">Book Doctor Visit</p>
                </div>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/billing">
              <div className="p-3.5 bg-slate-50/70 hover:bg-amber-50/80 dark:bg-slate-900/40 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                    Billing Counter
                  </p>
                  <p className="text-[10px] text-slate-500">Create Invoices</p>
                </div>
              </div>
            </Link>

            <Link href="/Modules/FrontDesk/patientPayments">
              <div className="p-3.5 bg-slate-50/70 hover:bg-indigo-50/80 dark:bg-slate-900/40 dark:hover:bg-indigo-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                    Payments
                  </p>
                  <p className="text-[10px] text-slate-500">Receive Cash</p>
                </div>
              </div>
            </Link>

            <Link href="/Modules/laboratory/patientReports">
              <div className="p-3.5 bg-slate-50/70 hover:bg-purple-50/80 dark:bg-slate-900/40 dark:hover:bg-purple-950/30 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-purple-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                    Lab Reports
                  </p>
                  <p className="text-[10px] text-slate-500">Print Results</p>
                </div>
              </div>
            </Link>

            <Link href="/Modules/Reports/Reception/invoice">
              <div className="p-3.5 bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-slate-400 hover:shadow-md transition-all group cursor-pointer text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    Reports
                  </p>
                  <p className="text-[10px] text-slate-500">Invoice Search</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid Section: Recent Visits Table (8 Cols) + Right Widgets (4 Cols) */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column: Recent Patient Visits (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-5">
          <Card className="border-0 shadow-md bg-white dark:bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-5 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Today Patient Visits Queue
                </CardTitle>
                <CardDescription className="text-[11px] mt-0.5">
                  Live tokens, patient details, consulting doctor & quick billing trigger
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
                    className="h-8 pl-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>

                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 text-xs w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                <div className="p-5 space-y-3">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">No patient visits recorded for selected filter.</p>
                  <p className="text-[11px] text-slate-400">Click "+ New Visit" to register a patient consultation.</p>
                </div>
              ) : (
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50/90 dark:bg-slate-900/80">
                    <TableRow className="h-9 border-b border-slate-200/80 dark:border-slate-800">
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300">Visit / Token No</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300">Patient Name</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300">MRN</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300">Doctor / Dept</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300">Time</TableHead>
                      <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((v, idx) => (
                      <TableRow key={v.id || idx} className="h-10 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          {v.visitNo || `VT-${idx + 1}`}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {v.patientName || v.patient?.pName || "Walk-in Patient"}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {v.mobile || v.patient?.mobile || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-slate-600 dark:text-slate-400 font-medium">
                          {v.mrn || v.patient?.mrn || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {v.doctorName || v.doctor?.Name || "Duty Doctor"}
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-sky-200 text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 font-semibold"
                          >
                            {v.departmentName || v.department?.name || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px] font-mono">
                          {v.visitDate
                            ? v.visitDate.replace("T", " ").substring(11, 16)
                            : "Just Now"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/Modules/FrontDesk/billing?mrn=${v.mrn || ""}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-sky-700 dark:text-sky-400 hover:text-sky-900 hover:bg-sky-100/60 dark:hover:bg-sky-950 px-2.5 font-bold">
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
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Department Breakdown Widget */}
          <Card className="border-0 shadow-md bg-white dark:bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/50 border-b">
              <CardTitle className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Visits by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              {deptBreakdown.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No visits recorded today.</p>
              ) : (
                deptBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {item.count} Patients
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
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
          <Card className="border-0 shadow-md bg-white dark:bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Recent Counter Receipts
              </CardTitle>
              <Link href="/Modules/FrontDesk/patientPayments">
                <Button size="sm" variant="link" className="h-auto p-0 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs">
              {recentPayments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 space-y-1">
                  <Receipt className="h-7 w-7 mx-auto text-slate-300 dark:text-slate-700" />
                  <p>No payment receipts today.</p>
                </div>
              ) : (
                recentPayments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-colors flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        {p.patientName || p.patient?.pName || `Rec #${p.ReceiptNo || idx + 101}`}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {p.PaymentMode || "Cash"} • {p.mrn || "MRN-N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                        +Rs. {parseFloat(p.debit || p.AmountPaid || p.amount || 0).toLocaleString()}
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono">
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

