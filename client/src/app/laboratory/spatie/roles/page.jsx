"use client";
import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller, get } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRole, deleteRole, getRoleById, getRoles, updateRole } from "@/services/roles.service";
import { set } from "zod";

export default function RolesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [list, setList] = useState([]);

  const schema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters long"),
  });

  const defaultValues = {
    name: "",
  };

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setList(response);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };
  // Auto-dismiss messages after a short timeout
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateRole(editingId, data);
      } else {
        await createRole(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Role updated successfully."
          : "Role created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save role",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const roleData = await getRoleById(id);

      reset({
        name: roleData?.name ?? "",
      });

      setEditingId(roleData?.id);
    } catch (error) {
      console.error("Failed to fetch role:", error);
      setMessage({ type: "error", text: "Failed to load role data" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await deleteRole(id);

      setMessage({
        type: "success",
        text: "Role deleted successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      setMessage({ type: "error", text: "Failed to delete role" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setEditingId(null);
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    });
  }, []);

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
        Laboratory Roles
      </h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={rhfHandleSubmit(onSubmit)}
        className="p-6 rounded-lg shadow-md mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1" htmlFor="name">
              Role Name
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter role name" />
              )}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : editingId ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Roles List</h2>
        <DataTable columns={columns} data={list} filterColumn="name" />
      </div>
    </div>
  );
}
