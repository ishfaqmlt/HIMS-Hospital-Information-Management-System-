"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FlaskConical,
  TestTube,
  UserPlus,
  CheckCircle2,
  FileText,
  BarChart3,
  Settings,
  Clock,
  TrendingUp,
  Activity,
  ChevronRight,
  Beaker,
  Microscope,
  ClipboardList,
  Users,
  ArrowRight,
  Loader2,
  Search,
  RefreshCw,
  FileCheck,
  Printer,
  AlertTriangle,
  Sparkles,
  Layers,
} from "lucide-react";

import labCaseService from "@/services/labCase.service";
import labHeaderService from "@/services/labHeader.service";
import masterTestsService from "@/services/masterTests.service";
import labRequiredSampleService from "@/services/labRequiredSample.service";

const workflowMenuItems = [
  {
    label: "Patient Registration",
    desc: "Create new lab patient case",
    icon: UserPlus,
    href: "/Modules/laboratory/caseRegistration",
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    label: "Sample Collection",
    desc: "Collect & receive lab samples",
    icon: TestTube,
    href: "/Modules/laboratory/sampleCollection",
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    label: "Test Perform",
    desc: "Enter analyzer test results",
    icon: FlaskConical,
    href: "/Modules/laboratory/testPerform",
    color: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    label: "Test Approval",
    desc: "Pathologist verification",
    icon: CheckCircle2,
    href: "/Modules/laboratory/testApproval",
    color: "from-blue-500 to-sky-600",
    bgLight: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    label: "Patient Reports",
    desc: "Print & deliver lab reports",
    icon: FileText,
    href: "/Modules/laboratory/patientReports",
    color: "from-teal-500 to-cyan-600",
    bgLight: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  },
  {
    label: "Lab Output Setting",
    desc: "Report layout & formatting",
    icon: BarChart3,
    href: "/Modules/laboratory/labOutPut",
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
];

const masterSettingsItems = [
  {
    label: "Lab Profile",
    icon: Settings,
    href: "/Modules/laboratory/labProfile",
    badge: "System",
  },
  {
    label: "Headers",
    icon: ClipboardList,
    href: "/Modules/laboratory/header",
    badge: "Master",
  },
  {
    label: "Sub Headers",
    icon: Layers,
    href: "/Modules/laboratory/subHeader",
    badge: "Master",
  },
  {
    label: "Required Samples",
    icon: TestTube,
    href: "/Modules/laboratory/requiredSamples",
    badge: "Setup",
  },
  {
    label: "Master Tests",
    icon: Microscope,
    href: "/Modules/laboratory/masterTests",
    badge: "Setup",
  },
];

export default function LabDashboardPage() {
  const [stats, setStats] = useState({
    todayCases: 0,
    pendingSample: 0,
    inTesting: 0,
    awaitingApproval: 0,
    completed: 0,
    headersCount: 0,
    samplesCount: 0,
    masterTestsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentCases, setRecentCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [casesRes, headersRes, samplesRes, testsRes] = await Promise.allSettled([
        labCaseService.getAll({ today: true }),
        labHeaderService.getAll(),
        labRequiredSampleService.getAll(),
        masterTestsService.getAll(),
      ]);

      const casesList = casesRes.status === "fulfilled" ? casesRes.value.data || [] : [];
      const casesArray = Array.isArray(casesList) ? casesList : casesList.data || [];

      let pendingSampleCount = 0;
      let inTestingCount = 0;
      let awaitingApprovalCount = 0;
      let completedCount = 0;

      casesArray.forEach((c) => {
        const st = (c.status || "").toLowerCase();
        if (st.includes("registered") || st.includes("pending")) {
          pendingSampleCount++;
        } else if (st.includes("sample") || st.includes("progress")) {
          inTestingCount++;
        } else if (st.includes("performed") || st.includes("test")) {
          awaitingApprovalCount++;
        } else if (st.includes("completed") || st.includes("approved")) {
          completedCount++;
        } else {
          pendingSampleCount++;
        }
      });

      setStats({
        todayCases: casesArray.length,
        pendingSample: pendingSampleCount,
        inTesting: inTestingCount,
        awaitingApproval: awaitingApprovalCount,
        completed: completedCount,
        headersCount:
          headersRes.status === "fulfilled"
            ? headersRes.value.data?.data?.length || headersRes.value.data?.length || 0
            : 0,
        samplesCount:
          samplesRes.status === "fulfilled"
            ? samplesRes.value.data?.data?.length || samplesRes.value.data?.length || 0
            : 0,
        masterTestsCount:
          testsRes.status === "fulfilled"
            ? testsRes.value.data?.data?.length || testsRes.value.data?.length || 0
            : 0,
      });

      setRecentCases(casesArray);
    } catch (err) {
      console.error("Lab Dashboard Load Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filtered cases for list
  const filteredCases = recentCases.filter((c) => {
    const matchSearch =
      !searchTerm.trim() ||
      (c.caseNo && c.caseNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.patient_name && c.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.patient_mrn && c.patient_mrn.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    const st = (c.status || "").toLowerCase();
    if (activeTab === "pending") return st.includes("registered") || st.includes("pending");
    if (activeTab === "testing") return st.includes("sample") || st.includes("progress");
    if (activeTab === "approval") return st.includes("performed") || st.includes("test");
    if (activeTab === "completed") return st.includes("completed") || st.includes("approved");

    return true;
  });

  return (
    <div className="space-y-6 max-w-full mx-auto p-1">
      {/* Top Banner / Premium Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white relative overflow-hidden rounded-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <CardContent className="p-6 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs px-2.5 py-0.5 font-semibold backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 mr-1 text-purple-400 animate-pulse" />
                Live LIS Diagnostic Hub
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
              Clinical Laboratory & Pathology Diagnostics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Central laboratory management dashboard for real-time patient test registrations, sample collection queues, analyzer results, pathologist approvals, and report generation.
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
              Refresh
            </Button>
            <Link href="/Modules/laboratory/caseRegistration">
              <Button size="sm" className="h-9 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-md transition-all">
                <UserPlus className="h-4 w-4 mr-1.5" />
                + New Lab Case
              </Button>
            </Link>
            <Link href="/Modules/laboratory/sampleCollection">
              <Button size="sm" className="h-9 text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-md transition-all">
                <TestTube className="h-4 w-4 mr-1.5" />
                Sample Collection
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Operational Lab KPI Metrics Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Today Cases */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-background border-l-4 border-l-emerald-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
              Today Lab Cases
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.todayCases}
                </span>
                <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold border-0 px-2 py-0.5">
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-600" /> Today
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Registered patient lab cases today
            </CardDescription>
          </CardContent>
        </Card>

        {/* KPI 2: Pending Samples */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white dark:from-amber-950/20 dark:to-background border-l-4 border-l-amber-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Pending Samples
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <TestTube className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.pendingSample}
                </span>
                <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-bold border-0 px-2 py-0.5">
                  Collection Queue
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Awaiting phlebotomy / sample draw
            </CardDescription>
          </CardContent>
        </Card>

        {/* KPI 3: In Testing */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500/10 via-purple-50/40 to-white dark:from-purple-950/20 dark:to-background border-l-4 border-l-purple-600 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
              In Testing / Analysis
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
              <FlaskConical className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.inTesting}
                </span>
                <Badge className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 font-bold border-0 px-2 py-0.5">
                  Processing
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Samples currently undergoing testing
            </CardDescription>
          </CardContent>
        </Card>

        {/* KPI 4: Awaiting Approval */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white dark:from-blue-950/20 dark:to-background border-l-4 border-l-blue-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
              Awaiting Approval
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.awaitingApproval}
                </span>
                <Badge className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-bold border-0 px-2 py-0.5">
                  Verification
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Pathologist review & sign-off queue
            </CardDescription>
          </CardContent>
        </Card>

        {/* KPI 5: Reports Ready */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-teal-500/10 via-teal-50/40 to-white dark:from-teal-950/20 dark:to-background border-l-4 border-l-teal-500 rounded-xl hover:shadow-lg transition-all duration-200">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">
              Reports Completed
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-9 w-24 my-1" />
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stats.completed}
                </span>
                <Badge className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 font-bold border-0 px-2 py-0.5">
                  Approved
                </Badge>
              </div>
            )}
            <CardDescription className="text-[11px] mt-1 text-slate-500 font-medium">
              Final verified reports ready to print
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Side Live Queue (2/3) + Right Side Quick Workflows (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Cases Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-5 bg-slate-50/50 dark:bg-slate-900/40 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  Today Laboratory Patient Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time tracking of diagnostic cases & test progress
                </CardDescription>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "testing", label: "In Test" },
                  { id: "approval", label: "Approval" },
                  { id: "completed", label: "Done" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeTab === t.id
                        ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Case No, Patient Name, MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Table */}
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead className="text-xs font-bold">Case No</TableHead>
                      <TableHead className="text-xs font-bold">Patient Details</TableHead>
                      <TableHead className="text-xs font-bold">Priority</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
                          <span className="text-xs text-muted-foreground mt-2 block">Loading live lab cases...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredCases.length > 0 ? (
                      filteredCases.slice(0, 8).map((c) => {
                        const st = c.status || "Registered";
                        const isStat = c.priority === "STAT";
                        const isUrgent = c.priority === "Urgent";

                        return (
                          <TableRow key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50">
                            <TableCell className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                              {c.caseNo}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {c.patient_name || "Walk-in Patient"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  MRN: {c.patient_mrn || "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-[10px] px-2 py-0.5 font-bold ${
                                  isStat
                                    ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                                    : isUrgent
                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {c.priority || "Normal"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-[10px] px-2 py-0.5 font-semibold ${
                                  st.toLowerCase().includes("completed") || st.toLowerCase().includes("approved")
                                    ? "bg-teal-100 text-teal-800"
                                    : st.toLowerCase().includes("performed")
                                    ? "bg-blue-100 text-blue-800"
                                    : st.toLowerCase().includes("sample") || st.toLowerCase().includes("progress")
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {st}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href="/Modules/laboratory/caseRegistration">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-600 hover:text-purple-800">
                                  View <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                          No laboratory cases found today.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Lab Workflow Quick Links & Master Setup Counters */}
        <div className="space-y-6">
          {/* Main Laboratory Operations Grid */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Beaker className="h-4 w-4 text-purple-600" />
                Laboratory Workflows
              </CardTitle>
              <CardDescription className="text-xs">Direct action shortcuts for daily lab tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-3">
              {workflowMenuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link key={idx} href={item.href}>
                    <Card className="group hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer border shadow-xs h-full">
                      <CardContent className="p-3 flex flex-col items-start gap-2">
                        <div className={`p-2.5 rounded-xl ${item.bgLight} group-hover:scale-105 transition-transform`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Master Setup Parameters & Counters */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Settings className="h-4 w-4 text-teal-600" />
                Master Setup & Parameters
              </CardTitle>
              <CardDescription className="text-xs">Configured headers, samples & tests</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-xl text-center border border-indigo-100 dark:border-indigo-900">
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold uppercase">Headers</p>
                  <p className="text-lg font-black text-indigo-900 dark:text-indigo-200 mt-0.5">{stats.headersCount}</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-950/30 p-2.5 rounded-xl text-center border border-pink-100 dark:border-pink-900">
                  <p className="text-[10px] text-pink-700 dark:text-pink-300 font-bold uppercase">Samples</p>
                  <p className="text-lg font-black text-pink-900 dark:text-pink-200 mt-0.5">{stats.samplesCount}</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-950/30 p-2.5 rounded-xl text-center border border-violet-100 dark:border-violet-900">
                  <p className="text-[10px] text-violet-700 dark:text-violet-300 font-bold uppercase">Tests</p>
                  <p className="text-lg font-black text-violet-900 dark:text-violet-200 mt-0.5">{stats.masterTestsCount}</p>
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                {masterSettingsItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link key={idx} href={item.href}>
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                          <Icon className="h-3.5 w-3.5 text-purple-600" />
                          <span>{item.label}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
