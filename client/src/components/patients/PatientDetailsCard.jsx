"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";

function formatMrnCode(value) {
  const digits = value.replace(/\D/g, "").slice(0, 7);
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
  patientType = "",
  onPatientTypeChange,
  patientTypes = [],
  onReset,
}) {
  return (
    <Card className="shadow-sm border border-border/50 w-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-9 gap-3 items-end w-full">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Visit No</Label>
            <div className="flex gap-1">
              <div className="flex items-center h-9 px-2 text-xs bg-muted/50 border border-input rounded-md text-muted-foreground shrink-0 font-medium">
                V-
              </div>
              {selectedPatient ? (
                <Input
                  value={visitNoSearch || ""}
                  disabled
                  className="h-9 text-xs bg-muted/50"
                />
              ) : (
                <Input
                  value={visitNoSearch}
                  onChange={(e) => onVisitNoSearchChange(formatVisitNoCode(e.target.value))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onVisitNoSearch(); } }}
                  className="h-9 text-xs"
                  placeholder=""
                  maxLength={11}
                />
              )}
              <Button size="sm" variant="outline" className="h-9 px-2" onClick={onVisitNoSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">MRN</Label>
            <div className="flex gap-1">
              <div className="flex items-center h-9 px-2 text-xs bg-muted/50 border border-input rounded-md text-muted-foreground shrink-0 font-medium">
                MRN-
              </div>
              {selectedPatient ? (
                <Input
                  value={mrnSearch || ""}
                  disabled
                  className="h-9 text-xs bg-muted/50 flex-1"
                />
              ) : (
                <Input
                  value={mrnSearch}
                  onChange={(e) => onMrnSearchChange(formatMrnCode(e.target.value))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMrnSearch(); } }}
                  className="h-9 text-xs flex-1"
                  placeholder=""
                  maxLength={8}
                />
              )}
              <Button size="sm" variant="outline" className="h-9 px-2" onClick={onMrnSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">CNIC</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.cnic || ""}
                  disabled
                  className="h-9 text-xs bg-muted/50"
                />
              ) : (
                <Input
                  value={cnicSearch}
                  onChange={(e) => onCnicSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCnicSearch(); } }}
                  className="h-9 text-xs"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-9 px-2" onClick={onCnicSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Mobile No.</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.mobile || ""}
                  disabled
                  className="h-9 text-xs bg-muted/50"
                />
              ) : (
                <Input
                  value={mobileSearch}
                  onChange={(e) => onMobileSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMobileSearch(); } }}
                  className="h-9 text-xs"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-9 px-2" onClick={onMobileSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Patient</Label>
            <Input
              value={selectedPatient?.pName || ""}
              disabled
              className="h-9 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Guardian</Label>
            <Input
              value={selectedPatient?.gName || ""}
              disabled
              className="h-9 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
            <Input
              value={selectedPatient?.gender || ""}
              disabled
              className="h-9 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Patient Type</Label>
            <Select value={patientType} onValueChange={onPatientTypeChange}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {patientTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>{pt.patientType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">&nbsp;</Label>
            <Button size="sm" variant="outline" className="h-9 px-3" onClick={onReset}>
              <RotateCcw className="h-3 w-3 mr-1" />Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
