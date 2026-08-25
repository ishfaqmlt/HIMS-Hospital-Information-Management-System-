"use client";

import React from "react";
import { Pill } from "lucide-react";

export default function MedicationMasterPage() {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs text-center space-y-3">
      <Pill className="h-10 w-10 text-emerald-500 mx-auto" />
      <h1 className="text-lg font-bold text-slate-800">Master Medication Settings</h1>
      <p className="text-xs text-muted-foreground max-w-md mx-auto">
        Medication master management page placeholder.
      </p>
    </div>
  );
}
