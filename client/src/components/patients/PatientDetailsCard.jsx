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
import { Search } from "lucide-react";

function formatCode(value) {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "-" + digits.slice(2);
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
  selectedPatient = null,
  patientType = "",
  onPatientTypeChange,
  patientTypes = [],
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">MRN</Label>
            <div className="flex gap-1">
              <div className="flex items-center h-8 px-2 text-xs bg-muted border border-input rounded-md text-muted-foreground shrink-0">
                MRN-
              </div>
              {selectedPatient ? (
                <Input
                  value={mrnSearch || ""}
                  disabled
                  className="h-8 text-xs"
                />
              ) : (
                <Input
                  value={mrnSearch}
                  onChange={(e) => onMrnSearchChange(formatCode(e.target.value))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMrnSearch(); } }}
                  className="h-8 text-xs"
                  placeholder=""
                  maxLength={7}
                />
              )}
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onMrnSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">CNIC</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.cnic || ""}
                  disabled
                  className="h-8 text-xs"
                />
              ) : (
                <Input
                  value={cnicSearch}
                  onChange={(e) => onCnicSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onCnicSearch(); } }}
                  className="h-8 text-xs"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onCnicSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Mobile No.</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.mobile || ""}
                  disabled
                  className="h-8 text-xs"
                />
              ) : (
                <Input
                  value={mobileSearch}
                  onChange={(e) => onMobileSearchChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMobileSearch(); } }}
                  className="h-8 text-xs"
                  placeholder=""
                />
              )}
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onMobileSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Patient</Label>
            <Input
              value={selectedPatient?.pName || ""}
              disabled
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Guardian</Label>
            <Input
              value={selectedPatient?.gName || ""}
              disabled
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <Input
              value={selectedPatient?.gender || ""}
              disabled
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Address</Label>
            <Input
              value={selectedPatient?.address || ""}
              disabled
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Patient Type</Label>
            <Select value={patientType} onValueChange={onPatientTypeChange}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {patientTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>{pt.patientType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
