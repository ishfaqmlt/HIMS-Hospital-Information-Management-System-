import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { formatDate } from "@/lib/utils";
import HospitalHeader from "@/components/hospital/HospitalHeader";
import HospitalFooter from "@/components/hospital/HospitalFooter";

function A4Receipt({ title, hospitalProfile, invoice, services, payment, settings, showSignature }) {
  const date = formatDate(invoice.InvoiceDate);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#333",
        display: "flex",
        flexDirection: "column",
        justify: "space-between",
        minHeight: "275mm",
        boxSizing: "border-box",
      }}
    >
      {/* Top Header */}
      <div style={{ flex: 0, marginTop: "20px", paddingLeft: "20px", paddingRight: "20px" }}>
        <HospitalHeader
          settings={settings}
          hospitalProfile={hospitalProfile}
          title={title || "INVOICE"}
          qrData={`${invoice.InvoiceNo || ""}|${invoice.mrn || ""}`}
        />
      </div>

      {/* Central Content Area with Generous Padding */}
      <div style={{ flex: 1, paddingTop: "20px", paddingBottom: "20px" , paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px", background: "#f8fafc", lineHeight: "1.6" }}>
            <h4 style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Invoice Details</h4>
            <p style={{ margin: "4px 0" }}><strong>Invoice No:</strong> {invoice.InvoiceNo}</p>
            <p style={{ margin: "4px 0" }}><strong>Date:</strong> {date}</p>
            <p style={{ margin: "4px 0" }}><strong>MRN:</strong> {invoice.mrn || "-"}</p>
            <p style={{ margin: "4px 0" }}><strong>Bill Type:</strong> {invoice.BillType || "Normal"}</p>
          </div>

          <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px", background: "#f8fafc", lineHeight: "1.6" }}>
            <h4 style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Patient Information</h4>
            <p style={{ margin: "4px 0" }}><strong>Name:</strong> {invoice.patientName || "-"}</p>
            <p style={{ margin: "4px 0" }}><strong>Mobile:</strong> {invoice.mobile || "-"}</p>
            <p style={{ margin: "4px 0" }}><strong>Gender:</strong> {invoice.gender || "-"}</p>
          </div>

          <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px", background: "#f8fafc", lineHeight: "1.6" }}>
            <h4 style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Doctor / Department</h4>
            <p style={{ margin: "4px 0" }}><strong>Doctor:</strong> {invoice.doctorName || "-"}</p>
            <p style={{ margin: "4px 0" }}><strong>Department:</strong> {invoice.departmentName || "-"}</p>
          </div>

          <div style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "16px", background: "#f8fafc", lineHeight: "1.6" }}>
            <h4 style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Payment Status</h4>
            <p style={{ margin: "4px 0" }}>
              <span style={{
                display: "inline-block", padding: "4px 12px", borderRadius: "14px", fontSize: "11px", fontWeight: "bold",
                background: invoice.PaymentStatus === "Paid" ? "#dcfce7" : invoice.PaymentStatus === "Partial" ? "#fef9c3" : invoice.PaymentStatus === "Cancelled" ? "#fee2e2" : "#f3f4f6",
                color: invoice.PaymentStatus === "Paid" ? "#166534" : invoice.PaymentStatus === "Partial" ? "#854d0e" : invoice.PaymentStatus === "Cancelled" ? "#991b1b" : "#374151",
              }}>
                {invoice.PaymentStatus || "Pending"}
              </span>
            </p>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", margin: "24px 0", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
          <thead>
            <tr style={{ background: "#334155", color: "white" }}>
              <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px" }}>#</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px" }}>Code</th>
              <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "11px" }}>Service</th>
              <th style={{ padding: "12px 14px", textAlign: "center", fontSize: "11px" }}>Qty</th>
              <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px" }}>Rate</th>
              <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "11px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? services.map((s, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px" }}>{i + 1}</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", fontFamily: "monospace" }}>{s.serviceCode || "-"}</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "500" }}>{s.serviceName || "-"}</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", textAlign: "center" }}>{s.Qty || 1}</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", textAlign: "right" }}>{Number(s.Rate || 0).toFixed(2)}</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "12px", textAlign: "right", fontWeight: "600" }}>{Number(s.Amount || 0).toFixed(2)}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>No services</td></tr>
            )}
          </tbody>
        </table>

        <div style={{ float: "right", width: "280px", marginTop: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr><td style={{ padding: "6px 10px", fontSize: "12px" }}>SubTotal:</td><td style={{ padding: "6px 10px", fontSize: "12px", textAlign: "right" }}>{Number(invoice.SubTotal || 0).toFixed(2)}</td></tr>
              <tr><td style={{ padding: "6px 10px", fontSize: "12px" }}>Discount:</td><td style={{ padding: "6px 10px", fontSize: "12px", textAlign: "right" }}>-{Number(invoice.Discount || 0).toFixed(2)}</td></tr>
              <tr><td style={{ padding: "8px 10px", fontSize: "14px", borderTop: "2px solid #0f172a", fontWeight: "bold" }}>Total:</td><td style={{ padding: "8px 10px", fontSize: "14px", borderTop: "2px solid #0f172a", fontWeight: "bold", textAlign: "right" }}>{Number(invoice.TotalAmount || 0).toFixed(2)}</td></tr>
              {payment && (
                <>
                  <tr><td style={{ padding: "6px 10px", fontSize: "12px" }}>Paid:</td><td style={{ padding: "6px 10px", fontSize: "12px", textAlign: "right" }}>{Number(payment.debit || 0).toFixed(2)}</td></tr>
                  <tr><td style={{ padding: "6px 10px", fontSize: "12px" }}>Balance:</td><td style={{ padding: "6px 10px", fontSize: "12px", textAlign: "right" }}>{Number(invoice.TotalAmount - (payment.debit || 0)).toFixed(2)}</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {showSignature && (
          <div style={{ clear: "both", display: "flex", justifyContent: "space-between", paddingTop: "48px" }}>
            <div style={{ textAlign: "center", width: "200px" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>Patient Signature</div>
            </div>
            <div style={{ textAlign: "center", width: "200px" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "6px", fontSize: "11px" }}>Authorized Signature</div>
            </div>
          </div>
        )}
      </div>

      {/* Pinned Footer at Bottom of A4 Page */}
      <div style={{ clear: "both", width: "100%", marginTop: "auto", marginBottom: "0" }}>
        <HospitalFooter settings={settings} hospitalProfile={hospitalProfile} />
      </div>
    </div>
  );
}

export default function A4PrintLayout({ title, hospitalProfile, invoice, services, payment, showSignature = false }) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: invoice.InvoiceNo || "Invoice",
    contentStyle: "@page { size: A4; margin: 10mm 12mm; }",
  });

  return (
    <>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <A4Receipt
            title={title}
            hospitalProfile={hospitalProfile}
            invoice={invoice}
            services={services}
            payment={payment}
            showSignature={showSignature}
          />
        </div>
      </div>
      <button onClick={handlePrint} style={{ display: "none" }} id="print-a4-trigger" />
    </>
  );
}

export { A4Receipt };
