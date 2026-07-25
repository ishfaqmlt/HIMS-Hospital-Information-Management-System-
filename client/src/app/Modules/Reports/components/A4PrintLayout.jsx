import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

function A4Receipt({ title, hospitalProfile, invoice, services, payment, showSignature }) {
  const date = new Date(invoice.InvoiceDate).toLocaleDateString("en-GB");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "#333" }}>
      <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #2563eb", paddingBottom: "10px" }}>
        {hospitalProfile?.logo && (
          <img src={hospitalProfile.logo} alt="Logo" style={{ maxHeight: "60px", marginBottom: "5px" }} />
        )}
        <h1 style={{ fontSize: "18px", color: "#1e40af", margin: "5px 0" }}>{hospitalProfile?.hospitalName || "Hospital Name"}</h1>
        <p style={{ fontSize: "11px", color: "#666" }}>{hospitalProfile?.address || ""}</p>
        <p style={{ fontSize: "11px", color: "#666" }}>{hospitalProfile?.phone || ""} {hospitalProfile?.website ? `| ${hospitalProfile.website}` : ""}</p>
      </div>

      <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold", margin: "15px 0", color: "#1e40af" }}>
        {title || "INVOICE"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px" }}>
          <h4 style={{ fontSize: "11px", color: "#6b7280", marginBottom: "5px", textTransform: "uppercase" }}>Invoice Details</h4>
          <p style={{ margin: "2px 0" }}><strong>Invoice No:</strong> {invoice.InvoiceNo}</p>
          <p style={{ margin: "2px 0" }}><strong>Date:</strong> {date}</p>
          <p style={{ margin: "2px 0" }}><strong>MRN:</strong> {invoice.mrn || "-"}</p>
          <p style={{ margin: "2px 0" }}><strong>Bill Type:</strong> {invoice.BillType || "Normal"}</p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px" }}>
          <h4 style={{ fontSize: "11px", color: "#6b7280", marginBottom: "5px", textTransform: "uppercase" }}>Patient Information</h4>
          <p style={{ margin: "2px 0" }}><strong>Name:</strong> {invoice.patientName || "-"}</p>
          <p style={{ margin: "2px 0" }}><strong>ID:</strong> {invoice.patientId || "-"}</p>
          <p style={{ margin: "2px 0" }}><strong>Mobile:</strong> {invoice.mobile || "-"}</p>
          <p style={{ margin: "2px 0" }}><strong>Gender:</strong> {invoice.gender || "-"}</p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px" }}>
          <h4 style={{ fontSize: "11px", color: "#6b7280", marginBottom: "5px", textTransform: "uppercase" }}>Doctor / Department</h4>
          <p style={{ margin: "2px 0" }}><strong>Doctor:</strong> {invoice.doctorName || "-"}</p>
          <p style={{ margin: "2px 0" }}><strong>Department:</strong> {invoice.departmentName || "-"}</p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px" }}>
          <h4 style={{ fontSize: "11px", color: "#6b7280", marginBottom: "5px", textTransform: "uppercase" }}>Payment Status</h4>
          <p>
            <span style={{
              display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold",
              background: invoice.PaymentStatus === "Paid" ? "#dcfce7" : invoice.PaymentStatus === "Partial" ? "#fef9c3" : invoice.PaymentStatus === "Cancelled" ? "#fee2e2" : "#f3f4f6",
              color: invoice.PaymentStatus === "Paid" ? "#166534" : invoice.PaymentStatus === "Partial" ? "#854d0e" : invoice.PaymentStatus === "Cancelled" ? "#991b1b" : "#374151",
            }}>
              {invoice.PaymentStatus || "Pending"}
            </span>
          </p>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", margin: "15px 0" }}>
        <thead>
          <tr style={{ background: "#2563eb", color: "white" }}>
            <th style={{ padding: "8px", textAlign: "left", fontSize: "11px" }}>#</th>
            <th style={{ padding: "8px", textAlign: "left", fontSize: "11px" }}>Code</th>
            <th style={{ padding: "8px", textAlign: "left", fontSize: "11px" }}>Service</th>
            <th style={{ padding: "8px", textAlign: "center", fontSize: "11px" }}>Qty</th>
            <th style={{ padding: "8px", textAlign: "right", fontSize: "11px" }}>Rate</th>
            <th style={{ padding: "8px", textAlign: "right", fontSize: "11px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? services.map((s, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px" }}>{i + 1}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px" }}>{s.serviceCode || "-"}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px" }}>{s.serviceName || "-"}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px", textAlign: "center" }}>{s.Qty || 1}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px", textAlign: "right" }}>{Number(s.Rate || 0).toFixed(2)}</td>
              <td style={{ padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: "12px", textAlign: "right" }}>{Number(s.Amount || 0).toFixed(2)}</td>
            </tr>
          )) : (
            <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No services</td></tr>
          )}
        </tbody>
      </table>

      <div style={{ float: "right", width: "250px", marginTop: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ padding: "4px 8px", fontSize: "12px" }}>SubTotal:</td><td style={{ padding: "4px 8px", fontSize: "12px", textAlign: "right" }}>{Number(invoice.SubTotal || 0).toFixed(2)}</td></tr>
            <tr><td style={{ padding: "4px 8px", fontSize: "12px" }}>Discount:</td><td style={{ padding: "4px 8px", fontSize: "12px", textAlign: "right" }}>-{Number(invoice.Discount || 0).toFixed(2)}</td></tr>
            <tr><td style={{ padding: "4px 8px", fontSize: "14px", borderTop: "2px solid #2563eb", fontWeight: "bold" }}>Total:</td><td style={{ padding: "4px 8px", fontSize: "14px", borderTop: "2px solid #2563eb", fontWeight: "bold", textAlign: "right" }}>{Number(invoice.TotalAmount || 0).toFixed(2)}</td></tr>
            {payment && (
              <>
                <tr><td style={{ padding: "4px 8px", fontSize: "12px" }}>Paid:</td><td style={{ padding: "4px 8px", fontSize: "12px", textAlign: "right" }}>{Number(payment.debit || 0).toFixed(2)}</td></tr>
                <tr><td style={{ padding: "4px 8px", fontSize: "12px" }}>Balance:</td><td style={{ padding: "4px 8px", fontSize: "12px", textAlign: "right" }}>{Number(invoice.TotalAmount - (payment.debit || 0)).toFixed(2)}</td></tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {showSignature && (
        <div style={{ clear: "both", display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
          <div style={{ textAlign: "center", width: "200px" }}>
            <div style={{ borderTop: "1px solid #333", marginTop: "40px", paddingTop: "5px", fontSize: "11px" }}>Patient Signature</div>
          </div>
          <div style={{ textAlign: "center", width: "200px" }}>
            <div style={{ borderTop: "1px solid #333", marginTop: "40px", paddingTop: "5px", fontSize: "11px" }}>Authorized Signature</div>
          </div>
        </div>
      )}

      <div style={{ clear: "both", marginTop: "30px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "10px" }}>Thank you for choosing our services</p>
      </div>
    </div>
  );
}

export default function A4PrintLayout({ title, hospitalProfile, invoice, services, payment, showSignature = false }) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: invoice.InvoiceNo || "Invoice",
    contentStyle: "@page { size: A4; margin: 20mm; }",
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
