"use client";

import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Tiptap from "@/components/tiptap";
import { getSubHeaders } from "@/services/subHeaders.service";
import { getTestparameters, createTestparameter, updateTestparameter} from "@/services/testParameters.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { testParameterSchema } from "@/lib/zodeSchema";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";

function MasterParametersContent() {
  const searchParams = useSearchParams();

  const testId = searchParams.get("id");
  const testName = searchParams.get("testName");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [subHeaders, setSubHeaders] = useState([]);
  const [testParameters, setTestParameters] = useState([]);

  const defaultValues = {
    id: "",
    master_test_id: testId || "",
    testName: testName || "",
    sub_headers_id: "",
    parameterName: "",
    defaultValue: null,
    units: "",
    resultDataType: "Numeric",
    digitFormat: "0",
    resultTemplets: "",
    formula: null,
    analyzerCode: null,
    printOnReciept: true,
    isActive: true,
    normalRange: "",
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testParameterSchema),
    defaultValues,
  });
  const resultTypeValue = watch("resultDataType");
  useEffect(() => {
    if (resultTypeValue !== "1") {
      // setValue("digitFormat", "0");
      setValue("resultTemplets", "");
    }
  }, [resultTypeValue, setValue]);

  const handleReset = () => {
    reset(defaultValues);
    setEditingId(null);
    setMessage(null);
    setLoading(false);
   loadTestParameters(testId);
  };
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const sh = await getSubHeaders();
        setSubHeaders(sh?.data || sh);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      }
    };
    
    loadDropdowns();
   loadTestParameters(testId);
  }, []);
  //  useEffect (() => {
   

  //   loadTestParameters();
  // }, []);
 const loadTestParameters = async (master_test_id) => {
      try {
        const tp = await getTestparameters(master_test_id);
        setTestParameters(tp?.data || tp);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      }
    };

  useEffect(() => {
    if (!testId) {
      setMessage({
        type: "error",
        text: "Invalid access: Master test ID is required.",
      });
    }
  }, [testId]);

useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    // Prepare data for API
    const dataToSend = { ...data };
    if (dataToSend.sortNo === "") dataToSend.sortNo = null;

    // console.log("Submitting test parameter:", dataToSend);
   
    try {
      if (editingId) {
        await updateTestparameter(editingId, dataToSend);
      } else {
        await createTestparameter(dataToSend);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Test Parameter updated successfully."
          : "Test Parameter created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);

      // Refresh the test parameters list
      loadTestParameters(testId);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save test parameter",
      });
    } finally {
      setLoading(false);
    }
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
    <>
      <div className="p-6 max-w-full mx-auto">
        <h1 className="text-2xl font-bold text-center bg-gray-700 text-white p-2 rounded-2xl">
          Master Test Parameters
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
             
              <Controller
                name="master_test_id"
                control={control}
                render={({ field }) => (
                  <Input type="hidden" {...field} />
                )}
              />

              {/* Test Id */}
              <div>
                <Label>Parameter Id</Label>
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} readOnly />
                  )}
                />
                {errors.id && (
                  <p className="text-red-600 text-sm">{errors.id.message}</p>
                )}
              </div>

              {/* Test Name */}
              <div>
                <Label>Test Name</Label>
                <Controller
                  name="testName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} readOnly />
                  )}
                />
                {errors.testName && (
                  <p className="text-red-600 text-sm">
                    {errors.testName.message}
                  </p>
                )}
              </div>

              {/* Sub-Header */}
              <div>
                <Label>Sub-Header</Label>
                <Controller
                  name="sub_headers_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sub-Header" />
                      </SelectTrigger>
                      <SelectContent>
                        {subHeaders?.map((sh) => (
                          <SelectItem key={sh.id} value={String(sh.id)}>
                            {sh.sub_header_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sub_headers_id && (
                  <p className="text-red-600 text-sm">
                    {errors.sub_headers_id.message}
                  </p>
                )}
              </div>

              {/* Parameter Name */}
              <div>
                <Label>Parameter Name</Label>
                <Controller
                  name="parameterName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.parameterName && (
                  <p className="text-red-600 text-sm">
                    {errors.parameterName.message}
                  </p>
                )}
              </div>
              {/* default value */}
              <div>
                <Label>Default Value</Label>
                <Controller
                  name="defaultValue"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.defaultValue && (
                  <p className="text-red-600 text-sm">
                    {errors.defaultValue.message}
                  </p>
                )}
              </div>
              {/* unit */}
              <div>
                <Label>Unit</Label>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.units && (
                  <p className="text-red-600 text-sm">{errors.units.message}</p>
                )}
              </div>
              {/* result Type */}
              <div>
                <Label>Result Data Type</Label>
                <Controller
                  name="resultDataType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value?.toString() ?? ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Result Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Numeric">Numeric</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Formula">Formula</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.resultDataType && (
                  <p className="text-red-600 text-sm">
                    {errors.resultDataType.message}
                  </p>
                )}
              </div>
              {/* digit format */}
              <div>
                <Label>Digit Format</Label>
                <Controller
                  name="digitFormat"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Digit Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.digitFormat && (
                  <p className="text-red-600 text-sm">
                    {errors.digitFormat.message}
                  </p>
                )}
              </div>
              {/* Result Templates */}
              <div>
                <Label>Result Templates</Label>
                <Controller
                  name="resultTemplets"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      readOnly={resultTypeValue !== 1}
                    />
                  )}
                />
                {errors.resultTemplets && (
                  <p className="text-red-600 text-sm">
                    {errors.resultTemplets.message}
                  </p>
                )}
              </div>
              {/* Formula*/}
              <div>
                <Label>Formula</Label>
                <Controller
                  name="formula"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.formula && (
                  <p className="text-red-600 text-sm">
                    {errors.formula.message}
                  </p>
                )}
              </div>
              {/* analyzer Code */}
              <div>
                <Label>Analyzer Code</Label>
                <Controller
                  name="analyzerCode"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.analyzerCode && (
                  <p className="text-red-600 text-sm">
                    {errors.analyzerCode.message}
                  </p>
                )}
              </div>

              {/* sortNo*/}
              <div>
                <Label>Sort No</Label>
                <Controller
                  name="sortNo"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.sortNo && (
                  <p className="text-red-600 text-sm">
                    {errors.sortNo.message}
                  </p>
                )}
              </div>

              {/* Print On Result Reciept*/}
              <div>
                <Label>Print On Result Receipt</Label>

                <Controller
                  name="printOnReciept"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
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
                {errors.printOnReciept && (
                  <p className="text-red-600 text-sm">
                    {errors.printOnReciept.message}
                  </p>
                )}
              </div>

              {/* is Active*/}
              <div>
                <Label>Status</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
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
                  <p className="text-red-600 text-sm">
                    {errors.isActive.message}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (INTERPRETATION + BUTTONS) */}
            <div className="flex flex-col">
              <Label>Normal Range</Label>

              <Controller
                name="normalRange"
                control={control}
                render={({ field }) => (
                  <Tiptap
                    content={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.normalRange && (
                <p className="text-red-600 text-sm">
                  {errors.normalRange.message}
                </p>
              )}

              <div className="flex gap-2 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Update" : "Create"}
                </Button>

                <Button type="button" disabled={loading} variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div> 
          </div>
        </form>

        <div>
        <h2 className="text-xl font-bold mb-4"> Test Parameters List</h2>
        <DataTable columns={columns} data={testParameters} />
      </div>
      </div>
    </>
  );
}

export default function MasterParametersForm() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MasterParametersContent />
    </Suspense>
  );
}
