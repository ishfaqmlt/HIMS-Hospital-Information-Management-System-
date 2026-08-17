"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { calculateAge, getImageUrl } from "@/lib/utils";

const formatSexAndAge = (patient, caseData) => {
  const gender =
    patient?.gender ||
    patient?.gander ||
    caseData?.patient_gender ||
    caseData?.gender ||
    "-";

  let ageVal =
    patient?.age ||
    caseData?.patient_age ||
    caseData?.age ||
    "";

  const dobVal =
    patient?.dob ||
    caseData?.patient_dob ||
    caseData?.dob;

  if (!ageVal && dobVal) {
    ageVal = calculateAge(dobVal);
  } else if (ageVal && !isNaN(ageVal)) {
    ageVal = `${ageVal} Year(s)`;
  }

  return ageVal ? `${gender} / ${ageVal}` : gender;
};

export default function LabHeader({ caseData, settings, hospitalProfile }) {
  const showHeader = settings?.showHeader ?? true;
  const showQrCode = settings?.showQrCode ?? true;
  const headerImage = settings?.headerImage;

  const patient = caseData?.patient || {};
  const doctor = caseData?.doctor || {};

  return (
    <div className="w-full text-black space-y-3 font-sans">
      {/* Top Banner / Pre-printed Letterhead image or Dynamic Header */}
      {showHeader ? (
        <div className="flex items-center justify-between border-b pb-2 border-red-700 mb-2">
          {/* Left Side (50% Width) - Header Image OR Default Logo & Info */}
          <div className="w-1/2 flex items-center gap-3">
            {headerImage ? (
              <img
                src={getImageUrl(headerImage)}
                alt="Header"
                className="w-full h-auto object-contain max-h-28"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow flex-shrink-0">
                  RL
                </div>
                <div>
                  <h1 className="text-3xl font-black text-red-600 tracking-tight leading-none uppercase">
                    {hospitalProfile?.name || "REHAN LAB"}
                  </h1>
                  <p className="text-xs font-semibold text-green-700 mt-0.5">
                    Accurate | Caring | Instant
                  </p>
                  <p className="text-[11px] text-gray-700 font-medium">
                    {hospitalProfile?.address || "Musa Memorial Hospital, Near Daewoo Terminal, Bhakkar"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - QR Code */}
          {showQrCode && (
            <div className="flex flex-col items-center shrink-0">
              <QRCodeSVG
                value={`CASE:${caseData?.caseNo || "N/A"}|MRN:${patient?.mrn || "N/A"}`}
                size={65}
              />
              <span className="text-[9px] text-gray-500 font-mono mt-0.5">Scan Verification</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Spacer reserved for pre-printed letterhead paper */
        <div className="h-28 w-full block" />
      )}

      {/* Patient Demographics Box */}
      <div className="border border-gray-400 rounded-sm p-2 text-xs grid grid-cols-3 gap-x-4 gap-y-1.5 bg-gray-50/50">
        <div>
          <span className="font-semibold text-gray-700">Patient Name: </span>
          <span className="font-bold text-black">{patient?.pName || caseData?.patient_name || "-"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Mobile No.: </span>
          <span>{patient?.mobile || caseData?.patient_mobile || "-"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Lab ID: </span>
          <span className="font-bold">{caseData?.caseNo || "-"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Guardian: </span>
          <span>{patient?.guardianName || "-"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Address: </span>
          <span>{patient?.address || "-"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">MR No.: </span>
          <span className="font-bold">{patient?.mrn || caseData?.patient_mrn || "-"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">Sex / Age: </span>
          <span className="font-medium text-black">
            {formatSexAndAge(patient, caseData)}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Consultant: </span>
          <span>{doctor?.Name || caseData?.doctor_name || caseData?.orReffBy || "-"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Received at: </span>
          <span>{caseData?.created_at ? caseData.created_at.replace("T", " ").substring(0, 16) : "-"}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">CNIC No.: </span>
          <span>{patient?.cnic || "-"}</span>
        </div>
        <div colSpan={2}>
          <span className="font-semibold text-gray-700">Reported at: </span>
          <span>{caseData?.updated_at ? caseData.updated_at.replace("T", " ").substring(0, 16) : "-"}</span>
        </div>
      </div>
    </div>
  );
}
