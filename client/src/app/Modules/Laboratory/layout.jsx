"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  TestTube,
  FlaskConical,
  CheckCircle,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";

const labMenuItems = [
  {
    label: "Dashboard",
    icon: Settings,
    href: "/Modules/laboratory/labDashboard",
    permission: "view_lab_dashboard",
  },
  {
    label: "Case Registration",
    icon: UserPlus,
    href: "/Modules/laboratory/caseRegistration",
    permission: "view_lab_case_registration",
  },
  {
    label: "Accept Sample",
    icon: TestTube,
    href: "/Modules/laboratory/acceptSample",
    permission: "view_lab_accept_sample",
  },
  {
    label: "Test Perform",
    icon: FlaskConical,
    href: "/Modules/laboratory/testPerform",
    permission: "view_lab_test_perform",
  },
  {
    label: "Test Approval",
    icon: CheckCircle,
    href: "/Modules/laboratory/testApproval",
    permission: "view_lab_test_approval",
  },
  {
    label: "Patient Reports",
    icon: FileText,
    href: "/Modules/laboratory/patientReports",
    permission: "view_lab_patient_reports",
  },
  {
    label: "Lab Reports",
    icon: BarChart3,
    href: "/Modules/laboratory/labReports",
    permission: "view_lab_reports",
  },
];

const masterSettingsItems = [
  { label: "Lab Profile", href: "/Modules/laboratory/labProfile", permission: "view_lab_master_settings" },
  { label: "Headers", href: "/Modules/laboratory/header", permission: "view_lab_master_settings" },
  { label: "Sub Headers", href: "/Modules/laboratory/subHeader", permission: "view_lab_master_settings" },
  { label: "Required Samples", href: "/Modules/laboratory/requiredSamples", permission: "view_lab_master_settings" },
  { label: "Master Tests", href: "/Modules/laboratory/masterTests", permission: "view_lab_master_settings" },
  { label: "Out Put Settings", href: "/Modules/laboratory/labOutPut", permission: "view_lab_master_settings" },
  { label: "Analyzer Settings", href: "/Modules/laboratory/analyzerSetup", permission: "view_lab_master_settings" },
];

const LaboratoryLayout = ({ children }) => {
  const pathname = usePathname();
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
      return pName === permissionName;
    });
  };

  const visibleLabMenuItems = labMenuItems.filter((item) => hasPermission(item.permission));
  const visibleMasterItems = masterSettingsItems.filter((item) => hasPermission(item.permission));

  return (
    <div className="w-full min-h-screen">
      {/* Menubar */}
      <div className="flex flex-wrap items-center gap-1 bg-linear-to-r from-blue-500 to-amber-500 p-2 rounded-b-lg border border-amber-700 shadow-sm sticky top-0 z-40">
        {visibleLabMenuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={idx} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-white/20 text-xs font-medium h-8 px-3 ${
                  isActive ? "bg-white/30" : ""
                }`}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {item.label}
              </Button>
            </Link>
          );
        })}

        {/* Master Settings Dropdown */}
        {visibleMasterItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 text-xs font-medium h-8 px-3"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Master Settings
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {visibleMasterItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <DropdownMenuItem key={idx} asChild>
                    <Link
                      href={item.href}
                      className={`text-xs cursor-pointer ${isActive ? "bg-amber-100 text-amber-700 font-medium" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Page Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default LaboratoryLayout;
