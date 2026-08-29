"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import hospitalProfileService from "@/services/hospitalProfile.service";
import hospitalOutputSettingService from "@/services/hospitalOutputSetting.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import { ThermalReceipt } from "../../components/ThermalPrintLayout";
import { A4Receipt } from "../../components/A4PrintLayout";

function InvoicePrintComponent({ format, hospitalProfile, invoice, services, payment, settings }) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: invoice?.InvoiceNo || "Invoice",
    contentStyle: format === "a4"
      ? "@page { size: A4; margin: 20mm; }"
      : "@page { size: 80mm auto; margin: 0; } @media print { body { margin: 0; } }",
  });

  useEffect(() => {
    if (invoice && services.length > 0) {
      const timer = setTimeout(() => handlePrint(), 300);
      return () => clearTimeout(timer);
    }
  }, [invoice, services]);

  if (!invoice) return null;

  const Layout = format === "a4" ? A4Receipt : ThermalReceipt;
  const title = format === "a4" ? "INVOICE" : "RECEIPT";

  return (
    <>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <Layout
            title={title}
            hospitalProfile={hospitalProfile}
            invoice={invoice}
            services={services}
            payment={payment}
            settings={settings}
          />
        </div>
      </div>
    </>
  );
}

export async function printInvoiceSlip(invoice, format = "thermal", setMessage) {
  try {
    const billingId = invoice?.id || invoice?.Id;
    const invoiceNo = invoice?.InvoiceNo || invoice?.invoiceNo;

    // Check if details or services are already in invoice object
    const existingDetails = invoice?.details || invoice?.services;
    const existingPayment = invoice?.payment;

    const [profileRes, detailsRes, settingsRes] = await Promise.all([
      hospitalProfileService.get().catch(() => ({ data: {} })),
      (!existingDetails && billingId)
        ? billingDetailService.getAll({ BillingId: billingId }).catch(() => ({ data: [] }))
        : Promise.resolve({ data: existingDetails || [] }),
      hospitalOutputSettingService.get().catch(() => ({ data: null })),
    ]);

    const profile = profileRes.data?.[0] || profileRes.data || {};
    const details = detailsRes.data || existingDetails || [];
    const settings = settingsRes.data || null;

    let payment = existingPayment || null;
    if (!payment && invoiceNo) {
      try {
        const payRes = await patientPaymentService.getAll({ invoiceNo });
        payment = payRes.data?.[0] || null;
      } catch {}
    }

    const flatInvoice = {
      InvoiceNo: invoiceNo || "-",
      InvoiceDate: invoice?.InvoiceDate || invoice?.invoiceDate || new Date().toISOString(),
      mrn:
        invoice?.patientVisit?.patient?.mrn ||
        invoice?.patient_mrn ||
        invoice?.mrn ||
        invoice?.patient?.mrn ||
        "-",
      SubTotal: invoice?.SubTotal || invoice?.subTotal || 0,
      Discount: invoice?.Discount || invoice?.discount || 0,
      TotalAmount: invoice?.TotalAmount || invoice?.totalAmount || 0,
      PaymentStatus: invoice?.PaymentStatus || invoice?.paymentStatus || "Paid",
      BillType: invoice?.BillType || invoice?.billType || "Normal",
      patientName:
        invoice?.patientVisit?.patient?.pName ||
        invoice?.patient_name ||
        invoice?.patientName ||
        invoice?.pName ||
        invoice?.patient?.pName ||
        "-",
      mobile:
        invoice?.patientVisit?.patient?.mobile ||
        invoice?.patient_mobile ||
        invoice?.mobile ||
        invoice?.patient?.mobile ||
        "-",
      gender:
        invoice?.patientVisit?.patient?.gender ||
        invoice?.patient_gender ||
        invoice?.gender ||
        invoice?.patient?.gender ||
        "-",
      doctorName:
        invoice?.doctor?.Name ||
        invoice?.doctor_name ||
        invoice?.doctorName ||
        "-",
      departmentName:
        invoice?.department?.DepartmentName ||
        invoice?.department_name ||
        invoice?.departmentName ||
        "-",
      tokenNo: invoice?.tokenNo || null,
    };

    const serviceRows = (Array.isArray(details) ? details : []).map((d) => ({
      serviceCode: d.service?.Code || d.serviceCode || d.Code || d.code || "",
      serviceName: d.service?.ServiceName || d.serviceName || d.ServiceName || d.name || "-",
      Qty: Number(d.Qty || d.qty || 1),
      Rate: Number(d.Rate || d.fee || d.rate || 0),
      Amount: Number(d.Amount || d.amount || (Number(d.Rate || d.fee || 0) * Number(d.Qty || d.qty || 1))),
    }));

    const printContainer = document.createElement("div");
    printContainer.id = "print-invoice-container";
    document.body.appendChild(printContainer);

    const { createRoot } = await import("react-dom/client");
    const root = createRoot(printContainer);

    root.render(
      <InvoicePrintComponent
        format={format}
        hospitalProfile={profile}
        invoice={flatInvoice}
        services={serviceRows}
        payment={payment}
        settings={settings}
      />
    );

    setTimeout(() => {
      root.unmount();
      if (printContainer.parentNode) {
        printContainer.parentNode.removeChild(printContainer);
      }
    }, 5000);
  } catch (error) {
    console.error(error);
    if (setMessage) {
      setMessage({ type: "error", text: "Failed to load invoice for printing" });
    }
  }
}

export default function InvoicePage() {
  return null;
}
