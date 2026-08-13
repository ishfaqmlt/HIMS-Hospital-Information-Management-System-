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
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";

const frontDeskItems = [
  {
    label: "Dashboard",
    icon: Settings,
    href: "/Modules/FrontDesk/frontDeskDashboard",
  },
  {
    label: "Patient Registration",
    icon: UserPlus,
    href: "/Modules/FrontDesk/patientRegistration",
  },
  {
    label: "Patient Visits",
    icon: TestTube,
    href: "/Modules/FrontDesk/patientVisits",
  },
  {
    label: "Billing",
    icon: TestTube,
    href: "/Modules/FrontDesk/billing",
  },
  {
    label: "Patient Payments",
    icon: FlaskConical,
    href: "/Modules/FrontDesk/patientPayments",
  },
    {
    label: "Patient Reports",
    icon: FileText,
    href: "/Modules/FrontDesk/patientReports",
  },
  {
    label: "Collection Reports",
    icon: BarChart3,
    href: "/Modules/FrontDesk/collectionReports",
  },
];

const CollectionItems = [
  { label: "Doctors Collection", href: "/Modules/FrontDesk/doctorsCollection" },
  { label: "Department Collection", href: "/Modules/FrontDesk/departmentCollection" },
];

const FrontDeskLayout = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="w-full min-h-screen">
      {/* Menubar */}
      <div className="flex flex-wrap items-center gap-1 bg-linear-to-r from-blue-500 to-amber-500 p-2 rounded-b-lg border border-Blue-700 shadow-sm sticky top-0 z-40">
        {frontDeskItems.map((item, idx) => {
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
              Collection
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {CollectionItems.map((item, idx) => {
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

export default FrontDeskLayout;
