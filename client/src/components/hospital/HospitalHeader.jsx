"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { getImageUrl } from "@/lib/utils";

export default function HospitalHeader({ settings, hospitalProfile, title, qrData }) {
  const showHeader = settings?.showHeader ?? true;
  const showQrCode = settings?.showQrCode ?? true;
  const headerImage = settings?.headerImage;

  return (
    <div className="w-full text-black space-y-2 font-sans">
      {showHeader && (
        <div className="flex items-center justify-between border-b pb-2 border-gray-300 mb-2">
          {/* Left Side (50% Width) - Header Image OR Default Logo & Info */}
          <div className="w-1/2 flex items-center gap-3">
            {headerImage ? (
              <img
                src={getImageUrl(headerImage)}
                alt="Hospital Header"
                className="w-full h-auto object-contain max-h-28"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow shrink-0">
                  {hospitalProfile?.name ? hospitalProfile.name.charAt(0) : "H"}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none uppercase">
                    {hospitalProfile?.name || "Hospital Information Management System"}
                  </h1>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {hospitalProfile?.address || "Main Hospital Address, City, Country"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Ph: {hospitalProfile?.phone || "0453-510319"} | Email: {hospitalProfile?.email || "info@hospital.com"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Title or QR Code */}
          <div className="flex items-center gap-4">
            {title && (
              <div className="text-right">
                <h2 className="text-lg font-bold text-gray-800 tracking-wide uppercase">{title}</h2>
              </div>
            )}
            {showQrCode && qrData && (
              <div className="flex flex-col items-center shrink-0 border p-1 rounded bg-white">
                <QRCodeSVG value={qrData} size={55} />
                <span className="text-[8px] text-gray-500 font-mono mt-0.5">Verification</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
