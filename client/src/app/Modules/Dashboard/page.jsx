"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import {
  Calendar,
  UserPlus,
  ClipboardList,
  Siren,
  Scissors,
  ShieldCheck,
  TestTube,
  FlaskConical,
  Droplets,
  Package,
  BarChart3,
  HeartPulse,
  BedDouble,
  FileText,
  Settings,
  Pill,
  Stethoscope,
  Ambulance,
  Thermometer,
  Brain,
  Bone,
  Heart,
  Microscope,
  Radiation,
  Bike,
  HandPlatter,
  UtensilsCrossed,
  Shirt,
  ShoppingCart,
  Warehouse,
  Landmark,
  Wallet,
  CreditCard,
  Users,
  Clock,
  CalendarOff,
  Gift,
  UserCheck,
  Activity,
  Lock,
} from "lucide-react";

const departments = [
  { name: "Front Desk", icon: Calendar, color: "bg-blue-500", href: "/Modules/FrontDesk", permission: "view_appointments" },
  { name: "Appointment", icon: Calendar, color: "bg-blue-500", href: "/Modules/Appointments", permission: "view_appointments" },
  { name: "Patient Registration", icon: UserPlus, color: "bg-emerald-500", href: "/Modules/Registration/patients", permission: "view_registration" },
  { name: "Patient Visits", icon: UserPlus, color: "bg-emerald-500", href: "/Modules/Registration/visits", permission: "view_visits" },
  { name: "Billing", icon: Wallet, color: "bg-yellow-500", href: "/Modules/Billing", permission: "view_billing" },
  { name: "Patient Payments", icon: CreditCard, color: "bg-yellow-600", href: "/Modules/Billing/patient-payments", permission: "view_billing" },
  { name: "OPD", icon: Stethoscope, color: "bg-teal-500", href: "/Modules/OPD", permission: "view_opd" },
  { name: "IPD", icon: BedDouble, color: "bg-indigo-500", href: "/Modules/IPD", permission: "view_ipd" },
  { name: "Emergency", icon: Siren, color: "bg-red-500", href: "/Modules/Emergency", permission: "view_emergency" },
  { name: "Operation Theatre", icon: Scissors, color: "bg-purple-500", href: "/Modules/OT", permission: "view_ot" },
  { name: "ICU", icon: HeartPulse, color: "bg-rose-500", href: "/Modules/ICU", permission: "view_icu" },
  { name: "Nursing", icon: ClipboardList, color: "bg-pink-500", href: "/Modules/Nursing", permission: "view_nursing" },
  { name: "Pharmacy", icon: Pill, color: "bg-green-500", href: "/Modules/Pharmacy", permission: "view_pharmacy" },
  { name: "Laboratory", icon: FlaskConical, color: "bg-amber-500", href: "/Modules/laboratory/labDashboard", permission: "view_laboratory" },
  { name: "Radiology", icon: Radiation, color: "bg-sky-500", href: "/Modules/Radiology", permission: "view_radiology" },
  { name: "Blood Bank", icon: Droplets, color: "bg-red-600", href: "/Modules/BloodBank", permission: "view_blood_bank" },
  { name: "Vaccination", icon: TestTube, color: "bg-lime-500", href: "/Modules/Vaccination", permission: "view_vaccination" },
  { name: "Dialysis", icon: Activity, color: "bg-blue-600", href: "/Modules/Dialysis", permission: "view_dialysis" },
  { name: "Physiotherapy", icon: Bike, color: "bg-orange-500", href: "/Modules/Physiotherapy", permission: "view_physiotherapy" },
  { name: "Dental", icon: Bone, color: "bg-slate-500", href: "/Modules/Dental", permission: "view_dental" },
  { name: "Cardiology", icon: Heart, color: "bg-pink-600", href: "/Modules/Cardiology", permission: "view_cardiology" },
  { name: "Endoscopy", icon: Microscope, color: "bg-violet-500", href: "/Modules/Endoscopy", permission: "view_endoscopy" },
  { name: "Oncology", icon: Brain, color: "bg-fuchsia-500", href: "/Modules/Oncology", permission: "view_oncology" },
  { name: "Insurance", icon: ShieldCheck, color: "bg-teal-600", href: "/Modules/Insurance", permission: "view_insurance" },
  { name: "Packages", icon: Gift, color: "bg-cyan-600", href: "/Modules/Packages", permission: "view_packages" },
  { name: "Referrals", icon: UserCheck, color: "bg-emerald-600", href: "/Modules/Referrals", permission: "view_referrals" },
  { name: "Medical Records", icon: FileText, color: "bg-blue-700", href: "/Modules/MedicalRecords", permission: "view_medical_records" },
  { name: "Ambulance", icon: Ambulance, color: "bg-red-700", href: "/Modules/Ambulance", permission: "view_ambulance" },
  { name: "House Keeping", icon: Thermometer, color: "bg-green-600", href: "/Modules/HouseKeeping", permission: "view_house_keeping" },
  { name: "Kitchen Diet", icon: UtensilsCrossed, color: "bg-orange-600", href: "/Modules/KitchenDiet", permission: "view_kitchen_diet" },
  { name: "Laundry", icon: Shirt, color: "bg-indigo-600", href: "/Modules/Laundry", permission: "view_laundry" },
  { name: "Mortuary", icon: HandPlatter, color: "bg-gray-600", href: "/Modules/Mortuary", permission: "view_mortuary" },
  { name: "Inventory", icon: Package, color: "bg-amber-600", href: "/Modules/Inventory", permission: "view_inventory" },
  { name: "Purchase", icon: ShoppingCart, color: "bg-violet-600", href: "/Modules/Purchase", permission: "view_purchase" },
  { name: "Store", icon: Warehouse, color: "bg-emerald-700", href: "/Modules/Store", permission: "view_store" },
  { name: "Fixed Assets", icon: Landmark, color: "bg-sky-600", href: "/Modules/FixedAssets", permission: "view_fixed_assets" },
  { name: "Accounts", icon: BarChart3, color: "bg-green-700", href: "/Modules/Accounts", permission: "view_accounts" },
  { name: "Payroll", icon: Wallet, color: "bg-yellow-600", href: "/Modules/Payroll", permission: "view_payroll" },
  { name: "Human Resources", icon: Users, color: "bg-blue-800", href: "/Modules/HumanResources", permission: "view_human_resources" },
  { name: "Attendance", icon: Clock, color: "bg-purple-600", href: "/Modules/Attendance", permission: "view_attendance" },
  { name: "Leave Management", icon: CalendarOff, color: "bg-rose-600", href: "/Modules/LeaveManagement", permission: "view_leave_management" },
  { name: "Reports", icon: BarChart3, color: "bg-teal-700", href: "/Modules/Reports", permission: "view_reports" },
  { name: "Settings", icon: Settings, color: "bg-slate-700", href: "/Modules/Settings", permission: "view_settings" },
  { name: "Administration", icon: Settings, color: "bg-gray-800", href: "/Modules/Administration", permission: "view_administration" },
];

export default function DashboardPage() {
  const { user, permissions } = useSelector((state) => state.auth);

  const hasPermission = useMemo(() => {
    return (permission) => permissions.includes(permission);
  }, [permissions]);

  const isSuperAdmin = useMemo(() => {
    return permissions.includes("*");
  }, [permissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Select a department to get started
          </p>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {departments.map((dept) => {
          const permitted = isSuperAdmin || hasPermission(dept.permission);

          if (permitted) {
            return (
              <Link
                key={dept.name}
                href={dept.href}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div
                  className={`h-14 w-14 rounded-xl ${dept.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                >
                  <dept.icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-medium text-center text-foreground leading-tight">
                  {dept.name}
                </span>
              </Link>
            );
          }

          return (
            <div
              key={dept.name}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border bg-muted/30 opacity-50 cursor-not-allowed select-none"
            >
              <div className="h-14 w-14 rounded-xl bg-gray-400 flex items-center justify-center shadow-sm relative">
                <dept.icon className="h-7 w-7 text-white/70" />
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-600 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="text-sm font-medium text-center text-muted-foreground leading-tight">
                {dept.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
