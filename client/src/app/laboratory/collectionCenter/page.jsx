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
import { collectionCenterSchema as CollectionCenterSchema } from "@/lib/zodeSchema";
import { createCollectionCenter, getCollectionCenters, updateCollectionCenter } from "@/services/collectionCenter.service";
import { getBranches } from "@/services/branches.service";

export default function CollectionCentersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [centers, setCenters] = useState([]);
  const [branches, setBranches] = useState([]);

  const defaultValues = {
    branch_id: "",
    centerName: "",
    centerCode: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    isActive: true,
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CollectionCenterSchema),
    defaultValues,
  });

  useEffect(() => {
    loadCenters();
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
      console.error("Failed to load branches:", error);
    }
  };

  const loadCenters = async () => {
    try {
      const list = await getCollectionCenters();
      setCenters(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load collection centers." });
    }
  };

  const onSubmit = async (data) => {
    console.log("Form data:", data);
    
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateCollectionCenter(editingId, data);
      } else {
        await createCollectionCenter(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Collection center updated successfully."
          : "Collection center created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      await loadCenters();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || err?.message ||
          "Failed to save collection center.",
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
        Collection Centers
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
              <Label>Branch</Label>
              <Controller
                name="branch_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)}>
                          {branch.branchName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch_id && (
                <p className="text-red-600 text-sm">{errors.branch_id.message}</p>
              )}
            </div>

            <div>
              <Label>Center Code</Label>
              <Controller
                name="centerCode"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.centerCode && (
                <p className="text-red-600 text-sm">{errors.centerCode.message}</p>
              )}
            </div>

            <div>
              <Label>Center Name</Label>
              <Controller
                name="centerName"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.centerName && (
                <p className="text-red-600 text-sm">{errors.centerName.message}</p>
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
        <h2 className="text-xl font-bold mb-4">Collection Centers</h2>
        <DataTable columns={columns} data={centers} filterColumn="centerName" />
      </div>
    </div>
  );
}
