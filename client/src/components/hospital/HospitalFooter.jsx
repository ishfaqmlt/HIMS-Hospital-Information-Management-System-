"use client";

import React from "react";
import { getImageUrl } from "@/lib/utils";

export default function HospitalFooter({ settings, hospitalProfile }) {
  const showFooter = settings?.showFooter ?? true;
  const showLegalDisclaimer = settings?.showLegalDisclaimer ?? true;
  const legalDisclaimerText = settings?.legalDisclaimerText || "Thank you for choosing our services";
  const footerImage = settings?.footerImage;
  const showFooterImage = settings?.showFooterImage ?? false;

  if (!showFooter) return null;

  const isFooterImageDisplayed = !!(footerImage && showFooterImage);

  return (
    <div className="w-full text-black mt-4 font-sans">
      {/* Footer Image if configured, otherwise Legal Disclaimer / Thank You Banner */}
      {isFooterImageDisplayed ? (
        <div className="w-full min-w-full mb-1">
          <img
            src={getImageUrl(footerImage)}
            alt="Hospital Footer"
            className="w-full min-w-full h-auto object-fill block"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        showLegalDisclaimer && (
          <div className="border-t border-gray-300 pt-2 text-center text-xs text-gray-600 font-medium">
            <p>{legalDisclaimerText}</p>
          </div>
        )
      )}
    </div>
  );
}
