"use client";

import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Plus, Save, Printer, X, Trash2 } from "lucide-react";
import PatientDetailsCard from "@/components/patients/PatientDetailsCard";
import patientTypeService from "@/services/patientTypeService";
import patientService from "@/services/patient.service";
import patientVisitService from "@/services/patientVisitService";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [patientTypes, setPatientTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  const [mrnSearch, setMrnSearch] = useState("");
  const [patientIdSearch, setPatientIdSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [existingMrn, setExistingMrn] = useState(null);

  const [patientType, setPatientType] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [tokenNo, setTokenNo] = useState("");
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 16));
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [selectedServices, setSelectedServices] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transacId, setTransacId] = useState("");
  const [totalBill, setTotalBill] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [pBalance, setPBalance] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [drShare, setDrShare] = useState(0);

  useEffect(() => {
    loadPatientTypes();
    loadDoctors();
    loadDepartments();
    loadServices();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadPatientTypes = async () => {
    try {
      const res = await patientTypeService.getAll();
      setPatientTypes(res.data);
      if (res.data.length > 0) {
        setPatientType(res.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch("/api/doctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await fetch("/api/departments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMrnSearch = async () => {
    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter MRN" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientVisitService.getByMrn(mrnSearch);
      if (res.data) {
        setExistingMrn(res.data.mrn);
        setSelectedPatient(res.data.patient);
        setPatientIdSearch(res.data.patientId);
        setPatientType(res.data.patientTypeId || "");
        setSelectedConsultant(res.data.doctorId || "");
      }
    } catch (error) {
      setMessage({ type: "error", text: "MRN not found" });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientIdSearch = async () => {
    if (!patientIdSearch.trim()) {
      setMessage({ type: "error", text: "Please enter Patient ID" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientService.getAll({ patientId: patientIdSearch });
      if (res.data.length > 0) {
        setSelectedPatient(res.data[0]);
        setExistingMrn(null);
      } else {
        setMessage({ type: "error", text: "Patient not found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    if (!selectedService) {
      setMessage({ type: "error", text: "Please select a service" });
      return;
    }
    const serviceObj = services.find((s) => s.id === selectedService);
    const newService = {
      id: selectedServices.length + 1,
      serviceId: selectedService,
      serviceCode: serviceObj?.ServiceCode || selectedService,
      fee: serviceObj?.Fee || 0,
      qty: 1,
      totalAmount: serviceObj?.Fee || 0,
      sharePercent: 0,
      shareAmount: 0,
    };
    setSelectedServices([...selectedServices, newService]);
    setSelectedService("");
    updateTotals([...selectedServices, newService]);
  };

  const removeService = (id) => {
    const updated = selectedServices.filter((s) => s.id !== id);
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateServiceQty = (id, qty) => {
    const updated = selectedServices.map((s) =>
      s.id === id ? { ...s, qty, totalAmount: s.fee * qty } : s
    );
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateServiceFee = (id, fee) => {
    const updated = selectedServices.map((s) =>
      s.id === id ? { ...s, fee, totalAmount: fee * s.qty } : s
    );
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateTotals = (serviceList) => {
    const subtotal = serviceList.reduce((sum, s) => sum + s.totalAmount, 0);
    setTotalBill(subtotal);
    const disc = subtotal * (discountPercent / 100);
    setDiscount(disc);
    setNetAmount(subtotal - disc);
  };

  const handleNew = () => {
    setMrnSearch("");
    setPatientIdSearch("");
    setSelectedPatient(null);
    setExistingMrn(null);
    setPatientType(patientTypes.length > 0 ? patientTypes[0].id : "");
    setVoucherNo("");
    setTokenNo("");
    setRegDate(new Date().toISOString().slice(0, 16));
    setSelectedConsultant("");
    setSelectedDepartment("");
    setSelectedService("");
    setSelectedServices([]);
    setPaymentMethod("Cash");
    setTransacId("");
    setTotalBill(0);
    setDiscountPercent(0);
    setDiscount(0);
    setNetAmount(0);
    setPaid(0);
    setRemaining(0);
    setPBalance(0);
    setRemarks("");
    setDrShare(0);
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please search and select a patient first" });
      return;
    }

    setLoading(true);
    try {
      let mrnToUse = existingMrn;

      if (!mrnToUse) {
        const visitRes = await patientVisitService.create({
          patientId: selectedPatient.patientId,
          patientTypeId: patientType,
          InsuranceCompanyId: null,
          doctorId: selectedConsultant || null,
          UserId: 1,
        });
        mrnToUse = visitRes.data.mrn;
        setExistingMrn(mrnToUse);
      }

      setMessage({ type: "success", text: `Visit saved with MRN: ${mrnToUse}` });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Patient Details Section */}
      <PatientDetailsCard
        mrnSearch={mrnSearch}
        onMrnSearchChange={setMrnSearch}
        onMrnSearch={handleMrnSearch}
        patientIdSearch={patientIdSearch}
        onPatientIdSearchChange={setPatientIdSearch}
        onPatientIdSearch={handlePatientIdSearch}
        selectedPatient={selectedPatient}
        patientType={patientType}
        onPatientTypeChange={setPatientType}
        patientTypes={patientTypes}
      />

      {/* Service Selection Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-6 gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Voucher No</Label>
              <Input
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="h-8 text-xs"
                placeholder="Voucher No"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Token No</Label>
              <Input
                value={tokenNo}
                onChange={(e) => setTokenNo(e.target.value)}
                className="h-8 text-xs"
                placeholder="Token No"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Reg. Date</Label>
              <Input
                type="datetime-local"
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Consultant</Label>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Service</Label>
              <div className="flex gap-1">
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.ServiceName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={addService}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Services Table */}
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-lg font-semibold">Selected Services</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs h-8">ID</TableHead>
                <TableHead className="text-xs h-8">Service Code</TableHead>
                <TableHead className="text-xs h-8">Fee</TableHead>
                <TableHead className="text-xs h-8">Qty</TableHead>
                <TableHead className="text-xs h-8">Total Amount</TableHead>
                <TableHead className="text-xs h-8">Share %</TableHead>
                <TableHead className="text-xs h-8">Share Amount</TableHead>
                <TableHead className="text-xs h-8">Print Token</TableHead>
                <TableHead className="text-xs h-8">Remove</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedServices.length > 0 ? (
                selectedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="text-xs py-1">{service.id}</TableCell>
                    <TableCell className="text-xs py-1">{service.serviceCode}</TableCell>
                    <TableCell className="text-xs py-1">
                      <Input
                        type="number"
                        value={service.fee}
                        onChange={(e) => updateServiceFee(service.id, Number(e.target.value))}
                        className="h-6 text-xs w-20"
                      />
                    </TableCell>
                    <TableCell className="text-xs py-1">
                      <Input
                        type="number"
                        value={service.qty}
                        onChange={(e) => updateServiceQty(service.id, Number(e.target.value))}
                        className="h-6 text-xs w-16"
                      />
                    </TableCell>
                    <TableCell className="text-xs py-1">{service.totalAmount}</TableCell>
                    <TableCell className="text-xs py-1">{service.sharePercent}</TableCell>
                    <TableCell className="text-xs py-1">{service.shareAmount}</TableCell>
                    <TableCell className="text-xs py-1">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Printer className="h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-xs py-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-destructive"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-8">
                    No services added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-9 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Payment</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Transac. Id</Label>
              <Input
                value={transacId}
                onChange={(e) => setTransacId(e.target.value)}
                className="h-8 text-xs"
                placeholder="Transaction ID"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Total Bill</Label>
              <Input
                type="number"
                value={totalBill}
                className="h-8 text-xs bg-muted"
                disabled
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Discount %</Label>
              <Input
                type="number"
                value={discountPercent}
                onChange={(e) => {
                  const pct = Number(e.target.value);
                  setDiscountPercent(pct);
                  const disc = totalBill * (pct / 100);
                  setDiscount(disc);
                  setNetAmount(totalBill - disc);
                }}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Discount</Label>
              <Input
                type="number"
                value={discount}
                className="h-8 text-xs bg-muted"
                disabled
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Net Amount</Label>
              <Input
                type="number"
                value={netAmount}
                className="h-8 text-xs bg-muted"
                disabled
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Paid</Label>
              <Input
                type="number"
                value={paid}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setPaid(p);
                  setRemaining(netAmount - p);
                }}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Remaining</Label>
              <Input
                type="number"
                value={remaining}
                className="h-8 text-xs bg-muted"
                disabled
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">P. Balance</Label>
              <Input
                type="number"
                value={pBalance}
                onChange={(e) => setPBalance(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1">
              <Label className="text-xs">Remarks</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="h-8 text-xs"
                placeholder="Remarks"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dr. Share</Label>
              <Input
                type="number"
                value={drShare}
                onChange={(e) => setDrShare(Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleNew} disabled={loading}>
          <Plus className="h-4 w-4 mr-1" /> New (Ctrl+N)
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save (Ctrl+S)
        </Button>
        <Button variant="outline" disabled={loading}>
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
        <Button variant="destructive" onClick={handleNew} disabled={loading}>
          <X className="h-4 w-4 mr-1" /> Exit (F4)
        </Button>
      </div>
    </div>
  );
}
