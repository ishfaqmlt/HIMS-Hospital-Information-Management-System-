"use client";
import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "./data-table";
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
// import { z } from "zod";
import { departmentSchema } from "@/lib/zodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import departmentService from "@/services/department.service";
import { fetchDepartments } from "@/reduxToolKit/slices/departmentsSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Departments() {
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
 const dispatch = useDispatch();

  const { list, loading: listLoading, error } = useSelector(
    (state) => state.departments
  );

  // const schema = z.object({
  //   department_name: z
  //     .string()
  //     .min(2, "Department name must be at least 2 characters long"),
  //   is_active: z.boolean().refine((val) => val === true || val === false, {
  //     message: "Invalid status",
  //   }),
  // });

  const FormSchema = departmentSchema.pick({ department_name: true, isActive: true }); 

  const defaultValues = {
    department_name: "",
    isActive: true,
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

  
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

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
        await departmentService.update(editingId, data);
      } else {
        await departmentService.create(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Department updated successfully."
          : "Department created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);

      // Refresh the departments list from the store
      dispatch(fetchDepartments());
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save department",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
  
    try {
      setLoading(true);

      const departmentData = await departmentService.getById(id);

      reset({
        department_name: departmentData?.department_name ?? "",
        isActive: Boolean(departmentData?.isActive),
      });

      setEditingId(departmentData?.id);
    } catch (error) {
      console.error("Failed to fetch department:", error);
      setMessage({ type: "error", text: "Failed to load department data" });
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
    });
  }, []);

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
        Laboratory Departments
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
            <Label className="mb-1" htmlFor="department_name">
              Department
            </Label>
            <Controller
              name="department_name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter department name" />
              )}
            />
            {errors.department_name && (
              <p className="text-red-600 text-sm mt-1">
                {errors.department_name.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1" htmlFor="isActive">
              Status
            </Label>
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
            {errors.isActive && (
              <p className="text-red-600 text-sm mt-1">
                {errors.isActive.message}
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
        <h2 className="text-xl font-bold mb-4">Departments List</h2>
        <DataTable columns={columns} data={list} />
      </div>
    </div>
  );
}
