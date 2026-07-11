"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema } from "@/lib/zodeSchema";
import { createBranch, getBranches, updateBranch } from "@/services/branches.service";

export default function BranchesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [branches, setBranches] = useState([]);

  const defaultValues = {
    branchCode: "",
    branchName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    isMainBranch: false,
    isActive: true,
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchSchema),
    defaultValues,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadBranches = async () => {
    try {
      const list = await getBranches();
      setBranches(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load branches." });
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateBranch(editingId, data);
      } else {
        await createBranch(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Branch updated successfully."
          : "Branch created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      await loadBranches();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || err?.message ||
          "Failed to save branch.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setEditingId(null);
    setMessage(null);
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: (row) => {
        reset(row);
        setEditingId(row.id);
      },
    });
  }, [reset]);

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
        Branches
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

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-lg shadow-md mb-8">
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Branch Code</Label>
              <Controller
                name="branchCode"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.branchCode && (
                <p className="text-red-600 text-sm">{errors.branchCode.message}</p>
              )}
            </div>

            <div>
              <Label>Branch Name</Label>
              <Controller
                name="branchName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.branchName && (
                <p className="text-red-600 text-sm">{errors.branchName.message}</p>
              )}
            </div>

            <div>
              <Label>Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.city && (
                <p className="text-red-600 text-sm">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label>Address</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.address && (
                <p className="text-red-600 text-sm">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label>Main Branch</Label>
              <Controller
                name="isMainBranch"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value === "true")}
                    value={field.value ? "true" : "false"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between">
            
            <div className="flex gap-2 mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : editingId ? "Update" : "Create"}
              </Button>

              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        {/* </div> */}
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Branches</h2>
        <DataTable columns={columns} data={branches} filterColumn="branchName" />
      </div>
    </div>
  );
}
