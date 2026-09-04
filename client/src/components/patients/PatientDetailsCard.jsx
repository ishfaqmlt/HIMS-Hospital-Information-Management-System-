"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, User } from "lucide-react";

function formatMrnCode(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "-" + digits.slice(2);
}

function formatVisitNoCode(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  return digits.slice(0, 4) + "-" + digits.slice(4);
}

export default function PatientDetailsCard({
  mrnSearch = "",
  onMrnSearchChange,
  onMrnSearch,
  mobileSearch = "",
  onMobileSearchChange,
  onMobileSearch,
  cnicSearch = "",
  onCnicSearchChange,
  onCnicSearch,
  visitNoSearch = "",
  onVisitNoSearchChange,
  onVisitNoSearch,
  selectedPatient = null,
  onReset,
}) {
  return (
    <Card className="shadow-xs border border-slate-200/90 w-full rounded-xl overflow-hidden">
      <CardHeader className="px-3.5 py-1.5 bg-linear-to-r from-teal-50/80 via-slate-50 to-teal-50/40 border-b border-slate-200/80 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-teal-100/70 border border-teal-200 text-teal-800">
            <User className="h-3 w-3" />
          </div>
          <CardTitle className="text-[11px] font-bold text-teal-950 tracking-wider uppercase">
            Patient Details & Search
          </CardTitle>
          {selectedPatient && (
            <Badge variant="outline" className="h-4.5 px-2 text-[10px] font-bold bg-teal-100 text-teal-900 border-teal-300">
              Active: {selectedPatient.pName} {selectedPatient.mrn ? `(${selectedPatient.mrn})` : ""}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
          onClick={onReset}
          title="Reset patient search"
        >
          <RotateCcw className="h-3 w-3 mr-1 text-slate-500" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="px-3 py-2 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 items-end w-full">
          {/* Visit No */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">Visit No</Label>
            <div className="flex gap-1 items-center w-full">
              <div className="flex items-center flex-1 min-w-0">
                <span className="h-8 px-2 flex items-center text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-slate-600 shrink-0 select-none">
                  V-
                </span>
                {selectedPatient ? (
                  <Input
                    value={visitNoSearch || ""}
                    disabled
                    className="h-8 text-xs font-medium bg-slate-50/70 border-slate-300 rounded-l-none flex-1 min-w-0"
                  />
                ) : (
                  <Input
                    value={visitNoSearch}
                    onChange={(e) => onVisitNoSearchChange(formatVisitNoCode(e.target.value))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onVisitNoSearch(); } }}
                    className="h-8 text-xs font-medium border-slate-300 rounded-l-none flex-1 min-w-0 bg-white focus:border-teal-500"
                    placeholder=""
                    maxLength={11}
                  />
                )}
              </div>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0 border-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onClick={onVisitNoSearch} disabled={!!selectedPatient} title="Search Visit No">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* MRN */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">MRN</Label>
            <div className="flex gap-1 items-center w-full">
              <div className="flex items-center flex-1 min-w-0">
                <span className="h-8 px-2 flex items-center text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-slate-600 shrink-0 select-none">
                  MRN-
                </span>
                {selectedPatient ? (
                  <Input
                    value={mrnSearch || ""}
                    disabled
                    className="h-8 text-xs font-medium bg-slate-50/70 border-slate-300 rounded-l-none flex-1 min-w-0"
                  />
                ) : (
                  <Input
                    value={mrnSearch}
                    onChange={(e) => onMrnSearchChange(formatMrnCode(e.target.value))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMrnSearch(); } }}
                    className="h-8 text-xs font-medium border-slate-300 rounded-l-none flex-1 min-w-0 bg-white focus:border-teal-500"
                    placeholder=""
                    maxLength={8}
                  />
                )}
              </div>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0 border-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onClick={onMrnSearch} disabled={!!selectedPatient} title="Search MRN">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* CNIC */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">CNIC</Label>
            <div className="flex gap-1 items-center w-full">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.cnic || ""}
                  disabled
                  className="h-8 text-xs font-medium bg-slate-50/70 border-slate-300 flex-1 min-w-0"
                />
              ) : (
                <Input
                  value={cnicSearch}
                  onChange={(e) => onCnicSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCnicSearch(); } }}
                  className="h-8 text-xs font-medium border-slate-300 flex-1 min-w-0 bg-white focus:border-teal-500"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0 border-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onClick={onCnicSearch} disabled={!!selectedPatient} title="Search CNIC">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Mobile No */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">Mobile No.</Label>
            <div className="flex gap-1 items-center w-full">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.mobile || ""}
                  disabled
                  className="h-8 text-xs font-medium bg-slate-50/70 border-slate-300 flex-1 min-w-0"
                />
              ) : (
                <Input
                  value={mobileSearch}
                  onChange={(e) => onMobileSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMobileSearch(); } }}
                  className="h-8 text-xs font-medium border-slate-300 flex-1 min-w-0 bg-white focus:border-teal-500"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0 border-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300" onClick={onMobileSearch} disabled={!!selectedPatient} title="Search Mobile">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Patient Name */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">Patient</Label>
            <Input
              value={selectedPatient?.pName || ""}
              disabled
              className="h-8 text-xs font-semibold bg-slate-50/70 border-slate-300 text-slate-900 w-full truncate"
            />
          </div>

          {/* Guardian Name */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">Guardian</Label>
            <Input
              value={selectedPatient?.gName || ""}
              disabled
              className="h-8 text-xs font-semibold bg-slate-50/70 border-slate-300 text-slate-900 w-full truncate"
            />
          </div>

          {/* Gender */}
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[11px] font-semibold text-slate-600 truncate block mb-1">Gender</Label>
            <Input
              value={selectedPatient?.gender || ""}
              disabled
              className="h-8 text-xs font-semibold bg-slate-50/70 border-slate-300 text-slate-900 w-full truncate"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
