"use client";

import React from "react";
import { FlaskConical } from "lucide-react";

export default function LaboratoryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
      <FlaskConical className="h-16 w-16 mb-4 text-amber-500" />
      <h2 className="text-xl font-semibold text-foreground">Laboratory Module</h2>
      <p className="text-sm mt-1">Select an option from the menu above to get started.</p>
    </div>
  );
}
