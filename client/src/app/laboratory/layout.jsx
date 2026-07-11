import AppSideBar from "@/components/layout/AppSideBar";
import Navbar from "@/components/layout/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const LaboratoryLayout = ({ children }) => {
  return (
    <div className="w-full flex ">
      <SidebarProvider>
        <AppSideBar />
        <main className="w-full ">
          <Navbar />
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default LaboratoryLayout;
