"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { logoutUser } from "@/reduxToolKit/slices/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, token, roles, permissions, isLoggedIn, loading, error } =
    useSelector((state) => state.auth);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    router.push("/login");
  }, [dispatch, router]);

  const hasRole = useCallback(
    (role) => {
      if (Array.isArray(role)) {
        return role.some((r) => roles.includes(r));
      }
      return roles.includes(role);
    },
    [roles]
  );

  const hasPermission = useCallback(
    (permission) => {
      if (Array.isArray(permission)) {
        return permission.some((p) => permissions.includes(p));
      }
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions) => {
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  return {
    user,
    token,
    roles,
    permissions,
    isLoggedIn,
    loading,
    error,
    logout,
    hasRole,
    hasPermission,
    hasAllPermissions,
  };
}
