"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  },
  {
    label: "Case Registration",
    icon: UserPlus,
    href: "/Modules/laboratory/caseRegistration",
  },
  {
    label: "Accept Sample",
    icon: TestTube,
    href: "/Modules/laboratory/acceptSample",
  },
  {
    label: "Test Perform",
    icon: FlaskConical,
    href: "/Modules/laboratory/testPerform",
  },
  {
    label: "Test Approval",
    icon: CheckCircle,
    href: "/Modules/laboratory/testApproval",
  },
  {
    label: "Patient Reports",
    icon: FileText,
    href: "/Modules/laboratory/patientReports",
  },
  {
    label: "Lab Reports",
    icon: BarChart3,
    href: "/Modules/laboratory/labReports",
  },
];

const masterSettingsItems = [
  { label: "Lab Profile", href: "/Modules/laboratory/labProfile" },
  { label: "Headers", href: "/Modules/laboratory/header" },
  { label: "Sub Headers", href: "/Modules/laboratory/subHeader" },
  { label: "Required Samples", href: "/Modules/laboratory/requiredSamples" },
  { label: "Master Tests", href: "/Modules/laboratory/masterTests" },
  { label: "Out Put Settings", href: "/Modules/laboratory/labOutPut" },
  
];

const LaboratoryLayout = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="w-full min-h-screen">
      {/* Menubar */}
      <div className="flex flex-wrap items-center gap-1 bg-linear-to-r from-blue-500 to-amber-500 p-2 rounded-b-lg border border-amber-700 shadow-sm sticky top-0 z-40">
        {labMenuItems.map((item, idx) => {
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
            {masterSettingsItems.map((item, idx) => {
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
      </div>

      {/* Page Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default LaboratoryLayout;
