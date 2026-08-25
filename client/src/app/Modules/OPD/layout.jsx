"use client";

import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Stethoscope,
  Activity,
  FileText,
  UserCheck,
  Brain,
  TestTube,
  Pill,
  MessageSquare,
  Calendar,
  LayoutDashboard,
  User,
  Settings,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

export const OPDContext = createContext({
  activePatient: null,
  setActivePatient: () => {},
});

export const useOPDContext = () => useContext(OPDContext);

const opdMenuItems = [
  {
    label: "Dashboard / Queue",
    icon: LayoutDashboard,
    href: "/Modules/OPD",
    permission: "view_opd_dashboard",
  },
  {
    label: "Prescription Report",
    icon: Pill,
    href: "/Modules/OPD/prescription",
    permission: "view_opd_prescription",
  },
];

export default function OPDLayout({ children }) {
  const pathname = usePathname();
  const [activePatient, setActivePatient] = useState(null);
  const { user, roles, permissions } = useSelector((state) => state.auth || {});

  const hasPermission = (permissionName) => {
    if (!permissionName) return true;

    const userRoles = (roles && roles.length > 0) ? roles : (user?.roles || []);
    if (userRoles.some((r) => (r.name || r) === "super_admin" || (r.name || r) === "admin")) {
      return true;
    }

    const userPerms = (permissions && permissions.length > 0) ? permissions : (user?.permissions || []);
    if (userPerms.includes("*")) return true;

    return userPerms.some((p) => {
      const pName = p.name || p;
      return pName === permissionName || pName === "view_opd";
    });
  };

  const visibleItems = opdMenuItems.filter((item) => hasPermission(item.permission));

  return (
    <OPDContext.Provider value={{ activePatient, setActivePatient }}>
      <div className="flex min-h-screen bg-slate-50/50">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-card border-r border-border shrink-0 p-4 space-y-6 shadow-xs sticky top-0 h-screen overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-border pb-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-none text-foreground">OPD Clinical</h2>
              <p className="text-xs text-muted-foreground mt-1">Doctor Consultation</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {visibleItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/Modules/OPD"
                  ? pathname === "/Modules/OPD"
                  : pathname.startsWith(item.href);

              return (
                <Link key={idx} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start text-xs font-medium h-9 px-3 transition-colors ${
                      isActive
                        ? "bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold border border-teal-200"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2.5 shrink-0 ${isActive ? "text-teal-700" : "text-muted-foreground"}`} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Master Settings Dropdown Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={pathname.startsWith("/Modules/OPD/MasterSettings") || pathname.startsWith("/Modules/OPD/Settings") ? "secondary" : "ghost"}
                  className={`w-full justify-between text-xs font-medium h-9 px-3 transition-colors ${
                    pathname.startsWith("/Modules/OPD/MasterSettings") || pathname.startsWith("/Modules/OPD/Settings")
                      ? "bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold border border-teal-200"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center">
                    <Settings className={`h-4 w-4 mr-2.5 shrink-0 ${pathname.startsWith("/Modules/OPD/MasterSettings") || pathname.startsWith("/Modules/OPD/Settings") ? "text-teal-700" : "text-muted-foreground"}`} />
                    <span>Master Settings</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 shadow-md">
                <DropdownMenuLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  OPD Master Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/Modules/OPD/MasterSettings/Symptoms">
                  <DropdownMenuItem className="text-xs cursor-pointer py-2">
                    <Activity className="h-3.5 w-3.5 mr-2.5 text-teal-600" />
                    <span>Symptoms</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/Modules/OPD/MasterSettings/Allergies">
                  <DropdownMenuItem className="text-xs cursor-pointer py-2">
                    <AlertTriangle className="h-3.5 w-3.5 mr-2.5 text-amber-600" />
                    <span>Allergies</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/Modules/OPD/MasterSettings/PhysicalExam">
                  <DropdownMenuItem className="text-xs cursor-pointer py-2">
                    <Stethoscope className="h-3.5 w-3.5 mr-2.5 text-blue-600" />
                    <span>Physical Exam</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/Modules/OPD/MasterSettings/Diagnosis">
                  <DropdownMenuItem className="text-xs cursor-pointer py-2">
                    <Brain className="h-3.5 w-3.5 mr-2.5 text-purple-600" />
                    <span>Diagnosis</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/Modules/OPD/MasterSettings/Medication">
                  <DropdownMenuItem className="text-xs cursor-pointer py-2">
                    <Pill className="h-3.5 w-3.5 mr-2.5 text-emerald-600" />
                    <span>Medication</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-1 space-y-4 overflow-y-auto">
          {/* Top Patient Header Banner (Static Div) */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            {activePatient ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Token & Patient Main Info */}
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1.5 rounded-lg text-sm flex flex-col items-center justify-center min-w-[70px]">
                    <span className="text-[10px] uppercase font-semibold text-amber-600">Token</span>
                    <span className="text-base leading-none">#{String(activePatient.tokenNo || 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">{activePatient.patient_name || activePatient.patient?.pName || "Patient Name"}</h3>
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                        {activePatient.patient_gender || activePatient.patient?.gender || "Male"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>MRN: <strong className="text-slate-700">{activePatient.patient_mrn || activePatient.patient?.mrn || "N/A"}</strong></span>
                      <span>Guardian: <strong className="text-slate-700">{activePatient.patient?.gName || "N/A"}</strong></span>
                      <span>Mobile: <strong className="text-slate-700">{activePatient.patient_mobile || activePatient.patient?.mobile || "N/A"}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Right: Visit / Doctor Info */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right space-y-1">
                    <p className="text-slate-500">Visit No: <strong className="text-slate-700 font-mono">{activePatient.visitNo || activePatient.InvoiceNo || "N/A"}</strong></p>
                    <p className="text-slate-500">Doctor: <strong className="text-slate-700">{activePatient.doctor_name || activePatient.doctor?.Name || "OPD Doctor"}</strong></p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-1 text-xs">
                    {activePatient.Status || "In Consultation"}
                  </Badge>
                </div>
              </div>
            ) : (
              /* Default State Header Div */
              <div className="flex flex-wrap items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">OPD Active Consultation Banner</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Select a patient from today's OPD queue to view clinical details and token number</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                    No Patient Selected
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Child Page Content */}
          <div>{children}</div>
        </main>
      </div>
    </OPDContext.Provider>
  );
}
