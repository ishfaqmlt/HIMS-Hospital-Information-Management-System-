"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import userService from "@/services/user.service";
import roleService from "@/services/role.service";
import { Loader2, Plus } from "lucide-react";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const roleAssignSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAssignRole, setSelectedAssignRole] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  const {
    register: registerRole,
    handleSubmit: handleRoleSubmit,
    reset: resetRole,
    setValue: setRoleValue,
    formState: { errors: roleErrors },
  } = useForm({
    resolver: zodResolver(roleAssignSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onCreateUser = async (formData) => {
    if (!selectedRole) return;
    try {
      setSubmitting(true);
      await userService.create({ ...formData, role: selectedRole });
      setCreateOpen(false);
      reset();
      setSelectedRole("");
      fetchData();
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onAssignRole = async (formData) => {
    try {
      setSubmitting(true);
      await userService.assignRole(selectedUser.id, formData.role);
      setRoleOpen(false);
      setSelectedUser(null);
      resetRole();
      setSelectedAssignRole("");
      fetchData();
    } catch (error) {
      console.error("Failed to assign role:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onToggleStatus = async (user) => {
    const action = user.is_active !== false ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    try {
      await userService.toggleStatus(user.id);
      fetchData();
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const onDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.delete(userId);
      fetchData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const openRoleDialog = (user) => {
    setSelectedUser(user);
    const initialRole = user.roles?.[0]?.name || "";
    setSelectedAssignRole(initialRole);
    setRoleValue("role", initialRole, { shouldValidate: true });
    setRoleOpen(true);
  };

  const columns = useMemo(
    () =>
      getColumns({
        onAssignRole: openRoleDialog,
        onToggleStatus: onToggleStatus,
      }),
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users and assign roles
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* DataTable */}
      <DataTable columns={columns} data={users} filterColumn="name" />

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign a role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedRole && (
                <p className="text-sm text-destructive">Role is required</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateOpen(false);
                  setSelectedRole("");
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Change the role for <strong>{selectedUser?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleRoleSubmit(onAssignRole)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedAssignRole}
                onValueChange={(val) => {
                  setSelectedAssignRole(val);
                  setRoleValue("role", val, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roleErrors.role && (
                <p className="text-sm text-destructive">
                  {roleErrors.role.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRoleOpen(false);
                  setSelectedAssignRole("");
                  resetRole();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Assign Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
