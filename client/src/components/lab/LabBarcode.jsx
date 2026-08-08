import React from "react";
import Barcode from "react-barcode";

const defaultProps = {
  width: 1.5,
  height: 40,
  format: "CODE128",
  displayValue: true,
  fontSize: 12,
  margin: 5,
  textAlign: "center",
  textMargin: 2,
  background: "#ffffff",
  lineColor: "#000000",
};

export default function LabBarcode({
  value,
  width,
  height,
  format,
  displayValue,
  fontSize,
  margin,
  showText = true,
  className = "",
}) {
  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <Barcode
        value={value}
        width={width || defaultProps.width}
        height={height || defaultProps.height}
        format={format || defaultProps.format}
        displayValue={displayValue !== undefined ? displayValue : defaultProps.displayValue}
        fontSize={fontSize || defaultProps.fontSize}
        margin={margin || defaultProps.margin}
        textAlign={defaultProps.textAlign}
        textMargin={defaultProps.textMargin}
        background={defaultProps.background}
        lineColor={defaultProps.lineColor}
      />
    </div>
  );
}
