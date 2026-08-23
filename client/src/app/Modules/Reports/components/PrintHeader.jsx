import React from "react";
import { getImageUrl } from "@/lib/utils";

export default function PrintHeader({ hospitalProfile }) {
  const logoUrl = getImageUrl(hospitalProfile?.logo || hospitalProfile?.logo_url);

  return (
    <div className="text-center mb-2">
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Hospital Logo"
          className="mx-auto mb-1 max-h-[60px] object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <h2 className="text-sm font-bold">{hospitalProfile?.hospitalName || hospitalProfile?.hospital_name || hospitalProfile?.name || "Hospital Name"}</h2>
      <p className="text-xs">{hospitalProfile?.address || ""}</p>
      <p className="text-xs">{hospitalProfile?.phone || ""}</p>
      {hospitalProfile?.website && <p className="text-xs">{hospitalProfile.website}</p>}
    </div>
  );
}
