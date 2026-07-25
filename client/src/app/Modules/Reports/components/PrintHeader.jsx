import React from "react";
import Image from "next/image";

export default function PrintHeader({ hospitalProfile }) {
  return (
    <div className="text-center mb-2">
      {hospitalProfile?.logo && (
        <Image
          src={hospitalProfile.logo}
          alt="Hospital Logo"
          className="mx-auto mb-1"
          style={{ maxHeight: "60px" }}
        />
      )}
      <h2 className="text-sm font-bold">{hospitalProfile?.hospitalName || "Hospital Name"}</h2>
      <p className="text-xs">{hospitalProfile?.address || ""}</p>
      <p className="text-xs">{hospitalProfile?.phone || ""}</p>
      {hospitalProfile?.website && <p className="text-xs">{hospitalProfile.website}</p>}
    </div>
  );
}
