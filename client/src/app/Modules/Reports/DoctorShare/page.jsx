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
import { Loader2, Printer, RefreshCw, UserCheck, Stethoscope, FileSpreadsheet, AlertCircle } from "lucide-react";
import reportService from "@/services/report.service";
import doctorService from "@/services/doctor.service";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function DoctorShareReportsPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [fromDate, setFromDate] = useState(toLocalISOString(todayStart));
  const [toDate, setToDate] = useState(toLocalISOString(todayEnd));
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [activeTab, setActiveTab] = useState("doctor-summary");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Report States
  const [docSummary, setDocSummary] = useState({ data: [], totals: {} });
  const [docDetailed, setDocDetailed] = useState({ data: [], totals: {} });

  useEffect(() => {
    let isCancelled = false;

    const loadDoctors = async () => {
      try {
        const res = await doctorService.getAll().catch(() => ({ data: [] }));
        if (!isCancelled) {
          setDoctors(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadDoctors();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const fDate = fromDate ? fromDate.replace("T", " ") : "";
      const tDate = toDate ? toDate.replace("T", " ") : "";

      const params = { fromDate: fDate, toDate: tDate };
      if (selectedDoctor !== "all") params.doctorId = selectedDoctor;

      if (activeTab === "doctor-summary") {
        const res = await reportService.getDoctorShareSummary(params);
        setDocSummary(res.data);
      } else if (activeTab === "doctor-detailed") {
        const res = await reportService.getDoctorShareDetailed(params);
        setDocDetailed(res.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load doctor share report data." });
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

        const params = { fromDate: fDate, toDate: tDate };
        if (selectedDoctor !== "all") params.doctorId = selectedDoctor;

        if (activeTab === "doctor-summary") {
          const res = await reportService.getDoctorShareSummary(params);
          if (!isCancelled) setDocSummary(res.data);
        } else if (activeTab === "doctor-detailed") {
          const res = await reportService.getDoctorShareDetailed(params);
          if (!isCancelled) setDocDetailed(res.data);
        }
      } catch (err) {
        console.error(err);
        if (!isCancelled) setMessage({ type: "error", text: "Failed to load doctor share report data." });
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadReports();

    return () => {
      isCancelled = true;
    };
  }, [fromDate, toDate, selectedDoctor, activeTab]);

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
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Doctor Share & Referral Reports
          </h1>
          <p className="text-xs text-muted-foreground">
            Calculate doctor commission shares, hospital retention, and detailed itemized payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint}>
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

            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs font-semibold">Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.Name} ({d.department?.DepartmentName || "General"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          onClick={() => setActiveTab("doctor-summary")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "doctor-summary"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> Doctor Summary Share
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("doctor-detailed")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "doctor-detailed"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> Itemized Breakdown
        </button>
      </div>

      {/* 1. Doctor Share Summary */}
      {activeTab === "doctor-summary" && (
        <Card>
          <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700">Doctor Share Summary Report</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] bg-white text-emerald-700 border-emerald-300">
                Total Doctor Share: PKR {docSummary.totals?.total_doctor_share?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] bg-white text-blue-700 border-blue-300">
                Total Hospital Share: PKR {docSummary.totals?.total_hospital_share?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="h-8 bg-slate-100/60">
                  <TableHead className="text-xs font-semibold">Doctor Name</TableHead>
                  <TableHead className="text-xs font-semibold">Department</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Invoices</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Gross Revenue (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-emerald-700">Doctor Share (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-blue-700">Hospital Share (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Effective Share %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !docSummary.data || docSummary.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No doctor share records found for the selected period.
                    </TableCell>
                  </TableRow>
                ) : (
                  docSummary.data.map((row, idx) => (
                    <TableRow key={`${row.doctor_id || "doc"}-${row.department_name || "dept"}-${idx}`} className="h-9 hover:bg-slate-50">
                      <TableCell className="text-xs font-medium text-slate-800">{row.doctor_name}</TableCell>
                      <TableCell className="text-xs text-slate-600">{row.department_name}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{row.invoice_count}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">{row.gross_revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-emerald-700">{row.doctor_share.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-blue-700">{row.hospital_share.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-center font-mono">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.share_percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {docSummary.data && docSummary.data.length > 0 && (
                <TableHeader>
                  <TableRow className="h-9 bg-slate-100 font-bold">
                    <TableCell colSpan={2} className="text-xs">TOTAL</TableCell>
                    <TableCell className="text-xs text-center font-mono">{docSummary.totals?.total_invoices}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{docSummary.totals?.total_gross?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-700">{docSummary.totals?.total_doctor_share?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-blue-700">{docSummary.totals?.total_hospital_share?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-center font-mono">-</TableCell>
                  </TableRow>
                </TableHeader>
              )}
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 2. Doctor Itemized Share Breakdown */}
      {activeTab === "doctor-detailed" && (
        <Card>
          <CardHeader className="py-2.5 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-700">Detailed Itemized Doctor Share Breakdown</CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] bg-white text-emerald-700 border-emerald-300">
              Total Doctor Share: PKR {docDetailed.totals?.total_doctor_share?.toLocaleString("en-PK", { minimumFractionDigits: 2 }) || "0.00"}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="h-8 bg-slate-100/60">
                  <TableHead className="text-xs font-semibold">Invoice No</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Patient Name (MRN)</TableHead>
                  <TableHead className="text-xs font-semibold">Doctor / Dept</TableHead>
                  <TableHead className="text-xs font-semibold">Service Name</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Share %</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-emerald-700">Doctor Share (PKR)</TableHead>
                  <TableHead className="text-xs font-semibold text-right text-blue-700">Hospital Share (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !docDetailed.data || docDetailed.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-xs text-muted-foreground">
                      No itemized share breakdown records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  docDetailed.data.map((row, idx) => (
                    <TableRow key={idx} className="h-9 hover:bg-slate-50">
                      <TableCell className="text-xs font-mono font-medium text-slate-800">{row.invoice_no}</TableCell>
                      <TableCell className="text-xs font-mono">{new Date(row.invoice_date).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {row.patient_name} <span className="text-slate-500 font-mono text-[10px]">({row.patient_mrn})</span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{row.doctor_name} / {row.department_name}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">{row.service_name}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{row.qty}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">{row.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-center font-mono">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-50">
                          {row.share_percent}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-emerald-700">{row.doctor_share.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-blue-700">{row.hospital_share.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {docDetailed.data && docDetailed.data.length > 0 && (
                <TableHeader>
                  <TableRow className="h-9 bg-slate-100 font-bold">
                    <TableCell colSpan={6} className="text-xs">TOTAL</TableCell>
                    <TableCell className="text-xs text-right font-mono">{docDetailed.totals?.total_amount?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-center font-mono">-</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-700">{docDetailed.totals?.total_doctor_share?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-blue-700">{docDetailed.totals?.total_hospital_share?.toFixed(2)}</TableCell>
                  </TableRow>
                </TableHeader>
              )}
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
