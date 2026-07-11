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
import { createPermission, DeletePermission, getPermissionById, getPermissions, updatePermission } from "@/services/permissions.service";

export default function PermissionsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [list, setList] = useState([]);

  const schema = z.object({
    name: z.string().min(2, "Permission name must be at least 2 characters long"),
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
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await getPermissions();
      setList(response);
    } catch (error) {
      console.error("Error fetching permissions:", error);
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
        await updatePermission(editingId, data);
      } else {
        await createPermission(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Permission updated successfully."
          : "Permission created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      fetchPermissions();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save permission",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const permissionData = await getPermissionById(id);

      reset({
        name: permissionData?.name ?? "",
      });

      setEditingId(permissionData?.id);
    } catch (error) {
      console.error("Failed to fetch permission:", error);
      setMessage({ type: "error", text: "Failed to load permission data" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await DeletePermission(id);

      setMessage({
        type: "success",
        text: "Permission deleted successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      fetchPermissions();
    } catch (error) {
      console.error("Failed to delete permission:", error);
      setMessage({ type: "error", text: "Failed to delete permission" });
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
        Laboratory Permissions
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
              Permission Name
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter permission name" />
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
        <h2 className="text-xl font-bold mb-4">Permissions List</h2>
        <DataTable columns={columns} data={list} filterColumn="name" />
      </div>
    </div>
  );
}
