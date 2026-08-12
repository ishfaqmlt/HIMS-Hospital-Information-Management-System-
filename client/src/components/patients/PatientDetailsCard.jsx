"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RotateCcw, User } from "lucide-react";

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
  onReset,
}) {
  return (
    <Card className="shadow-sm border border-border/50 w-full">
      <CardHeader className="px-3 py-1.5 bg-sky-50">
        <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          Patient Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-2">
        <div className="grid grid-cols-8 gap-2 items-end w-full">
          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">Visit No</Label>
            <div className="flex gap-1">
              <div className="flex items-center">
                <span className="h-8 px-2 flex items-center text-xs bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground font-medium">
                  V-
                </span>
                {selectedPatient ? (
                  <Input
                    value={visitNoSearch || ""}
                    disabled
                    className="h-8 text-xs bg-muted/50 rounded-l-none"
                  />
                ) : (
                  <Input
                    value={visitNoSearch}
                    onChange={(e) => onVisitNoSearchChange(formatVisitNoCode(e.target.value))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onVisitNoSearch(); } }}
                    className="h-8 text-xs rounded-l-none"
                    placeholder=""
                    maxLength={11}
                  />
                )}
              </div>
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onVisitNoSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">MRN</Label>
            <div className="flex gap-1">
              <div className="flex items-center">
                <span className="h-8 px-2 flex items-center text-xs bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground font-medium">
                  MRN-
                </span>
                {selectedPatient ? (
                  <Input
                    value={mrnSearch || ""}
                    disabled
                    className="h-8 text-xs bg-muted/50 rounded-l-none flex-1"
                  />
                ) : (
                  <Input
                    value={mrnSearch}
                    onChange={(e) => onMrnSearchChange(formatMrnCode(e.target.value))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onMrnSearch(); } }}
                    className="h-8 text-xs rounded-l-none flex-1"
                    placeholder=""
                    maxLength={8}
                  />
                )}
              </div>
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={onMrnSearch} disabled={!!selectedPatient}>
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">CNIC</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.cnic || ""}
                  disabled
                  className="h-8 text-xs bg-muted/50"
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

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">Mobile No.</Label>
            <div className="flex gap-1">
              {selectedPatient ? (
                <Input
                  value={selectedPatient.mobile || ""}
                  disabled
                  className="h-8 text-xs bg-muted/50"
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

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">Patient</Label>
            <Input
              value={selectedPatient?.pName || ""}
              disabled
              className="h-8 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">Guardian</Label>
            <Input
              value={selectedPatient?.gName || ""}
              disabled
              className="h-8 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.0 ">
            <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
            <Input
              value={selectedPatient?.gender || ""}
              disabled
              className="h-8 text-xs bg-muted/50"
            />
          </div>

          <div className="space-y-1.0">
            <Label className="text-xs font-medium text-muted-foreground">&nbsp;</Label>
            <Button size="sm" variant="outline" className="h-8 px-3" onClick={onReset}>
              <RotateCcw className="h-3 w-3 mr-1" />Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
