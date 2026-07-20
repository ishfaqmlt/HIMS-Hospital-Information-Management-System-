"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insurancePlanSchema } from "@/lib/zodeSchema";
import insurancePlanService from "@/services/insurancePlanService";
import insuranceCompanyService from "@/services/insuranceCompanyService";
import { Loader2, Plus } from "lucide-react";

export default function InsurancePlansPage() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(insurancePlanSchema),
    defaultValues: {
      InsuranceCompanyId: "",
      planName: "",
      coverageDetails: "",
      CoveragePercent: 100,
      AnnualLimit: 0,
      isActive: true,
    },
  });

  const isActiveValue = watch("isActive");

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    fetchPlans();
    fetchCompanies();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await insurancePlanService.getAll();
      setPlans(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await insuranceCompanyService.getAll();
      setCompanies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setSelectedCompanyId("");
    reset({
      InsuranceCompanyId: "",
      planName: "",
      coverageDetails: "",
      CoveragePercent: 100,
      AnnualLimit: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);
    setSelectedCompanyId(plan.InsuranceCompanyId || "");
    reset({
      InsuranceCompanyId: plan.InsuranceCompanyId || "",
      planName: plan.planName || "",
      coverageDetails: plan.coverageDetails || "",
      CoveragePercent: plan.CoveragePercent ?? 100,
      AnnualLimit: plan.AnnualLimit ?? 0,
      isActive: plan.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await insurancePlanService.update(editingId, data);
        setMessage({ type: "success", text: "Insurance plan updated successfully" });
      } else {
        await insurancePlanService.create(data);
        setMessage({ type: "success", text: "Insurance plan created successfully" });
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const columns = getColumns({ onEdit: openEdit });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance Plans</h1>
          <p className="text-muted-foreground mt-1">Manage insurance plan records</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Plan
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={plans} filterColumn="planName" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Insurance Plan" : "Add Insurance Plan"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Insurance Company *</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={(val) => {
                    setSelectedCompanyId(val);
                    setValue("InsuranceCompanyId", val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.InsuranceCompanyId && <p className="text-sm text-destructive">{errors.InsuranceCompanyId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input id="planName" {...register("planName")} placeholder="Plan name" />
                {errors.planName && <p className="text-sm text-destructive">{errors.planName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="CoveragePercent">Coverage % *</Label>
                <Input id="CoveragePercent" type="number" step="0.01" {...register("CoveragePercent")} />
                {errors.CoveragePercent && <p className="text-sm text-destructive">{errors.CoveragePercent.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="AnnualLimit">Annual Limit</Label>
                <Input id="AnnualLimit" type="number" step="0.01" {...register("AnnualLimit")} />
                {errors.AnnualLimit && <p className="text-sm text-destructive">{errors.AnnualLimit.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageDetails">Coverage Details</Label>
              <Textarea id="coverageDetails" {...register("coverageDetails")} placeholder="Describe coverage details..." rows={3} />
              {errors.coverageDetails && <p className="text-sm text-destructive">{errors.coverageDetails.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={isActiveValue}
                onCheckedChange={(val) => setValue("isActive", val)}
              />
              <Label>Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
