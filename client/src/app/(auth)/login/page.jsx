"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, clearError } from "@/reduxToolKit/slices/authSlice";
import { loginSchema } from "@/lib/zodeSchema";
import { Heart, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isLoggedIn } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/Modules/Dashboard");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isLoggedIn, router, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (!result.error) {
      router.push("/Modules/Dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">HIMS</h1>
              <p className="text-sm text-slate-400">
                Hospital Information Management
              </p>
            </div>
          </div>

          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Streamline Your Hospital Operations
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              A comprehensive solution for managing patient records, billing,
              pharmacy, laboratory, and more — all in one place.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md w-full">
            {[
              "Patient Management",
              "Billing & Accounts",
              "Pharmacy Control",
              "Lab Reports",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <div className="h-2 w-2 rounded-full bg-[#2563EB]" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A]">HIMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Welcome back
            </h2>
            <p className="text-slate-500 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2"
              role="alert"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0F172A]">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="pl-10 h-11 bg-white border-slate-200 focus-visible:border-[#2563EB] focus-visible:ring-[#2563EB]/20"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#0F172A]">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="pl-10 pr-10 h-11 bg-white border-slate-200 focus-visible:border-[#2563EB] focus-visible:ring-[#2563EB]/20"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium"
            >
              Create an account
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
