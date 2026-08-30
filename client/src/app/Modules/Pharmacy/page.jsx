"use client";

import React, { useState } from "react";
import { usePharmacyContext } from "./layout";
import MasterDataManager from "./MasterDataManager";
import SupplierManager from "./suppliers/SupplierManager";
import MedicineManager from "./medicines/MedicineManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  ShoppingCart,
  Pill,
  AlertTriangle,
  ClipboardList,
  Search,
  Plus,
  Truck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  TrendingUp,
  Store,
  Layers,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  Database,
  ShoppingBag,
  Boxes,
  Receipt,
  BarChart3,
  Tags,
  FlaskConical,
  Scale,
  Factory,
  Users,
} from "lucide-react";

export default function PharmacyPage() {
  const { selectedItem, setSelectedItem, setActiveSection } = usePharmacyContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample real-time queue data for previewing clinical e-prescriptions from OPD
  const pendingPrescriptions = [
    {
      id: "RX-101",
      tokenNo: "04",
      patientName: "Muhammad Usman",
      mrn: "MRN-26-088",
      doctorName: "Dr. Ayesha Tariq (Cardiology)",
      itemsCount: 4,
      itemsSummary: "Tab. Panadol 500mg, Cap. Augmentin 625mg, Tab. Lipitor 20mg, Syp. Hydryllin",
      timeAgo: "5 mins ago",
      status: "Waiting",
    },
    {
      id: "RX-102",
      tokenNo: "07",
      patientName: "Sobia Fatima",
      mrn: "MRN-26-104",
      doctorName: "Dr. Farhan Ali (Pediatrics)",
      itemsCount: 2,
      itemsSummary: "Syp. Brufen 100mg/5ml, Syp. Amoxil 125mg/5ml",
      timeAgo: "14 mins ago",
      status: "Waiting",
    },
    {
      id: "RX-103",
      tokenNo: "11",
      patientName: "Tariq Mehmood",
      mrn: "MRN-26-112",
      doctorName: "Dr. Salman Sheikh (General Medicine)",
      itemsCount: 3,
      itemsSummary: "Tab. Metformin 500mg, Tab. Glucophage 850mg, Tab. Loprin 75mg",
      timeAgo: "22 mins ago",
      status: "Preparing",
    },
  ];

  // Sample low stock alert items
  const lowStockItems = [
    { name: "Augmentin 625mg Tablet", form: "Tablet", stock: 12, reorder: 50, rack: "A-04" },
    { name: "Cravit 500mg (Levofloxacin)", form: "Tablet", stock: 8, reorder: 40, rack: "B-12" },
    { name: "Ventolin Inhaler 100mcg", form: "Inhaler", stock: 4, reorder: 25, rack: "C-01" },
    { name: "Flagyl 400mg Tablet", form: "Tablet", stock: 15, reorder: 60, rack: "A-09" },
  ];

  // Sample recent dispensing sales
  const recentSales = [
    {
      invoiceNo: "POS-0826-101",
      customer: "Walk-in Customer",
      items: 3,
      total: 1450,
      payment: "Cash",
      time: "13:42",
      status: "Paid",
    },
    {
      invoiceNo: "POS-0826-100",
      customer: "Muhammad Usman (MRN-26-088)",
      items: 4,
      total: 3200,
      payment: "Credit / Patient",
      time: "13:30",
      status: "Paid",
    },
    {
      invoiceNo: "POS-0826-099",
      customer: "Rashid Ali",
      items: 1,
      total: 620,
      payment: "Debit Card",
      time: "13:15",
      status: "Paid",
    },
  ];

  // ----------------------------------------------------
  // 1. Render Medicine Formulary Master
  // ----------------------------------------------------
  if (selectedItem && selectedItem.id === "medicine-formulary") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActiveSection("dashboard");
                }}
                className="hover:text-emerald-700 font-medium transition-colors"
              >
                Pharmacy
              </button>
              <span>/</span>
              <span className="text-slate-600 font-medium">D. Master Formulary & Settings</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">Product Master Directory</span>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Product Master Directory
                </h1>
                <p className="text-xs text-muted-foreground">
                  Product catalog, brand names, generic formulas, pack conversion multipliers, and retail pricing
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setActiveSection("dashboard");
            }}
            className="h-8 text-xs border-slate-200 text-slate-700 self-start sm:self-auto"
          >
            Back to Overview
          </Button>
        </div>

        <MedicineManager />
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. Render Suppliers & Distributors Directory
  // ----------------------------------------------------
  if (selectedItem && selectedItem.id === "suppliers-vendors") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActiveSection("dashboard");
                }}
                className="hover:text-emerald-700 font-medium transition-colors"
              >
                Pharmacy
              </button>
              <span>/</span>
              <span className="text-slate-600 font-medium">D. Master Formulary & Settings</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">Suppliers & Distributors</span>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Suppliers & Distributors Directory
                </h1>
                <p className="text-xs text-muted-foreground">
                  Vendor credentials, drug sales licenses, contact persons, and supplier ledger balances
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setActiveSection("dashboard");
            }}
            className="h-8 text-xs border-slate-200 text-slate-700 self-start sm:self-auto"
          >
            Back to Overview
          </Button>
        </div>

        <SupplierManager />
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. Render Foundational Master Lookups (Categories, Generics, Dosage Forms, Units, Mfrs)
  // ----------------------------------------------------
  const isMasterLookup =
    selectedItem &&
    (selectedItem.id === "drug-categories-generics" ||
      selectedItem.id === "pharmacy-settings" ||
      selectedItem.id === "product-categories" ||
      selectedItem.id === "generic-medicine" ||
      selectedItem.id === "dosage-forms" ||
      selectedItem.id === "units" ||
      selectedItem.id === "manufacturer" ||
      selectedItem.groupCode === "D");

  const getInitialMasterTab = () => {
    if (!selectedItem) return "categories";
    if (selectedItem.id === "pharmacy-settings" || selectedItem.id === "units") return "units";
    if (selectedItem.id === "manufacturer") return "manufacturers";
    if (selectedItem.id === "generic-medicine") return "generics";
    if (selectedItem.id === "dosage-forms") return "dosage-forms";
    return "categories";
  };

  if (isMasterLookup) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActiveSection("dashboard");
                }}
                className="hover:text-emerald-700 font-medium transition-colors"
              >
                Pharmacy
              </button>
              <span>/</span>
              <span className="text-slate-600 font-medium">{selectedItem.groupTitle}</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">{selectedItem.label}</span>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Pharmacy Master Data Lookups
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage categories, generics, dosage formulations, dispensing units, and manufacturers
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setActiveSection("dashboard");
            }}
            className="h-8 text-xs border-slate-200 text-slate-700 self-start sm:self-auto"
          >
            Back to Overview
          </Button>
        </div>

        <MasterDataManager initialTab={getInitialMasterTab()} />
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. Render Specific Operational Section Workspace
  // ----------------------------------------------------
  if (selectedItem) {
    const ItemIcon = selectedItem.icon || Store;
    const isReport = selectedItem.groupCode === "E";

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setActiveSection("dashboard");
                }}
                className="hover:text-emerald-700 font-medium transition-colors"
              >
                Pharmacy
              </button>
              <span>/</span>
              <span className="text-slate-600 font-medium">{selectedItem.groupTitle}</span>
              <span>/</span>
              <span className="text-emerald-700 font-bold">{selectedItem.label}</span>
            </div>

            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <ItemIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedItem.label}
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 font-normal">
                    Section {selectedItem.groupCode}
                  </Badge>
                </h1>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.description || `Manage ${selectedItem.label.toLowerCase()} records, operations, and transactions`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(null);
                setActiveSection("dashboard");
              }}
              className="h-8 text-xs border-slate-200 text-slate-700"
            >
              Back to Overview
            </Button>

            {isReport ? (
              <Button size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export Report
              </Button>
            ) : (
              <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                + New {selectedItem.label}
              </Button>
            )}
          </div>
        </div>

        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                {selectedItem.label} Workspace
              </CardTitle>
              <CardDescription className="text-xs">
                Filter and view records for {selectedItem.label.toLowerCase()}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={`Search ${selectedItem.label.toLowerCase()}...`}
                  className="pl-8 h-8 text-xs bg-slate-50"
                />
              </div>

              <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-700">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-500" />
                Filter
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <ItemIcon className="h-6 w-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                {selectedItem.label} Operations
              </h3>
              <p className="text-xs text-muted-foreground">
                We will implement the inventory & transaction workflows for <strong>{selectedItem.label}</strong> next.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  setSelectedItem({
                    id: "medicine-formulary",
                    label: "Medicine Formulary Master",
                    icon: Pill,
                    groupTitle: "D. Master Formulary & Settings",
                    groupCode: "D",
                  })
                }
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <Pill className="h-3.5 w-3.5 mr-1.5" />
                Open Medicine Formulary
              </Button>

              <Button
                size="sm"
                onClick={() =>
                  setSelectedItem({
                    id: "suppliers-vendors",
                    label: "Suppliers & Distributors",
                    icon: Users,
                    groupTitle: "D. Master Formulary & Settings",
                    groupCode: "D",
                  })
                }
                variant="outline"
                className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Truck className="h-3.5 w-3.5 mr-1.5" />
                Suppliers & Vendors
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // 5. Default Overview Dashboard View
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Pharmacy & POS Dispensary Overview
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time stock monitoring, e-Prescription dispensing queue, and master formulary management
              </p>
            </div>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              setSelectedItem({
                id: "medicine-formulary",
                label: "Product Master Directory",
                icon: Package,
                groupTitle: "D. Master Formulary & Settings",
                groupCode: "D",
              })
            }
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Product Master
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSelectedItem({
                id: "suppliers-vendors",
                label: "Suppliers & Distributors",
                icon: Users,
                groupTitle: "D. Master Formulary & Settings",
                groupCode: "D",
              })
            }
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Truck className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Suppliers & Vendors
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSelectedItem({
                id: "drug-categories-generics",
                label: "Categories & Generics",
                icon: Tags,
                groupTitle: "D. Master Formulary & Settings",
                groupCode: "D",
              })
            }
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Database className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
            Master Lookups
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Today's Dispensing Sales
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                Rs. 54,820
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="h-3 w-3" />
                <span>+12.8% vs yesterday (38 bills)</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-linear-to-br from-white to-amber-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                e-Prescription Queue
              </p>
              <h3 className="text-2xl font-bold text-amber-950">
                {pendingPrescriptions.length} Pending
              </h3>
              <p className="text-[11px] text-amber-700 font-medium">
                Live from OPD Consultation
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100/80 text-amber-700">
              <ClipboardList className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-xs border-slate-200/80 cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() =>
            setSelectedItem({
              id: "medicine-formulary",
              label: "Product Master Directory",
              icon: Package,
              groupTitle: "D. Master Formulary & Settings",
              groupCode: "D",
            })
          }
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Products & Medicines
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                Active Catalog
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium">
                Click to manage products →
              </p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-linear-to-br from-white to-rose-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                Critical Stock Alerts
              </p>
              <h3 className="text-2xl font-bold text-rose-950">
                {lowStockItems.length} Low Stock
              </h3>
              <p className="text-[11px] text-rose-700 font-medium">
                Below minimum reorder level
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-100/80 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live OPD Prescriptions & Sales (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-xs border-slate-200/80">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-emerald-600" />
                  Live OPD e-Prescription Queue
                </CardTitle>
                <CardDescription className="text-xs">
                  Prescriptions sent by doctors for direct patient dispensing
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedItem({
                    id: "prescription-queue",
                    label: "e-Prescriptions Queue",
                    icon: ClipboardList,
                    groupTitle: "A. Sales & Dispensing",
                    groupCode: "A",
                  })
                }
                className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold"
              >
                View Full Queue
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {pendingPrescriptions.map((rx) => (
                  <div key={rx.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-mono text-xs">
                          Token #{rx.tokenNo}
                        </Badge>
                        <span className="font-bold text-xs text-slate-900">{rx.patientName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">({rx.mrn})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        Prescribed by: <strong className="text-slate-700">{rx.doctorName}</strong>
                      </p>
                      <p className="text-[11px] text-slate-600 truncate italic">
                        {rx.itemsSummary}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {rx.timeAgo}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          setSelectedItem({
                            id: "pharmacy-pos",
                            label: "POS Counter Sale & Dispense",
                            icon: ShoppingCart,
                            groupTitle: "A. Sales & Dispensing",
                            groupCode: "A",
                          })
                        }
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Dispense
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-slate-200/80">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-teal-600" />
                  Recent Dispensing Invoices
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest counter sales transactions and POS receipts
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedItem({
                    id: "sales-history-returns",
                    label: "Sales History & Returns",
                    icon: Receipt,
                    groupTitle: "A. Sales & Dispensing",
                    groupCode: "A",
                  })
                }
                className="h-7 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 font-semibold"
              >
                All Sales
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Invoice #</TableHead>
                    <TableHead className="text-xs font-semibold">Customer / Patient</TableHead>
                    <TableHead className="text-xs font-semibold">Payment</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Total (Rs.)</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.invoiceNo} className="hover:bg-slate-50/70">
                      <TableCell className="text-xs font-mono font-medium text-slate-800">
                        {sale.invoiceNo}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">
                        {sale.customer}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {sale.payment}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 text-right">
                        Rs. {sale.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                          {sale.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fast Search, Stock Alerts & Formulary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-xs border-slate-200/80 bg-slate-50/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-600" />
                Quick Formulary Stock & Price Lookup
              </CardTitle>
              <CardDescription className="text-xs">
                Check medicine availability, rack location, and unit price
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Type drug brand name or generic formula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs bg-white h-9"
                />
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Panadol 500mg Tab</p>
                    <p className="text-[11px] text-muted-foreground">Paracetamol • GSK • Rack A-01</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">Rs. 4.50 / tab</p>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-800 border-emerald-200">
                      1,250 in stock
                    </Badge>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Augmentin 625mg Tab</p>
                    <p className="text-[11px] text-muted-foreground">Amoxicillin + Clav • GSK • Rack A-04</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">Rs. 32.00 / tab</p>
                    <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-800 border-rose-200">
                      12 in stock (Low)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs border-slate-200/80">
            <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Low Stock & Reorder Alert
                </CardTitle>
                <CardDescription className="text-xs">
                  Medicines below threshold level
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedItem({
                    id: "stock-alerts",
                    label: "Expiry & Low Stock Alerts",
                    icon: AlertTriangle,
                    groupTitle: "B. Inventory & Stock Control",
                    groupCode: "B",
                  })
                }
                className="h-7 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 font-semibold"
              >
                All Alerts
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.form} • Rack: <span className="font-mono font-medium text-slate-700">{item.rack}</span>
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-bold text-rose-600">{item.stock} left</span>
                        <span className="text-[10px] text-slate-400">/ min {item.reorder}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedItem({
                            id: "purchase-orders",
                            label: "Purchase Orders (PO)",
                            icon: FileSpreadsheet,
                            groupTitle: "C. Purchasing & Procurement",
                            groupCode: "C",
                          })
                        }
                        className="h-6 text-[10px] px-2 py-0 border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        + Create PO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
