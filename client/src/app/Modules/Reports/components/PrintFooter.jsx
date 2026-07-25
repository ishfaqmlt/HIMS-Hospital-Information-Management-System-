import React from "react";

export default function PrintFooter({ showSignature = false }) {
  return (
    <div className="mt-4 text-xs">
      <div className="flex justify-between mt-4">
        {showSignature && (
          <div className="text-center">
            <div className="border-t border-black w-32 mt-8"></div>
            <p>Patient Signature</p>
          </div>
        )}
        <div className="text-center">
          <div className="border-t border-black w-32 mt-8"></div>
          <p>Authorized Signature</p>
        </div>
      </div>
      <p className="text-center mt-4 text-muted-foreground">Thank you for choosing our services</p>
    </div>
  );
}
