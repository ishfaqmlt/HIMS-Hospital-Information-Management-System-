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

export default function PatientDetailsCard({
  mrnSearch = "",
  onMrnSearchChange,
  onMrnSearch,
  patientIdSearch = "",
  onPatientIdSearchChange,
  onPatientIdSearch,
  selectedPatient = null,
  patientType = "",
  onPatientTypeChange,
  patientTypes = [],
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-9 gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">MRN</Label>
            <div className="flex gap-1">
              <Input
                value={mrnSearch}
                onChange={(e) => onMrnSearchChange(e.target.value)}
                className="h-8 text-xs"
                placeholder="MRN"
              />
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onMrnSearch}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Patient ID</Label>
            <div className="flex gap-1">
              <Input
                value={patientIdSearch}
                onChange={(e) => onPatientIdSearchChange(e.target.value)}
                className="h-8 text-xs"
                placeholder="Patient ID"
              />
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onPatientIdSearch}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">CNIC</Label>
            <Input
              value={selectedPatient?.cnic || ""}
              disabled
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Mobile No.</Label>
            <Input
              value={selectedPatient?.mobile || ""}
              disabled
              className="h-8 text-xs"
            />
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
                  <SelectItem key={pt.id} value={pt.id}>{pt.visitType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
