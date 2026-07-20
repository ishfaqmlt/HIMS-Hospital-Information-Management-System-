"use client";

import Link from "next/link";
import { Building2, Settings, Shield } from "lucide-react";

const settingsModules = [
  {
    name: "Hospital Profile",
    description: "Manage hospital information, logo, and contact details",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/hospitalProfile",
  },
  {
    name: "Departments",
    description: "Manage hospital departments and their configurations",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/departments",
  },
  
  {
    name: "Services",
    description: "Manage hospital services and their configurations",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/services",
  },
  {
    name: "Service Charges",
    description: "Manage hospital service charges and pricing",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/serviceCharges",
  },
  {
    name: "Doctors",
    description: "Manage hospital doctors and their configurations",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/doctors",
  },
  {
    name: "Doctors Appointments",
    description: "Manage doctors Appointments and their configurations",
    icon: Building2,
    color: "bg-blue-500",
    href: "/Modules/Settings/appointmentMaster",
  },
  {
    name: "Insurance Companies",
    description: "Manage insurance companies and their policies",
    icon: Shield,
    color: "bg-green-500",
    href: "/Modules/Settings/insuranceCompanies",
  },
  {
    name: "Insurance Plans",
    description: "Manage insurance plans and coverage details",
    icon: Shield,
    color: "bg-emerald-500",
    href: "/Modules/Settings/insurancePlans",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure system settings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsModules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="group flex items-start gap-4 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200"
          >
            <div
              className={`h-12 w-12 rounded-xl ${module.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0`}
            >
              <module.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{module.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {module.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
