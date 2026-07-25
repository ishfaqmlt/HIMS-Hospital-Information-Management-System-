import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import PrintHeader from "./PrintHeader";
import PrintFooter from "./PrintFooter";

function ThermalReceipt({ title, hospitalProfile, invoice, services, payment, showSignature }) {
  const date = new Date(invoice.InvoiceDate).toLocaleDateString("en-GB");

  return (
    <div style={{ fontFamily: "'Courier New', monospace", width: "280px", padding: "10px", fontSize: "12px" }}>
      <div style={{ textAlign: "center" }}>
        {hospitalProfile?.logo && (
          <img src={hospitalProfile.logo} alt="Logo" style={{ maxHeight: "50px" }} />
        )}
        <h3 style={{ fontSize: "14px" }}>{hospitalProfile?.hospitalName || "Hospital"}</h3>
        <p style={{ fontSize: "10px" }}>{hospitalProfile?.address || ""}</p>
        <p style={{ fontSize: "10px" }}>{hospitalProfile?.phone || ""}</p>
      </div>

      <div style={{ borderTop: "2px solid #000", margin: "6px 0" }} />
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px" }}>{title || "RECEIPT"}</div>
      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ fontSize: "10px" }}>Invoice:</td><td style={{ textAlign: "right", fontWeight: "bold" }}>{invoice.InvoiceNo}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Date:</td><td style={{ textAlign: "right" }}>{date}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>MRN:</td><td style={{ textAlign: "right" }}>{invoice.mrn || "-"}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Patient:</td><td style={{ textAlign: "right" }}>{invoice.patientName || "-"}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Patient ID:</td><td style={{ textAlign: "right" }}>{invoice.patientId || "-"}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Mobile:</td><td style={{ textAlign: "right" }}>{invoice.mobile || "-"}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Doctor:</td><td style={{ textAlign: "right" }}>{invoice.doctorName || "-"}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Department:</td><td style={{ textAlign: "right" }}>{invoice.departmentName || "-"}</td></tr>
        </tbody>
      </table>

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ fontSize: "10px", textAlign: "left", borderBottom: "1px solid #000" }}>Service</th>
            <th style={{ fontSize: "10px", textAlign: "center", borderBottom: "1px solid #000" }}>Qty</th>
            <th style={{ fontSize: "10px", textAlign: "right", borderBottom: "1px solid #000" }}>Rate</th>
            <th style={{ fontSize: "10px", textAlign: "right", borderBottom: "1px solid #000" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s, i) => (
            <tr key={i}>
              <td style={{ padding: "2px 0", fontSize: "11px" }}>{s.serviceName || "-"}</td>
              <td style={{ padding: "2px 0", fontSize: "11px", textAlign: "center" }}>{s.Qty || 1}</td>
              <td style={{ padding: "2px 0", fontSize: "11px", textAlign: "right" }}>{Number(s.Rate || 0).toFixed(2)}</td>
              <td style={{ padding: "2px 0", fontSize: "11px", textAlign: "right" }}>{Number(s.Amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ fontSize: "10px" }}>SubTotal:</td><td style={{ textAlign: "right" }}>{Number(invoice.SubTotal || 0).toFixed(2)}</td></tr>
          <tr><td style={{ fontSize: "10px" }}>Discount:</td><td style={{ textAlign: "right" }}>-{Number(invoice.Discount || 0).toFixed(2)}</td></tr>
          <tr style={{ borderTop: "1px solid #000" }}>
            <td style={{ fontWeight: "bold", padding: "4px 0" }}>TOTAL:</td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>{Number(invoice.TotalAmount || 0).toFixed(2)}</td>
          </tr>
          {payment && (
            <>
              <tr><td style={{ fontSize: "10px" }}>Paid:</td><td style={{ textAlign: "right" }}>{Number(payment.debit || 0).toFixed(2)}</td></tr>
              <tr><td style={{ fontSize: "10px" }}>Balance:</td><td style={{ textAlign: "right" }}>{Number(invoice.TotalAmount - (payment.debit || 0)).toFixed(2)}</td></tr>
            </>
          )}
          <tr><td style={{ fontSize: "10px" }}>Status:</td><td style={{ textAlign: "right", fontWeight: "bold" }}>{invoice.PaymentStatus || "-"}</td></tr>
        </tbody>
      </table>

      <div style={{ borderTop: "2px solid #000", margin: "6px 0" }} />
      <p style={{ textAlign: "center", fontSize: "10px" }}>Thank you for choosing our services</p>
    </div>
  );
}

export default function ThermalPrintLayout({ title, hospitalProfile, invoice, services, payment, showSignature = false }) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: invoice.InvoiceNo || "Receipt",
    contentStyle: "@page { size: 80mm auto; margin: 0; } @media print { body { margin: 0; } }",
  });

  return (
    <>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <ThermalReceipt
            title={title}
            hospitalProfile={hospitalProfile}
            invoice={invoice}
            services={services}
            payment={payment}
            showSignature={showSignature}
          />
        </div>
      </div>
      <button onClick={handlePrint} style={{ display: "none" }} id="print-thermal-trigger" />
    </>
  );
}

export { ThermalReceipt };
