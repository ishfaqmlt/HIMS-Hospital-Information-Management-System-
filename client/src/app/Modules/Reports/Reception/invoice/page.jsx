"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import hospitalProfileService from "@/services/hospitalProfile.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import { ThermalReceipt } from "../../components/ThermalPrintLayout";
import { A4Receipt } from "../../components/A4PrintLayout";

function InvoicePrintComponent({ format, hospitalProfile, invoice, services, payment }) {
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
          />
        </div>
      </div>
    </>
  );
}

export async function printInvoiceSlip(invoice, format = "thermal", setMessage) {
  try {
    const [profileRes, detailsRes] = await Promise.all([
      hospitalProfileService.get(),
      billingDetailService.getAll({ invoiceNo: invoice.InvoiceNo }),
    ]);

    const profile = profileRes.data?.[0] || profileRes.data || {};
    const details = detailsRes.data || [];

    let payment = null;
    try {
      const payRes = await patientPaymentService.getAll({ invoiceNo: invoice.InvoiceNo });
      payment = payRes.data?.[0] || null;
    } catch {}

    const flatInvoice = {
      InvoiceNo: invoice.InvoiceNo,
      InvoiceDate: invoice.InvoiceDate,
      mrn: invoice.patientVisit?.patient?.mrn || "-",
      SubTotal: invoice.SubTotal,
      Discount: invoice.Discount,
      TotalAmount: invoice.TotalAmount,
      PaymentStatus: invoice.PaymentStatus,
      BillType: invoice.BillType,
      patientName: invoice.patientVisit?.patient?.pName || "-",
      mobile: invoice.patientVisit?.patient?.mobile || "-",
      gender: invoice.patientVisit?.patient?.gender || "-",
      doctorName: invoice.doctor?.Name || "-",
      departmentName: invoice.department?.DepartmentName || "-",
      tokenNo: invoice.tokenNo || null,
    };

    const serviceRows = details.map((d) => ({
      serviceCode: d.service?.Code || "",
      serviceName: d.service?.ServiceName || "-",
      Qty: d.Qty,
      Rate: d.Rate,
      Amount: d.Amount,
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
