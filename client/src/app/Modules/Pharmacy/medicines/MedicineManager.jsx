"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacyMedicineSchema } from "@/lib/zodeSchema";
import pharmacyMedicineService from "@/services/pharmacyMedicine.service";
import {
  pharmacyGenericService,
  pharmacyCategoryService,
  pharmacyDosageFormService,
  pharmacyManufacturerService,
  pharmacyUnitService,
} from "@/services/pharmacyMaster.service";
import { getMedicineColumns } from "./medicineColumns";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  RefreshCw,
  Package,
  CheckCircle2,
  AlertCircle,
  Tag,
  Boxes,
  Sparkles,
} from "lucide-react";

export default function MedicineManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  // Lookups data
  const [generics, setGenerics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dosageForms, setDosageForms] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [units, setUnits] = useState([]);

  // Filter state
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterForm, setFilterForm] = useState("all");

  // Dialog & Edit state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pharmacyMedicineSchema),
    defaultValues: {
      item_code: "",
      barcode: "",
      brand_name: "",
      generic_id: "",
      category_id: "",
      dosage_form_id: "",
      manufacturer_id: "",
      purchase_unit_id: "",
      sale_unit_id: "",
      unit_conversion: 1,
      purchase_price: 0,
      sale_price: 0,
      mrp: 0,
      tax_percent: 0,
      discount_percent: 0,
      min_reorder_level: 10,
      max_stock_level: 100,
      rack_location: "",
      requires_prescription: false,
      is_narcotic: false,
      is_active: true,
    },
  });

  const isRxValue = watch("requires_prescription");
  const isNarcoticValue = watch("is_narcotic");
  const isActiveValue = watch("is_active");
  const selectedGenericId = watch("generic_id");
  const selectedCategoryId = watch("category_id");
  const selectedFormId = watch("dosage_form_id");
  const selectedMfrId = watch("manufacturer_id");
  const selectedPurchaseUnitId = watch("purchase_unit_id");
  const selectedSaleUnitId = watch("sale_unit_id");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [medRes, genRes, catRes, formRes, mfrRes, unitRes] = await Promise.all([
        pharmacyMedicineService.getAll(),
        pharmacyGenericService.getAll().catch(() => ({ data: [] })),
        pharmacyCategoryService.getAll().catch(() => ({ data: [] })),
        pharmacyDosageFormService.getAll().catch(() => ({ data: [] })),
        pharmacyManufacturerService.getAll().catch(() => ({ data: [] })),
        pharmacyUnitService.getAll().catch(() => ({ data: [] })),
      ]);

      setData(medRes.data || []);
      setGenerics(genRes.data || []);
      setCategories(catRes.data || []);
      setDosageForms(formRes.data || []);
      setManufacturers(mfrRes.data || []);
      setUnits(unitRes.data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      item_code: "",
      barcode: "",
      brand_name: "",
      generic_id: "",
      category_id: "",
      dosage_form_id: "",
      manufacturer_id: "",
      purchase_unit_id: "",
      sale_unit_id: "",
      unit_conversion: 1,
      purchase_price: 0,
      sale_price: 0,
      mrp: 0,
      tax_percent: 0,
      discount_percent: 0,
      min_reorder_level: 10,
      max_stock_level: 100,
      rack_location: "",
      requires_prescription: false,
      is_narcotic: false,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      item_code: item.item_code || "",
      barcode: item.barcode || "",
      brand_name: item.brand_name || "",
      generic_id: item.generic_id || "",
      category_id: item.category_id || "",
      dosage_form_id: item.dosage_form_id || "",
      manufacturer_id: item.manufacturer_id || "",
      purchase_unit_id: item.purchase_unit_id || "",
      sale_unit_id: item.sale_unit_id || "",
      unit_conversion: Number(item.unit_conversion || 1),
      purchase_price: Number(item.purchase_price || 0),
      sale_price: Number(item.sale_price || 0),
      mrp: Number(item.mrp || 0),
      tax_percent: Number(item.tax_percent || 0),
      discount_percent: Number(item.discount_percent || 0),
      min_reorder_level: Number(item.min_reorder_level || 10),
      max_stock_level: item.max_stock_level ? Number(item.max_stock_level) : null,
      rack_location: item.rack_location || "",
      requires_prescription: Boolean(item.requires_prescription),
      is_narcotic: Boolean(item.is_narcotic),
      is_active: Boolean(item.is_active),
    });
    setIsDialogOpen(true);
  };

  const handleGenerateBarcode = async () => {
    try {
      setGeneratingBarcode(true);
      const res = await pharmacyMedicineService.generateBarcode();
      if (res.data?.barcode) {
        setValue("barcode", res.data.barcode);
      }
    } catch (error) {
      // Fallback: 12-digit internal barcode (896 + YY + 7 digits)
      const yr = new Date().getFullYear().toString().slice(-2);
      const rand = Math.floor(1000000 + Math.random() * 9000000);
      setValue("barcode", `896${yr}${rand}`);
    } finally {
      setGeneratingBarcode(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        generic_id: formData.generic_id || null,
        category_id: formData.category_id || null,
        dosage_form_id: formData.dosage_form_id || null,
        manufacturer_id: formData.manufacturer_id || null,
        purchase_unit_id: formData.purchase_unit_id || null,
        sale_unit_id: formData.sale_unit_id || null,
        max_stock_level: formData.max_stock_level ? Number(formData.max_stock_level) : null,
      };

      if (editingItem) {
        await pharmacyMedicineService.update(editingItem.id, payload);
        setMessage({ type: "success", text: "Product updated successfully" });
      } else {
        await pharmacyMedicineService.create(payload);
        setMessage({ type: "success", text: "Product added successfully" });
      }
      setIsDialogOpen(false);
      const res = await pharmacyMedicineService.getAll();
      setData(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save product",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await pharmacyMedicineService.delete(itemToDelete.id);
      setMessage({ type: "success", text: "Product deleted successfully" });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      const res = await pharmacyMedicineService.getAll();
      setData(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete product",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterCategory !== "all" && item.category_id !== filterCategory) return false;
      if (filterForm !== "all" && item.dosage_form_id !== filterForm) return false;
      return true;
    });
  }, [data, filterCategory, filterForm]);

  const columns = useMemo(
    () =>
      getMedicineColumns({
        onEdit: openEditDialog,
      }),
    []
  );

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {message && (
        <Alert
          className={
            message.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription className="text-xs font-medium ml-2">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="shadow-xs border-slate-200/80">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Product Master Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Product brands, generic formulas, pack conversions, retail pricing, and rack positions
              </CardDescription>
            </div>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="w-40">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dosage Form Filter */}
            <div className="w-36">
              <Select value={filterForm} onValueChange={setFilterForm}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All Forms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  {dosageForms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllData}
              disabled={loading}
              className="h-8 text-xs border-slate-200 text-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={openCreateDialog}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              + Add Product
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading product catalog...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              filterColumn="brand_name"
              placeholder="Search by product / brand name..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Dialog — Increased Width (max-w-5xl) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              {editingItem ? `Edit Product (${editingItem.item_code})` : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Section 1: Identification & Names */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                1. Product Identity & Classification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <Label className="text-xs font-semibold text-slate-700">
                    Product / Brand Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...register("brand_name")}
                    placeholder="e.g. Panadol 500mg Tablet / Augmentin 625mg Tablet"
                    className="h-8 text-xs bg-white"
                  />
                  {errors.brand_name && (
                    <p className="text-[11px] text-destructive">{errors.brand_name.message}</p>
                  )}
                </div>

                {/* Generic Molecule Selector */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Generic Molecule (Formula)
                  </Label>
                  <Select
                    value={selectedGenericId || "none"}
                    onValueChange={(val) => setValue("generic_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="Select generic..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- None / Specific --</SelectItem>
                      {generics.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.generic_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Therapeutic Category Selector */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Therapeutic Category
                  </Label>
                  <Select
                    value={selectedCategoryId || "none"}
                    onValueChange={(val) => setValue("category_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select category --</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dosage Form Selector */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Dosage Formulation
                  </Label>
                  <Select
                    value={selectedFormId || "none"}
                    onValueChange={(val) => setValue("dosage_form_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="Select formulation..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select formulation --</SelectItem>
                      {dosageForms.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manufacturer Selector */}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Pharmaceutical Manufacturer
                  </Label>
                  <Select
                    value={selectedMfrId || "none"}
                    onValueChange={(val) => setValue("manufacturer_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="Select manufacturer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select manufacturer --</SelectItem>
                      {manufacturers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} {m.country ? `(${m.country})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Barcode (Hybrid: Scanned, Manual, or Auto-Generated) */}
                <div className="space-y-1 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">
                      POS Barcode (Scanner)
                    </Label>
                    <span className="text-[10px] text-muted-foreground italic">
                      Optional / Auto-generated
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      {...register("barcode")}
                      placeholder="Scan box or click Generate"
                      className="h-8 text-xs font-mono bg-white shrink"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateBarcode}
                      disabled={generatingBarcode}
                      className="h-8 px-2.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shrink-0 font-medium"
                      title="Generate internal unique barcode"
                    >
                      <Sparkles className={`h-3.5 w-3.5 mr-1 text-emerald-600 ${generatingBarcode ? "animate-spin" : ""}`} />
                      Generate
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Scan box barcode, or leave empty to auto-generate upon saving.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Packaging & Dispensing Units */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 text-teal-600" />
                2. Packaging, Units & Stock Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Purchase Unit */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Purchase Unit (Bulk)
                  </Label>
                  <Select
                    value={selectedPurchaseUnitId || "none"}
                    onValueChange={(val) => setValue("purchase_unit_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="e.g. Box / Pack" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select unit --</SelectItem>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sale Unit */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Sale / Dispensing Unit
                  </Label>
                  <Select
                    value={selectedSaleUnitId || "none"}
                    onValueChange={(val) => setValue("sale_unit_id", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white">
                      <SelectValue placeholder="e.g. Tablet / Bottle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select unit --</SelectItem>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversion Ratio */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Pack Multiplier (Units / Pack)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    {...register("unit_conversion")}
                    placeholder="e.g. 100"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>

                {/* Min Reorder Level */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Min Reorder Alert Level
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    {...register("min_reorder_level")}
                    placeholder="e.g. 10"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>

                {/* Max Stock Level */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Max Stock Level
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    {...register("max_stock_level")}
                    placeholder="e.g. 500"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>

                {/* Shelf Rack Location */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Shelf Rack Location
                  </Label>
                  <Input
                    {...register("rack_location")}
                    placeholder="e.g. Rack A-02, Fridge"
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Discounts */}
            <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                3. Cost, Retail Sale Price & Tax
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Purchase Cost (TP) (Rs.)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("purchase_price")}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Retail Sale Price (Rs.) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("sale_price")}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono font-bold text-emerald-700 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Max Retail Price (MRP)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("mrp")}
                    placeholder="0.00"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Max Discount Limit (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("discount_percent")}
                    placeholder="0.0"
                    className="h-8 text-xs font-mono bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Clinical Controls & Active Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Prescription Required */}
              <div className="flex items-center justify-between p-3 bg-rose-50/60 border border-rose-200 rounded-lg">
                <div>
                  <Label className="text-xs font-bold text-rose-900">
                    Prescription Required (Rx)
                  </Label>
                  <p className="text-[10px] text-rose-700">
                    Must verify doctor prescription
                  </p>
                </div>
                <Switch
                  checked={isRxValue}
                  onCheckedChange={(val) => setValue("requires_prescription", val)}
                />
              </div>

              {/* Narcotic / Scheduled */}
              <div className="flex items-center justify-between p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                <div>
                  <Label className="text-xs font-bold text-amber-900">
                    Narcotic / Controlled
                  </Label>
                  <p className="text-[10px] text-amber-700">
                    Scheduled controlled substance
                  </p>
                </div>
                <Switch
                  checked={isNarcoticValue}
                  onCheckedChange={(val) => setValue("is_narcotic", val)}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                <div>
                  <Label className="text-xs font-bold text-emerald-900">
                    Active Product
                  </Label>
                  <p className="text-[10px] text-emerald-700">
                    Available for POS and GRN
                  </p>
                </div>
                <Switch
                  checked={isActiveValue}
                  onCheckedChange={(val) => setValue("is_active", val)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {saving ? "Saving..." : editingItem ? "Update Product" : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-slate-600 space-y-2 py-2">
            <p>
              Are you sure you want to delete product{" "}
              <strong>{itemToDelete?.brand_name}</strong> ({itemToDelete?.item_code})?
            </p>
            <p className="text-muted-foreground text-[11px]">
              This action cannot be undone if there are no inventory batches or sales.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 text-xs font-semibold"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
