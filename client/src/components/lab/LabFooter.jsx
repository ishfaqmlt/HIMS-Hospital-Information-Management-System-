"use client";

import React from "react";
import { getImageUrl } from "@/lib/utils";

export default function LabFooter({ settings }) {
  const showLegalDisclaimer = settings?.showLegalDisclaimer ?? true;
  const legalDisclaimerText = settings?.legalDisclaimerText || "NOT VALID FOR ANY COURT OF LAW";
  const showDoctorSignatures = settings?.showDoctorSignatures ?? true;
  const footerImage = settings?.footerImage;
  const showFooterImage = settings?.showFooterImage ?? true;

  const isFooterImageDisplayed = !!(footerImage && showFooterImage);
  const hasAnyFooterContent = isFooterImageDisplayed || showDoctorSignatures || showLegalDisclaimer;

  return (
    <div className="w-full text-black mt-2 font-sans">
      {!hasAnyFooterContent ? (
        /* Empty Spacer reserved for pre-printed footer paper */
        <div className="h-20 w-full block" />
      ) : (
        <>
          {/* Footer Image if configured and allowed, otherwise Doctor Signatures Grid */}
          {isFooterImageDisplayed ? (
            <div className="w-full min-w-full mb-2">
              <img
                src={getImageUrl(footerImage)}
                alt="Footer"
                className="w-full min-w-full h-auto object-fill block"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            showDoctorSignatures && (
              <div className="grid grid-cols-4 gap-1 text-[10px] border border-green-700 rounded p-1 bg-green-50/20">
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر عبدالقیوم ملک</p>
                  <p className="text-[9px] text-gray-600">میڈیکل سپیشلسٹ</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر زاہدہ قیوم ملک</p>
                  <p className="text-[9px] text-gray-600">گائناکالوجسٹ</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر فیصل یاسین شاہ</p>
                  <p className="text-[9px] text-gray-600">کنسلٹنٹ سرجن</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر سلیم اختر خان</p>
                  <p className="text-[9px] text-gray-600">نیورو سرجن</p>
                </div>

                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر قاضی قمر الدین</p>
                  <p className="text-[9px] text-gray-600">میڈیکل سپیشلسٹ</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر سید رسول</p>
                  <p className="text-[9px] text-gray-600">آئی سرجن</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر مختیار کمبوہ</p>
                  <p className="text-[9px] text-gray-600">چائلڈ سپیشلسٹ</p>
                </div>
                <div className="border border-green-600 bg-white p-1 text-center rounded">
                  <p className="font-bold text-green-900">ڈاکٹر سجاد حسین لنگاہ</p>
                  <p className="text-[9px] text-gray-600">نیورو فزیشن</p>
                </div>
              </div>
            )
          )}

          {/* Red Legal Disclaimer Banner — Hidden if showFooterImage toggle is true, otherwise shown if showLegalDisclaimer is true */}
          {!showFooterImage && showLegalDisclaimer && (
            <div className="bg-red-700 text-white font-bold text-center text-xs py-1 px-2 rounded shadow-sm flex items-center justify-between bottom-0">
              <span>{legalDisclaimerText}</span>
              <span className="text-[11px] font-normal">📞 0453-510319 / 0333-8908071</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
