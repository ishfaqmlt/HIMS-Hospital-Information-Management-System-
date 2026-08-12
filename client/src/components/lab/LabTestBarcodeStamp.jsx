"use client";

import React from "react";
import Barcode from "react-barcode";

export default function LabTestBarcodeStamp({ testName, caseNo, testId, approvedAt, settings }) {
  const showBarcode = settings?.showBarcodeOnReport ?? true;
  const showApprovedAt = settings?.showApprovedAtOnReport ?? true;

  const barcodeValue = testId ? `${caseNo || "CASE"}-${testId.substring(0, 6)}` : caseNo || "1001";
  const formattedApprovedAt = approvedAt
    ? new Date(approvedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="w-full flex items-center justify-between border-b-2 border-black pb-1 mb-2">
      {/* Test Name Heading */}
      <h3 className="text-base font-black text-black uppercase tracking-wide">
        {testName || "LABORATORY TEST REPORT"}
      </h3>

      {/* Ultra-compact Barcode + Approved At Stamp Box */}
      {(showBarcode || showApprovedAt) && (
        <div className="border border-black bg-white px-1 py-0.5 flex flex-col items-center justify-center text-center">
          {showBarcode && (
            <div className="h-4 flex items-center justify-center overflow-hidden">
              <Barcode
                value={barcodeValue}
                width={0.8}
                height={12}
                displayValue={false}
                margin={0}
              />
            </div>
          )}
          <span className="text-[8px] font-bold text-black font-mono leading-none tracking-tight">
            {barcodeValue}
          </span>
          {showApprovedAt && (
            <span className="text-[7.5px] font-medium text-gray-800 font-mono leading-none tracking-tight mt-0.5">
              {formattedApprovedAt}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
