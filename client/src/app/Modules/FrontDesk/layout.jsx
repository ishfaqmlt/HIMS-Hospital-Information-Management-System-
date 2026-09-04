"use client";

import React, { useState } from "react";
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
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Wallet,
} from "lucide-react";
import ShiftSummaryDialog from "@/components/billing/ShiftSummaryDialog";

const frontDeskItems = [
  {
    label: "Dashboard",
    icon: Settings,
    href: "/Modules/FrontDesk/frontDeskDashboard",
    permission: "view_fd_dashboard",
  },
  {
    label: "Patient Registration",
    icon: UserPlus,
    href: "/Modules/FrontDesk/patientRegistration",
    permission: "view_fd_patient_registration",
  },
  {
    label: "Patient Appointments",
    icon: UserPlus,
    href: "/Modules/FrontDesk/Appointments",
    permission: "view_fd_patient_appointments",
  },
  {
    label: "Patient Visits",
    icon: TestTube,
    href: "/Modules/FrontDesk/patientVisits",
    permission: "view_fd_patient_visits",
  },
  {
    label: "Billing",
    icon: TestTube,
    href: "/Modules/FrontDesk/billing",
    permission: "view_fd_billing",
  },
  {
    label: "Patient Payments",
    icon: FlaskConical,
    href: "/Modules/FrontDesk/patientPayments",
    permission: "view_fd_patient_payments",
  },
  {
    label: "Patient Reports",
    icon: FileText,
    href: "/Modules/FrontDesk/patientReports",
    permission: "view_fd_patient_reports",
  },
  {
    label: "Collection Reports",
    icon: BarChart3,
    href: "/Modules/FrontDesk/collectionReports",
    permission: "view_fd_collection_reports",
  },
];

const CollectionItems = [
  {
    label: "Doctors Collection",
    href: "/Modules/FrontDesk/doctorsCollection",
    permission: "view_fd_doctors_collection",
  },
  {
    label: "Department Collection",
    href: "/Modules/FrontDesk/departmentCollection",
    permission: "view_fd_department_collection",
  },
];

const FrontDeskLayout = ({ children }) => {
  const pathname = usePathname();
  const { user, roles, permissions } = useSelector((state) => state.auth || {});
  const [isShiftSummaryOpen, setIsShiftSummaryOpen] = useState(false);

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
      return pName === permissionName || pName === "view_front_desk" || pName === "view_registration";
    });
  };

  const visibleFrontDeskItems = frontDeskItems.filter((item) => hasPermission(item.permission));
  const visibleCollectionItems = CollectionItems.filter((item) => hasPermission(item.permission));

  return (
    <div className="w-full min-h-screen">
      {/* Menubar */}
      <div className="flex flex-wrap items-center gap-1 bg-linear-to-r from-blue-500 to-amber-500 p-2 rounded-b-lg border border-Blue-700 shadow-sm sticky top-0 z-40">
        {visibleFrontDeskItems.map((item, idx) => {
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

        {/* Collection Dropdown */}
        {visibleCollectionItems.length > 0 && (
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
              {visibleCollectionItems.map((item, idx) => {
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

        {/* Shift Handover Button */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 text-xs font-semibold h-8 px-3 bg-white/15 border border-white/25 shadow-2xs cursor-pointer"
            onClick={() => setIsShiftSummaryOpen(true)}
          >
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            Shift Handover
          </Button>
        </div>
      </div>

      {/* Shift Summary Dialog */}
      <ShiftSummaryDialog open={isShiftSummaryOpen} onOpenChange={setIsShiftSummaryOpen} />

      {/* Page Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default FrontDeskLayout;
