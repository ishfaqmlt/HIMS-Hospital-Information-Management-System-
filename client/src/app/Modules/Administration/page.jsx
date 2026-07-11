"use client";

import Link from "next/link";
import { Users, Shield, Settings } from "lucide-react";

const adminModules = [
  {
    name: "User Management",
    description: "Manage users, create accounts, and assign roles",
    icon: Users,
    color: "bg-blue-500",
    href: "/Modules/Administration/users",
  },
  {
    name: "Role Management",
    description: "Create roles and manage permissions",
    icon: Shield,
    color: "bg-purple-500",
    href: "/Modules/Administration/roles",
  },
];

export default function AdministrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-1">
          Manage system settings, users, and roles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((module) => (
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
