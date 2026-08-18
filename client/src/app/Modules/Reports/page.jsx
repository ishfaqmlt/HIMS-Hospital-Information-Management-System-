"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Stethoscope,
  FileText,
  RotateCcw,
  FlaskConical,
  BarChart3,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export default function ReportsHubPage() {
  const reportCards = [
    {
      title: "Payments & Collections Report",
      description: "Track daily cashier collections, cash/card/online breakdown, department revenue split, and patient balance dues.",
      icon: DollarSign,
      color: "bg-emerald-600",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      href: "/Modules/Reports/Payments",
      badge: "Financial",
    },
    {
      title: "Cash Handovers & Shift Audit",
      description: "Review cashier shift closure submissions, physical note denomination counts, shortage/excess variances, and supervisor approvals.",
      icon: ShieldCheck,
      color: "bg-slate-800",
      textColor: "text-slate-800",
      borderColor: "border-slate-300",
      href: "/Modules/Reports/CashHandovers",
      badge: "Audit & Shift",
    },
    {
      title: "Doctor Share & Referral Reports",
      description: "Calculate consultant doctor shares, referral commissions, hospital retention amounts, and detailed itemized payouts.",
      icon: Stethoscope,
      color: "bg-blue-600",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      href: "/Modules/Reports/DoctorShare",
      badge: "Commissions",
    },
    {
      title: "Patient Lab Reports",
      description: "Search and view completed laboratory patient test cases, verify results, and print thermal (80mm) or A4 report slips.",
      icon: FlaskConical,
      color: "bg-purple-600",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      href: "/Modules/laboratory/patientReports",
      badge: "Laboratory",
    },
    {
      title: "Reception Invoice Slips",
      description: "Reprint reception billing slips, receipt copies, and thermal/A4 invoice printouts.",
      icon: FileText,
      color: "bg-amber-600",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      href: "/Modules/Reports/Reception/invoice",
      badge: "Billing",
    },
    {
      title: "Return Invoices & Refund Slips",
      description: "View returned invoices, service cancellation records, and cash refund audit trails.",
      icon: RotateCcw,
      color: "bg-rose-600",
      textColor: "text-rose-700",
      borderColor: "border-rose-200",
      href: "/Modules/Reports/Reception/return-invoice",
      badge: "Refunds",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-700" />
            Hospital Reports & Analytics Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access financial collections, doctor share payouts, department revenue analytics, and printed receipts.
          </p>
        </div>
      </div>

      {/* Report Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`hover:shadow-md transition-all duration-200 border ${card.borderColor} flex flex-col justify-between`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${card.color} text-white shadow-xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      {card.title}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mt-1 ${card.textColor}`}>
                      {card.badge}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
                <Link href={card.href} className="block w-full">
                  <Button
                    size="sm"
                    className="w-full justify-between text-xs"
                    variant="outline"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
