"use client";

import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/layout/Navbar";

export default function ModulesLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
