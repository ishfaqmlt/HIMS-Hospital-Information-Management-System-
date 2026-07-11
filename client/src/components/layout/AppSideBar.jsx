"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Home,
  UserPlus,
  FileText,
  Search,
  Settings,
  Stethoscope,
  FlaskConical,
  ShieldCheck,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";


import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarSeparator } from "../ui/sidebar";



/* ===============================
   SIDEBAR DATA (Single Structure)
================================ */

const sidebarItems = [
  {
    group: "Reception",
    items: [
      {
        title: "Patient Search",
        url: "/laboratory/search",
        icon: Search,
      },
      {
        title: "Patient Registration",
        url: "/laboratory/patientRegistration",
        icon: UserPlus,
      },
      {
        title: "Return Bill",
        url: "/laboratory/return-bill",
        icon: FileText,
      },
      
     
    ],
  },
 
  {
    group: "Laboratory",
    items: [
      {
        title: "Sample Collection",
        url: "/laboratory/sample",
        icon: FlaskConical,
      },
      {
        title: "Enter Results",
        url: "/lab/results",
        icon: FileText,
      },
      {
        title: "Approve Reports",
        url: "/lab/approve",
        icon: ShieldCheck,
      },
      {
        title: "Print Reports",
        url: "/lab/print",
        icon: FileText,
      },
       {
            title: "Doctors",
            url: "/laboratory/doctors",
            icon: Stethoscope,
          },
    ],
  },
  {
    group: "Administration",
    items: [
      
      {
        title: "User Management",
        url: "/laboratory/registerUsers",
        icon: Users,
      },
       {
        title: "Authorization Settings",
        icon: Settings,
        subItems: [
          {
        title: "Role Management",
        url: "/laboratory/spatie/roles",
        icon: Settings,
         },
          {
            title: "Permission Management",
            url: "/laboratory/spatie/permissions",
            icon: Building2,
          },
          
         
        ],
      },
       {
        title: "Master Settings",
        icon: Settings,
        subItems: [
          {
        title: "Profile Settings",
        url: "/laboratory/labProfile",
        icon: Settings,
         },
          {
            title: "Department",
            url: "/laboratory/departments",
            icon: Building2,
          },
          {
            title: "Sub-Header",
            url: "/laboratory/subHeader",
            icon: Building2,
          },
          {
            title: "Required Samples",
            url: "/laboratory/requiredSamples",
            icon: Building2,
          },
          {
            title: "Sample Performs",
            url: "/laboratory/samplePerforms",
            icon: Building2,
          },
          {
            title: "Reported at",
            url: "/laboratory/reportedAt",
            icon: Building2,
          },
          {
            title: "Master Tests",
            url: "/laboratory/masterTests",
            icon: Building2,
          },
         
        ],
      },
      {
        title: "Discount Management",
        url: "/laboratory/discountMaster",
        icon: Users,
      },
      {
        title: "Lab Profile Management",
        url: "/laboratory/labProfile",
        icon: Users,
      },
      
    ],
  },
];

/* ===============================
   SIDEBAR COMPONENT
================================ */

export default function AppSideBar() {
  return (
    <Sidebar collapsible="icon">
      {/* ================= Header ================= */}
      <SidebarHeader className="h-16 flex items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/file.svg" alt="logo" width={22} height={22} />
                <span className="font-bold text-lg">Famous Lab.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ================= Dynamic Groups ================= */}
      <SidebarContent>
        {sidebarItems.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.subItems ? (
                    <Collapsible
                      key={item.title}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.title}</span>

                            {/* Rotating Chevron */}
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-4 mt-1">
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuButton asChild>
                                <Link
                                  href={subItem.url}
                                  className="flex items-center gap-2"
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>

            <SidebarSeparator />
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ================= Footer ================= */}
      <SidebarFooter>
        <div className="px-4 py-3 text-sm font-semibold text-muted-foreground">
          Salar Technologies
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
