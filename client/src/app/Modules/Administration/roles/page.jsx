"use client";

import React, { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import roleService from "@/services/role.service";
import permissionService from "@/services/permission.service";
import { Loader2, Plus, Pencil, Trash2, Shield, Check } from "lucide-react";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
});

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getAll(),
        permissionService.getAll(),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onCreateRole = async (data) => {
    try {
      setSubmitting(true);
      await roleService.create(data);
      setCreateOpen(false);
      reset();
      fetchData();
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openPermissionsDialog = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.name) || []);
    setPermissionsOpen(true);
  };

  const togglePermission = (permName) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(permissions.map((p) => p.name));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const savePermissions = async () => {
    try {
      setSubmitting(true);
      await roleService.update(selectedRole.id, {
        name: selectedRole.name,
        permissions: selectedPermissions,
      });
      setPermissionsOpen(false);
      setSelectedRole(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update permissions:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteRole = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await roleService.delete(roleId);
      fetchData();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const parts = perm.name.split("_");
    const action = parts[0]; // view, create, edit, delete
    const module = parts.slice(1).join("_"); // rest is module name
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm.name);
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage roles and their permissions
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {role.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 5).map((perm) => (
                      <Badge key={perm.id} variant="secondary" className="text-xs">
                        {perm.name}
                      </Badge>
                    ))}
                    {role.permissions?.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-sm text-muted-foreground">
                        No permissions
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPermissionsDialog(role)}
                      title="Manage Permissions"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRole(role.id)}
                      title="Delete Role"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No roles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create a new role. You can assign permissions after creation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. doctor, nurse"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsOpen} onOpenChange={setPermissionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Assign permissions to <strong>{selectedRole?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllPermissions}
            >
              <Check className="h-4 w-4 mr-1" />
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllPermissions}
            >
              Clear All
            </Button>
            <span className="text-sm text-muted-foreground self-center ml-auto">
              {selectedPermissions.length} of {permissions.length} selected
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <div key={module} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">
                    {module.replace(/_/g, " ")}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const allSelected = perms.every((p) =>
                        selectedPermissions.includes(p)
                      );
                      if (allSelected) {
                        setSelectedPermissions((prev) =>
                          prev.filter((p) => !perms.includes(p))
                        );
                      } else {
                        setSelectedPermissions((prev) => [
                          ...new Set([...prev, ...perms]),
                        ]);
                      }
                    }}
                  >
                    {perms.every((p) => selectedPermissions.includes(p))
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {perms.map((permName) => {
                    const isSelected = selectedPermissions.includes(permName);
                    return (
                      <button
                        key={permName}
                        type="button"
                        onClick={() => togglePermission(permName)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {permName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPermissionsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={savePermissions} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
