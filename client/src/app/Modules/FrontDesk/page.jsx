"use client";

import React from "react";
import { Calendar } from "lucide-react";

export default function FrontDeskPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
      <Calendar className="h-16 w-16 mb-4 text-blue-500" />
      <h2 className="text-xl font-semibold text-foreground">Front Desk Module</h2>
      <p className="text-sm mt-1">Select an option from the menu above to get started.</p>
    </div>
  );
}
