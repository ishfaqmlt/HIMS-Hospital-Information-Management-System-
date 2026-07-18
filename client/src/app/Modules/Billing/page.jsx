"use client";

import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { billingSchema } from "@/lib/zodeSchema";
import billingService from "@/services/billing.service";
import patientService from "@/services/patient.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, Eye, UserPlus } from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [billings, setBillings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [viewingBilling, setViewingBilling] = useState(null);

  const [mobileSearch, setMobileSearch] = useState("");
  const [mobileResults, setMobileResults] = useState([]);
  const [mobileSearched, setMobileSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      patientId: "",
      InvoiceNo: "",
      InvoiceDate: new Date().toISOString().split("T")[0],
      InvoiceType: "OPD",
      SubTotal: 0,
      Discount: 0,
      Tax: 0,
      TotalAmount: 0,
      PaidAmount: 0,
      PaymentStatus: "Pending",
      PaymentMethod: "Cash",
      Notes: "",
    },
  });

  const subTotal = watch("SubTotal");
  const discount = watch("Discount");
  const tax = watch("Tax");
  const totalAmount = watch("TotalAmount");
  const paidAmount = watch("PaidAmount");

  useEffect(() => {
    const calculated = subTotal - discount + tax;
    setValue("TotalAmount", Math.max(0, calculated));
  }, [subTotal, discount, tax, setValue]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: "error", text: "Please enter a search term" });
      return;
    }
    try {
      setLoading(true);
      const res = await billingService.getAll({ search: searchTerm });
      setBillings(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No invoices found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysInvoices = async () => {
    try {
      setLoading(true);
      setSearchTerm("");
      const res = await billingService.getAll({ today: true });
      setBillings(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No invoices found for today" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load invoices" });
    } finally {
      setLoading(false);
    }
  };

  const resetBillings = () => {
    setSearchTerm("");
    setBillings([]);
  };

  const openCreate = () => {
    setEditingBilling(null);
    setSelectedPatient(null);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: "",
      InvoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      InvoiceDate: new Date().toISOString().split("T")[0],
      InvoiceType: "OPD",
      SubTotal: 0,
      Discount: 0,
      Tax: 0,
      TotalAmount: 0,
      PaidAmount: 0,
      PaymentStatus: "Pending",
      PaymentMethod: "Cash",
      Notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (billing) => {
    setEditingBilling(billing);
    setSelectedPatient(billing.patient);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: billing.patientId,
      InvoiceNo: billing.InvoiceNo,
      InvoiceDate: billing.InvoiceDate ? new Date(billing.InvoiceDate).toISOString().split("T")[0] : "",
      InvoiceType: billing.InvoiceType,
      SubTotal: billing.SubTotal,
      Discount: billing.Discount,
      Tax: billing.Tax,
      TotalAmount: billing.TotalAmount,
      PaidAmount: billing.PaidAmount,
      PaymentStatus: billing.PaymentStatus,
      PaymentMethod: billing.PaymentMethod,
      Notes: billing.Notes || "",
    });
    setIsDialogOpen(true);
  };

  const openView = (billing) => {
    setViewingBilling(billing);
    setIsViewDialogOpen(true);
  };

  const handleMobileSearch = async () => {
    if (!mobileSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a mobile number" });
      return;
    }
    try {
      const res = await patientService.getAll({ search: mobileSearch });
      setMobileResults(res.data);
      setMobileSearched(true);
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    }
  };

  const selectExistingPatient = (patient) => {
    setSelectedPatient(patient);
    setValue("patientId", patient.id);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setValue("patientId", newPatient.id);
    setIsPatientDialogOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      if (!selectedPatient && !editingBilling) {
        setMessage({ type: "error", text: "Please select a patient" });
        return;
      }

      if (editingBilling) {
        await billingService.update(editingBilling.Id, data);
        setMessage({ type: "success", text: "Invoice updated successfully" });
      } else {
        data.patientId = selectedPatient.id;
        await billingService.create(data);
        setMessage({ type: "success", text: "Invoice created successfully" });
      }
      setIsDialogOpen(false);
      if (searchTerm) {
        handleSearch({ preventDefault: () => {} });
      } else if (billings.length > 0) {
        loadTodaysInvoices();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await billingService.delete(id);
      setMessage({ type: "success", text: "Invoice deleted successfully" });
      setBillings((prev) => prev.filter((b) => b.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete invoice" });
    }
  };

  const columns = getColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
    onView: openView,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage invoices and payments</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />New Invoice
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Invoice No, Patient Name, or Mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="outline" onClick={loadTodaysInvoices} disabled={loading}>
          <CalendarDays className="h-4 w-4 mr-2" />Today's Invoices
        </Button>
        <Button variant="ghost" onClick={resetBillings} disabled={loading}>
          Reset
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
        <DataTable columns={columns} data={billings} filterColumn="InvoiceNo" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBilling ? "Edit Invoice" : "New Invoice"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editingBilling && (
                <>
                  {!selectedPatient ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search patient by mobile number"
                          value={mobileSearch}
                          onChange={(e) => setMobileSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMobileSearch())}
                        />
                        <Button type="button" onClick={handleMobileSearch}>
                          <Search className="h-4 w-4 mr-2" />Search
                        </Button>
                      </div>

                      {mobileSearched && (
                        <div className="space-y-3">
                          {mobileResults.length > 0 ? (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {mobileResults.length} patient(s) found. Select or add new:
                              </p>
                              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {mobileResults.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                                    onClick={() => selectExistingPatient(p)}
                                  >
                                    <div>
                                      <p className="font-medium">{p.pName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {p.patientId} | {p.mobile} | {p.cnic || "No CNIC"}
                                      </p>
                                    </div>
                                    <Button type="button" size="sm" variant="outline">Select</Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No patients found with this mobile number</p>
                          )}
                          <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                          </Button>
                        </div>
                      )}

                      {!mobileSearched && (
                        <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center justify-between">
                      <div>
                        Patient: <strong>{selectedPatient.pName}</strong> ({selectedPatient.patientId})
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                        Change
                      </Button>
                    </div>
                  )}
                </>
              )}

              {selectedPatient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Invoice No *</Label>
                      <Input {...register("InvoiceNo")} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Date *</Label>
                      <Input type="date" {...register("InvoiceDate")} />
                      {errors.InvoiceDate && <p className="text-sm text-destructive">{errors.InvoiceDate.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Invoice Type *</Label>
                      <Select value={watch("InvoiceType")} onValueChange={(val) => setValue("InvoiceType", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPD">OPD</SelectItem>
                          <SelectItem value="IPD">IPD</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Laboratory">Laboratory</SelectItem>
                          <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="Radiology">Radiology</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method *</Label>
                      <Select value={watch("PaymentMethod")} onValueChange={(val) => setValue("PaymentMethod", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                          <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Sub Total *</Label>
                      <Input type="number" step="0.01" {...register("SubTotal")} />
                      {errors.SubTotal && <p className="text-sm text-destructive">{errors.SubTotal.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Discount *</Label>
                      <Input type="number" step="0.01" {...register("Discount")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax *</Label>
                      <Input type="number" step="0.01" {...register("Tax")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Total Amount *</Label>
                      <Input type="number" step="0.01" {...register("TotalAmount")} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Paid Amount *</Label>
                      <Input type="number" step="0.01" {...register("PaidAmount")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        value={totalAmount - paidAmount}
                        disabled
                        className={totalAmount - paidAmount > 0 ? "text-red-600" : "text-green-600"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Status *</Label>
                    <Select value={watch("PaymentStatus")} onValueChange={(val) => setValue("PaymentStatus", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea {...register("Notes")} placeholder="Additional notes" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingBilling ? "Update" : "Create"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingBilling && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice No</p>
                  <p className="font-medium">{viewingBilling.InvoiceNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(viewingBilling.InvoiceDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{viewingBilling.patient?.pName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline" className={typeColors[viewingBilling.InvoiceType]}>
                    {viewingBilling.InvoiceType}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Sub Total</p>
                  <p className="font-medium">{Number(viewingBilling.SubTotal).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-medium">{Number(viewingBilling.Discount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tax</p>
                  <p className="font-medium">{Number(viewingBilling.Tax).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">{Number(viewingBilling.TotalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium text-green-600">{Number(viewingBilling.PaidAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className={`font-medium ${viewingBilling.Balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {Number(viewingBilling.Balance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewingBilling.PaymentStatus]}>
                    {viewingBilling.PaymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <p className="font-medium">{viewingBilling.PaymentMethod}</p>
                </div>
              </div>
              {viewingBilling.Notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{viewingBilling.Notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
        prefillMobile={mobileSearch}
      />
    </div>
  );
}
