"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Clock } from "lucide-react";

export default function PharmacyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Pill className="h-6 w-6 text-teal-600" />
            Pharmacy Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Medicine inventory, dispensing, and pharmacy formulary
          </p>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-teal-600" />
          </div>
          <CardTitle className="text-lg">Module Under Enhancement</CardTitle>
        </CardHeader>
        <CardContent className="text-center max-w-md mx-auto space-y-2 text-muted-foreground text-sm pb-8">
          <p>
            The Pharmacy module is being redesigned with complete drug formulary, batch tracking, stock dispensing, and direct OPD prescription integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
