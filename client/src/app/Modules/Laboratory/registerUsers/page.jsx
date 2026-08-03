"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
 import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labProfileSchema } from "@/lib/zodeSchema";
export default function RegisterUsers() {
  const [loading, setLoading] = useState(false);
        const [message, setMessage] = useState(null);
        const [editingId, setEditingId] = useState(null);
const defaultValues = {
    lab_profile_id: "",
    role: "",
    name: "",
    email: "",
    password: "",
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(labProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    loadLabProfiles();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadLabProfiles = async () => {
    try {
      const list = await getLabProfiles();
      setLabProfiles(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load lab profiles." });
    }
  };

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateLabProfile(editingId, data);
      } else {
        await createLabProfile(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Lab profile updated successfully."
          : "Lab profile created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);
      await loadLabProfiles();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.response?.data?.message || err?.message ||
          "Failed to save lab profile.",
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
        User Registration
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
              <Label>Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branch">Branch</SelectItem>
                      <SelectItem value="Collection Center">Collection Center</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
           <div>
              <Label>Center Name</Label>
              <Controller
                name="lab_profile_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branch">Branch</SelectItem>
                      
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
           

            <div>
              <Label>User Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
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
              <Label>Password</Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

           
            <div>
              <Label>Confirm Password</Label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
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
        <h2 className="text-xl font-bold mb-4">Lab</h2>
        {/* <DataTable columns={columns} data={labProfiles} filterColumn="name" /> */}
      </div>
    </div>
  );
}


