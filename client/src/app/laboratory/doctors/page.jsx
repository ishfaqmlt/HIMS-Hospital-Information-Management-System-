"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {Select, SelectContent,  SelectItem,  SelectTrigger,  SelectValue} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDoctor, updateDoctor } from "@/services/doctors.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { doctorSchema } from "@/lib/zodeSchema";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "@/reduxToolKit/slices/doctorSlice";

export default function DoctorsForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const dispatch = useDispatch();
  const doctorsState = useSelector((state) => state.fetchDoctors);
  const doctorsData = Array.isArray(doctorsState?.data) ? doctorsState.data : [];
  const doctorsLoading = doctorsState?.loading;
  const doctorsError = doctorsState?.error;

  const defaultValues = {
    id: "",
    doctorName: "",
    specialization: "",
    phone: "",
    email: "",
    commissionPercentage: 0,
    isActive: true,
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues,
  });
  
  const handleReset = () => {
    reset(defaultValues);
    setEditingId(null);
    setMessage(null);
    setLoading(false);
  
  };
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  
useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

   
    console.log("Submitting doctor:", data);
   
    try {
      if (editingId) {
        await updateDoctor(editingId, data);
      } else {
        await createDoctor(data);
      }

      setMessage({
        type: "success",
        text: editingId
          ? "Doctor updated successfully."
          : "Doctor created successfully.",
      });

      reset(defaultValues);
      setEditingId(null);

      // Refresh the doctors list
      dispatch(fetchDoctors());
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
          Master Doctors
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

        {doctorsLoading && (
          <div className="mb-4 p-4 rounded-md text-sm bg-blue-100 text-blue-800">
            Loading doctors...
          </div>
        )}

        {doctorsError && (
          <div className="mb-4 p-4 rounded-md text-sm bg-red-100 text-red-800">
            Error: {doctorsError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg shadow-md mb-8"
        >
        
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             
             
              {/* Test Id */}
              <div>
                <Label> Id</Label>
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
                <Label>Doctor Name</Label>
                <Controller
                  name="doctorName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""}  />
                  )}
                />
                {errors.doctorName && (
                  <p className="text-red-600 text-sm">
                    {errors.doctorName.message}
                  </p>
                )}
              </div>
              {/* Specialization */}
              <div>
                <Label>Specialization</Label>
                <Controller
                  name="specialization"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""}  />
                  )}
                />
                {errors.specialization && (
                  <p className="text-red-600 text-sm">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

                {/* Phone */}
              <div>
                <Label>Phone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              {/* Email */}
              <div>
                <Label>Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Commission percentage */}
              <div>
                <Label>Doctor Commission</Label>
                <Controller
                  name="commissionPercentage"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value ?? ""} />
                  )}
                />
                {errors.commissionPercentage && (
                  <p className="text-red-600 text-sm">
                    {errors.commissionPercentage.message}
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
           

              <div className="flex gap-2 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Update" : "Create"}
                </Button>

                <Button type="button" disabled={loading} variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div> 
         
        </form>

        <div>
        <h2 className="text-xl font-bold mb-4"> Doctors List</h2>
        <DataTable columns={columns} data={doctorsData} filterColumn="doctorName" />
      </div>
      </div>
    </>
  );
}
