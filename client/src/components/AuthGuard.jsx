"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { hydrate } from "@/reduxToolKit/slices/authSlice";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children, requiredPermissions = [] }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoggedIn, loading, permissions } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (
    requiredPermissions.length > 0 &&
    !requiredPermissions.some((p) => permissions.includes(p))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Access Denied
          </h1>
          <p className="text-slate-500">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
