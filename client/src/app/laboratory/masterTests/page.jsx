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
// import { Textarea } from "@/components/ui/textarea";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterTestSchema } from "@/lib/zodeSchema";

import { useDispatch, useSelector } from "react-redux";
import { fetchDepartments } from "@/reduxToolKit/slices/departmentsSlice";
import { fetchMasterTests } from "@/reduxToolKit/slices/masterTestsSlice";
import { getRequiredSamples } from "@/services/requiredSamples.service";
import { getSamplePerforms } from "@/services/samplePerforms.service";
import { getReportedAts } from "@/services/reportedAt.service";
import Tiptap from "@/components/tiptap";
import { createMasterTest, updateMasterTest } from "@/services/masterTests.service";
import { useRouter } from "next/navigation"

export default function MasterTestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { list: departments } = useSelector((state) => state.departments);
  const { list: masterTests, loading: masterTestsLoading } = useSelector((state) => state.masterTests);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [requiredSamples, setRequiredSamples] = useState([]);
  const [samplePerforms, setSamplePerforms] = useState([]);
  const [reportedAts, setReportedAts] = useState([]);

  const defaultValues = {
    department_id: "",
    required_sample_id: "",
    sample_performs_id: "",
    reported_ats_id: "",
    testCode: "",
    testName: "",
    expectedTime: "60",
    price: "0",
    interpretation: "",
    isActive: true,
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterTestSchema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchMasterTests());

    const loadDropdowns = async () => {
      try {
        const rs = await getRequiredSamples();
        const sp = await getSamplePerforms();
        const ra = await getReportedAts();

        setRequiredSamples(rs?.data || rs);
        setSamplePerforms(sp?.data || sp);
        setReportedAts(ra?.data || ra);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      }
    };

    loadDropdowns();
  }, [dispatch]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    // Debug: verify interpretation is included
    console.debug("Submitting master test:", data);

    try {
      if (editingId) {
        await updateMasterTest(editingId, data);
      } else {
        await createMasterTest(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Master Test updated successfully."
          : "Master Test created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);

      dispatch(fetchMasterTests());
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save master test",
      });
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
      onEdit: (row) => {
        reset(row);
        setEditingId(row.id);
      },
      onParameter: (row) => {
        router.push(`/laboratory/masterParameters?id=${row.id}&testName=${encodeURIComponent(row.testName)}`);
      }
    });
  }, [reset]);

//     const handleDepartmentChange = async (departmentId) => {
//   try {
//     const res = await getMasterTestSort(departmentId);
//     setValue("testSort", res); 
//   } catch (error) {
//     console.error("Error fetching next sort", error);
//   }
// };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
        Master Tests
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
  onSubmit={handleSubmit(onSubmit)}
  className="p-6 rounded-lg shadow-md mb-8"
>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

    {/* LEFT COLUMN (ALL FIELDS) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Test Code */}
      <div>
        <Label>Test Code</Label>
        <Controller
          name="testCode"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.testCode && (
          <p className="text-red-600 text-sm">{errors.testCode.message}</p>
        )}
      </div>

      {/* Test Name */}
      <div>
        <Label>Test Name</Label>
        <Controller
          name="testName"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        {errors.testName && (
          <p className="text-red-600 text-sm">{errors.testName.message}</p>
        )}
      </div>

      {/* Department */}
      <div >
        <Label>Department</Label>
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Required Sample */}
      <div>
        <Label>Required Sample</Label>
        <Controller
          name="required_sample_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sample" />
              </SelectTrigger>
              <SelectContent>
                {requiredSamples?.map((sample) => (
                  <SelectItem key={sample.id} value={String(sample.id)}>
                    {sample.required_sample_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Sample Performs */}
      <div>
        <Label>Sample Performs</Label>
        <Controller
          name="sample_performs_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Sample Performs" />
              </SelectTrigger>
              <SelectContent>
                {samplePerforms?.map((sample) => (
                  <SelectItem key={sample.id} value={String(sample.id)}>
                    {sample.sample_perform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Reported At */}
      <div>
        <Label>Reported At</Label>
        <Controller
          name="reported_ats_id"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Reported At" />
              </SelectTrigger>
              <SelectContent>
                {reportedAts?.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.reported_at}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Expected Time */}
      <div>
        <Label>Expected Time</Label>
        <Controller
          name="expectedTime"
          control={control}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </div>

      {/* Default Price */}
      <div>
        <Label>Default Price</Label>
        <Controller
          name="price"
          control={control}
          render={({ field }) => <Input type="number" {...field} />}
        />
      </div>

      {/* Status */}
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

    {/* RIGHT COLUMN (INTERPRETATION + BUTTONS) */}
    <div className="flex flex-col">

      <Label>Interpretation</Label>

      <Controller
        name="interpretation"
        control={control}
        render={({ field }) => (
          <Tiptap content={field.value} onChange={field.onChange} />
        )}
      />

      <div className="flex gap-2 mt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Processing..." : editingId ? "Update" : "Create"}
        </Button>

        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

    </div>

  </div>
</form>

      <div>
        <h2 className="text-xl font-bold mb-4">Master Tests List</h2>
        {/* Replace [] with master tests list from redux */}
        <DataTable columns={columns} data={masterTests} filterColumn="testName" />
      </div>
    </div>
  );
}
