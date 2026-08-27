"use client";

import React, { useState, createContext, useContext, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Store,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  ClipboardList,
  Boxes,
  Layers,
  Scale,
  AlertTriangle,
  ShoppingBag,
  Truck,
  FileSpreadsheet,
  RotateCcw,
  Database,
  Pill,
  Tags,
  Users,
  Settings,
  BarChart3,
  History,
  TrendingUp,
  Building2,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

// Create Pharmacy Context for active section and navigation state
export const PharmacyContext = createContext({
  activeSection: "dashboard",
  setActiveSection: () => {},
  selectedItem: null,
  setSelectedItem: () => {},
});

export const usePharmacyContext = () => useContext(PharmacyContext);

// Streamlined & Refactored Pharmacy Navigation (Consolidated from 47 detail items down to 17 core operations)
export const pharmacyNavigation = [
  {
    id: "sales-dispensing",
    code: "A",
    title: "Sales & Dispensing",
    icon: ShoppingCart,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-200",
    badge: "3 Ops",
    items: [
      {
        id: "pharmacy-pos",
        label: "POS Counter Sale & Dispense",
        description: "Retail sales, barcode billing, and patient dispensing",
        icon: ShoppingCart,
        badge: "POS",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      },
      {
        id: "prescription-queue",
        label: "e-Prescriptions Queue",
        description: "Live OPD & IPD doctor prescriptions awaiting dispensing",
        icon: ClipboardList,
        badge: "Live",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      },
      {
        id: "sales-history-returns",
        label: "Sales History & Returns",
        description: "Invoices, customer returns, credit notes, and patient bills",
        icon: Receipt,
      },
    ],
  },
  {
    id: "inventory-stock",
    code: "B",
    title: "Inventory & Stock Control",
    icon: Boxes,
    color: "text-purple-600 bg-purple-500/10 border-purple-200",
    badge: "3 Ops",
    items: [
      {
        id: "stock-batches",
        label: "Stock Inventory & Batches",
        description: "Real-time on-hand stock, batch tracking, and shelf locations",
        icon: Boxes,
      },
      {
        id: "stock-adjustments-transfers",
        label: "Stock Adjustments & Transfers",
        description: "Physical audit reconciliation, ward transfers, and damage write-offs",
        icon: Scale,
      },
      {
        id: "stock-alerts",
        label: "Expiry & Low Stock Alerts",
        description: "Early warnings for near-expiry drugs and reorder triggers",
        icon: AlertTriangle,
        badge: "Alerts",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      },
    ],
  },
  {
    id: "purchasing-procurement",
    code: "C",
    title: "Purchasing & Procurement",
    icon: ShoppingBag,
    color: "text-amber-600 bg-amber-500/10 border-amber-200",
    badge: "3 Ops",
    items: [
      {
        id: "stock-purchases-grn",
        label: "Stock Purchases & GRN",
        description: "Receive distributor shipments, enter batch costs, and stock shelves",
        icon: Truck,
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders (PO)",
        description: "Requisition orders and pending supplier deliveries",
        icon: FileSpreadsheet,
      },
      {
        id: "purchase-returns",
        label: "Purchase Returns & Debit Notes",
        description: "Distributor returns, damaged batches, and vendor adjustments",
        icon: RotateCcw,
      },
    ],
  },
  {
    id: "master-formulary",
    code: "D",
    title: "Master Formulary & Settings",
    icon: Database,
    color: "text-blue-600 bg-blue-500/10 border-blue-200",
    badge: "4 Ops",
    items: [
      {
        id: "medicine-formulary",
        label: "Medicine Formulary Master",
        description: "Active drug directory, strengths, brands, and selling prices",
        icon: Pill,
      },
      {
        id: "drug-categories-generics",
        label: "Categories & Generics",
        description: "Therapeutic classes, dosage forms, and generic molecules",
        icon: Tags,
      },
      {
        id: "suppliers-vendors",
        label: "Suppliers & Distributors",
        description: "Pharmaceutical vendor profiles, reps, and credit terms",
        icon: Users,
      },
      {
        id: "pharmacy-settings",
        label: "Pharmacy Settings & Units",
        description: "Dispensing units, conversions, tax rates, and general preferences",
        icon: Settings,
      },
    ],
  },
  {
    id: "reports-closing",
    code: "E",
    title: "Reports & Daily Closing",
    icon: BarChart3,
    color: "text-teal-600 bg-teal-500/10 border-teal-200",
    badge: "4 Ops",
    items: [
      {
        id: "daily-closing",
        label: "Daily Pharmacy Closing",
        description: "Cash drawer shift reconciliation and day-end closing register",
        icon: History,
      },
      {
        id: "sales-profit-reports",
        label: "Sales & Profit Margin Reports",
        description: "Daily revenue, gross margin, tax reports, and fast-moving drugs",
        icon: TrendingUp,
      },
      {
        id: "stock-expiry-reports",
        label: "Stock Valuation & Expiry Reports",
        description: "Total inventory value, batch expiry forecasts, and reorder sheets",
        icon: BarChart3,
      },
      {
        id: "supplier-ledger",
        label: "Supplier Statements & Ledger",
        description: "Purchases vs payments summary and outstanding vendor balances",
        icon: Building2,
      },
    ],
  },
];

export default function PharmacyLayout({ children }) {
  const pathname = usePathname();
  const { user, roles, permissions } = useSelector((state) => state.auth || {});

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Manage open state for the 5 accordion groups
  const [openSections, setOpenSections] = useState({
    "sales-dispensing": true,
    "inventory-stock": true,
    "purchasing-procurement": true,
    "master-formulary": true,
    "reports-closing": true,
  });

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandAll = () => {
    setOpenSections({
      "sales-dispensing": true,
      "inventory-stock": true,
      "purchasing-procurement": true,
      "master-formulary": true,
      "reports-closing": true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      "sales-dispensing": false,
      "inventory-stock": false,
      "purchasing-procurement": false,
      "master-formulary": false,
      "reports-closing": false,
    });
  };

  const hasPermission = (permissionName) => {
    if (!permissionName) return true;

    const userRoles = roles && roles.length > 0 ? roles : user?.roles || [];
    if (userRoles.some((r) => (r.name || r) === "super_admin" || (r.name || r) === "admin")) {
      return true;
    }

    const userPerms = permissions && permissions.length > 0 ? permissions : user?.permissions || [];
    if (userPerms.includes("*")) return true;

    return userPerms.some((p) => {
      const pName = p.name || p;
      return pName === permissionName || pName === "pharmacy" || pName === "view_pharmacy";
    });
  };

  // Filter groups & items in real-time
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) {
      return pharmacyNavigation;
    }
    const q = searchQuery.toLowerCase();
    return pharmacyNavigation
      .map((group) => {
        const matchingItems = group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            group.title.toLowerCase().includes(q)
        );
        return {
          ...group,
          items: matchingItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  const handleSelectNav = (item, group) => {
    setActiveSection(item.id);
    setSelectedItem({ ...item, groupTitle: group.title, groupCode: group.code });
  };

  return (
    <PharmacyContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedItem,
        setSelectedItem,
      }}
    >
      <div className="flex min-h-screen bg-slate-50/50">
        {/* Left Sidebar Navigation */}
        <aside className="w-72 bg-card border-r border-border shrink-0 p-3.5 space-y-4 shadow-xs sticky top-0 h-screen overflow-y-auto flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 px-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm leading-tight text-foreground">Pharmacy & POS</h2>
                  <p className="text-[11px] text-muted-foreground">Dispensary & Inventory</p>
                </div>
              </div>

              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-mono">
                17 Modules
              </Badge>
            </div>

            {/* Dashboard Root Button */}
            <Link
              href="/Modules/Pharmacy"
              onClick={() => {
                setActiveSection("dashboard");
                setSelectedItem(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                activeSection === "dashboard" && pathname === "/Modules/Pharmacy" && !selectedItem
                  ? "bg-emerald-600 text-white shadow-xs border-emerald-600"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Pharmacy Overview Dashboard
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-70" />
            </Link>

            {/* Real-time Search Input */}
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search modules (e.g., POS, stock, expiry)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
                <span>Operation Groups:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="hover:text-foreground font-medium underline"
                  >
                    Expand
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="hover:text-foreground font-medium underline"
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>

            {/* Consolidated Navigation Groups */}
            <div className="space-y-2.5 pr-0.5">
              {filteredNavigation.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = searchQuery.trim() ? true : !!openSections[group.id];

                return (
                  <div
                    key={group.id}
                    className="rounded-lg border border-slate-200/70 bg-white/80 overflow-hidden shadow-2xs"
                  >
                    {/* Section Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleSection(group.id)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100/80 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1 rounded ${group.color}`}>
                          <GroupIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {group.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-muted-foreground bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {group.items.length}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Section Items Grid */}
                    {isOpen && (
                      <div className="p-1.5 space-y-0.5 border-t border-slate-100 bg-white">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isSelected = selectedItem?.id === item.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectNav(item, group)}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium text-left transition-all ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-300 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <ItemIcon
                                  className={`h-4 w-4 shrink-0 ${
                                    isSelected ? "text-emerald-600" : "text-slate-400"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">{item.label}</p>
                                </div>
                              </div>

                              {item.badge ? (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1.5 py-0 rounded font-mono ${
                                    item.badgeColor || "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {item.badge}
                                </Badge>
                              ) : isSelected ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredNavigation.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed">
                  No matching pharmacy operations found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-border space-y-2">
            <Link href="/Modules/Dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs h-8 bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
              >
                <span className="flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
                  Main HIMS Dashboard
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px]">
          {children}
        </main>
      </div>
    </PharmacyContext.Provider>
  );
}
