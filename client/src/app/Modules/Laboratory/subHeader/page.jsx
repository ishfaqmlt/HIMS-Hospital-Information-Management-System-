"use client";
import React, { useEffect, useState, useMemo } from "react";
// import { DataTable } from "./data-table";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { subHeaderSchema } from "@/lib/zodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getSubHeaders,
  getSubHeaderById,
  createSubHeader,
  updateSubHeader,
} from "@/services/subHeaders.service";

export default function SubHeaders() {
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [subHeaders, setSubHeaders] = useState([]);

  
  const FormSchema = subHeaderSchema.pick({ sub_header_name: true }); 

  const defaultValues = {
    sub_header_name: "",
  };

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

    const loadSubHeaders = async () => {
    try {
      const data = await getSubHeaders();
      setSubHeaders(data);
    } catch (error) {
      console.error("Failed to load sub headers:", error);
    }
  };
  
  useEffect(() => {
    loadSubHeaders();
  }, []);

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
        await updateSubHeader(editingId, data);
      } else {
        await createSubHeader(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Sub header updated successfully."
          : "Sub header created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);

      // Refresh the departments list from the store
      await loadSubHeaders();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save sub header.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
  
    try {
      setLoading(true);

      const subHeaderData = await getSubHeaderById(id);

      reset({
        sub_header_name: subHeaderData?.sub_header_name ?? "",
      });

      setEditingId(subHeaderData?.id);
    } catch (error) {
      console.error("Failed to fetch sub header:", error);
      setMessage({ type: "error", text: "Failed to load sub header data" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setEditingId(null);
    setMessage(null);
    loadSubHeaders();
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: handleEdit,
    });
  }, []);

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
        Laboratory Sub Headers
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
            <Label className="mb-1" htmlFor="sub_header_name">
              Sub Header Name
            </Label>
            <Controller
              name="sub_header_name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter sub header name" />
              )}
            />
            {errors.sub_header_name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.sub_header_name.message}
              </p>
            )}
          </div>

        
        </div>

        <div className="flex gap-2 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : editingId ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4">Sub Headers List</h2>
        <DataTable columns={columns} data={subHeaders} />
      </div>
    </div>
  );
}
