"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  TestTube,
  UserPlus,
  CheckCircle,
  FileText,
  BarChart3,
  Settings,
  Clock,
  TrendingUp,
  Activity,
  ChevronRight,
  Beaker,
  Microscope,
  Stethoscope,
  ClipboardList,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import labHeaderService from "@/services/labHeader.service";
import masterTestsService from "@/services/masterTests.service";
import labRequiredSampleService from "@/services/labRequiredSample.service";

const labMenuItems = [
  {
    label: "Patient Registration",
    icon: UserPlus,
    href: "/Modules/laboratory/patientRegistration",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Sample Collection",
    icon: TestTube,
    href: "/Modules/laboratory/collectionCenter",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Test Perform",
    icon: FlaskConical,
    href: "/Modules/laboratory/samplePerforms",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Test Approval",
    icon: CheckCircle,
    href: "/Modules/laboratory/reportedAt",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Patient Reports",
    icon: FileText,
    href: "/Modules/laboratory/patientReports",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    label: "Lab Reports",
    icon: BarChart3,
    href: "/Modules/laboratory/labReports",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
  },
];

const masterSettingsItems = [
  {
    label: "Lab Profile",
    icon: Settings,
    href: "/Modules/laboratory/labProfile",
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    label: "Headers",
    icon: ClipboardList,
    href: "/Modules/laboratory/header",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "Sub Headers",
    icon: FileText,
    href: "/Modules/laboratory/subHeader",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    label: "Required Samples",
    icon: TestTube,
    href: "/Modules/laboratory/requiredSamples",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    label: "Master Tests",
    icon: Microscope,
    href: "/Modules/laboratory/masterTests",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

export default function LabDashboardPage() {
  const [stats, setStats] = useState({
    headers: 0,
    subHeaders: 0,
    requiredSamples: 0,
    masterTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [headersRes, samplesRes, testsRes] = await Promise.all([
          labHeaderService.getAll(),
          labRequiredSampleService.getAll(),
          masterTestsService.getAll(),
        ]);

        setStats({
          headers: headersRes.data?.data?.length || headersRes.data?.length || 0,
          subHeaders: 0,
          requiredSamples: samplesRes.data?.data?.length || samplesRes.data?.length || 0,
          masterTests: testsRes.data?.data?.length || testsRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch lab stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summaryCards = [
    {
      label: "Lab Headers",
      value: stats.headers,
      icon: ClipboardList,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Required Samples",
      value: stats.requiredSamples,
      icon: TestTube,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Master Tests",
      value: stats.masterTests,
      icon: Microscope,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratory Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage lab tests, samples, and reports
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`${card.bg} p-3 rounded-xl`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        card.value
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workflow Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Workflow</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {labMenuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href}>
                <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer border-0 shadow-sm h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground leading-tight">
                      {item.label}
                    </span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Master Settings Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Master Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {masterSettingsItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href}>
                <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer border-0 shadow-sm h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl bg-linear-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground leading-tight">
                      {item.label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
