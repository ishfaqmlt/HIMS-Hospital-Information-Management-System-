"use client";

import React, { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Loader2,
  Save,
  Printer,
  Settings,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import labOutputSettingService from "@/services/labOutputSetting.service";
import LabHeader from "@/components/lab/LabHeader";
import LabFooter from "@/components/lab/LabFooter";
import LabTestBarcodeStamp from "@/components/lab/LabTestBarcodeStamp";
import { getImageUrl } from "@/lib/utils";

export default function LabOutputSettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    headerFooterByDefault: true,
    showHeader: true,
    headerImage: "",
    showQrCode: true,
    headerHeightMargin: 0,
    showFooterImage: false,
    footerImage: "",
    showLegalDisclaimer: true,
    legalDisclaimerText: "NOT VALID FOR ANY COURT OF LAW",
    showDoctorSignatures: true,
    footerHeightMargin: 0,
    textFont: "Inter",
    textSize: 12,
    reportFormat: "A4",
    printBgLogo: false,
    bgLogoImage: "",
    approvalByAuthority: true,
    showBarcodeOnReport: true,
    showApprovedAtOnReport: true,
    showReceivedAtOnReport: true,
    showReportedAtOnReport: true,
  });

  const headerFileRef = useRef(null);
  const footerFileRef = useRef(null);
  const previewPrintRef = useRef(null);

  const handlePrintPreview = useReactToPrint({
    contentRef: previewPrintRef,
    documentTitle: "Lab_Report_Preview",
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await labOutputSettingService.get();
      if (res.data) {
        setFormData({
          headerFooterByDefault: res.data.headerFooterByDefault ?? true,
          showHeader: res.data.showHeader ?? true,
          headerImage: res.data.headerImage || "",
          showQrCode: res.data.showQrCode ?? true,
          headerHeightMargin: res.data.headerHeightMargin || 0,
          showFooterImage: res.data.showFooterImage ?? false,
          footerImage: res.data.footerImage || "",
          showLegalDisclaimer: res.data.showLegalDisclaimer ?? true,
          legalDisclaimerText: res.data.legalDisclaimerText || "NOT VALID FOR ANY COURT OF LAW",
          showDoctorSignatures: res.data.showDoctorSignatures ?? true,
          footerHeightMargin: res.data.footerHeightMargin || 0,
          textFont: res.data.textFont || "Inter",
          textSize: res.data.textSize || 12,
          reportFormat: res.data.reportFormat || "A4",
          printBgLogo: res.data.printBgLogo ?? false,
          bgLogoImage: res.data.bgLogoImage || "",
          approvalByAuthority: res.data.approvalByAuthority ?? true,
          showBarcodeOnReport: res.data.showBarcodeOnReport ?? true,
          showApprovedAtOnReport: res.data.showApprovedAtOnReport ?? true,
          showReceivedAtOnReport: res.data.showReceivedAtOnReport ?? true,
          showReportedAtOnReport: res.data.showReportedAtOnReport ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load lab output settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);
    data.append("type", type);

    try {
      if (type === "header") setUploadingHeader(true);
      if (type === "footer") setUploadingFooter(true);

      const res = await labOutputSettingService.uploadImage(data);
      const url = res.data?.url;

      if (type === "header") {
        setFormData((prev) => ({ ...prev, headerImage: url }));
      } else {
        setFormData((prev) => ({ ...prev, footerImage: url, showFooterImage: true }));
      }

      setMessage({
        type: "success",
        text: `${type.toUpperCase()} image uploaded and saved successfully.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: `Failed to upload ${type} image.` });
    } finally {
      if (type === "header") setUploadingHeader(false);
      if (type === "footer") setUploadingFooter(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await labOutputSettingService.update(formData);
      setMessage({ type: "success", text: "Lab output settings saved successfully." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save lab output settings." });
    } finally {
      setSaving(false);
    }
  };

  // Sample Data for Live Report Preview
  const sampleCaseData = {
    caseNo: "65,075",
    created_at: "2026-08-12T17:41:00",
    updated_at: "2026-08-12T18:07:00",
    orReffBy: "Dr. Zahida Qayyum Malik",
    patient_name: "Qurat Ul Ain",
    patient_mrn: "B7,935",
    patient_mobile: "0337-7152320",
    patient: {
      pName: "Qurat Ul Ain",
      mrn: "B7,935",
      mobile: "0337-7152320",
      guardianName: "Ahmad",
      address: "36 Tda",
      gender: "Female",
      age: 21,
      cnic: "-",
    },
    doctor: {
      Name: "Dr. Zahida Qayyum Malik",
    },
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-4">
      {/* Top Header Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-sky-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-700" />
                Lab Output Settings & Report Template
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Upload custom header & footer images, configure QR codes, barcode stamps, fonts, and legal disclaimers.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-sky-700 text-sky-700 hover:bg-sky-50"
                onClick={handlePrintPreview}
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" /> Test Print
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-sky-700 hover:bg-sky-800 text-white font-medium"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {message && (
        <Alert variant={message.type === "success" ? "success" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-700" />
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Settings Controls Column — 5 Cols */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <Card className="shadow-sm border">
              <CardHeader className="px-4 py-3 bg-sky-50 border-b">
                <CardTitle className="text-xs font-bold text-sky-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="h-4 w-4" /> Output Preferences Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Header Image & Letterhead Controls */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sky-900 text-[11px] uppercase tracking-wide">
                    Header Image & Letterhead
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Header</Label>
                    <Switch
                      checked={formData.showHeader}
                      onCheckedChange={(val) => handleToggle("showHeader", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show QR Code Verification</Label>
                    <Switch
                      checked={formData.showQrCode}
                      onCheckedChange={(val) => handleToggle("showQrCode", val)}
                    />
                  </div>

                  {/* Header Image Upload Control */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" /> Upload Header Image / Banner
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={headerFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "header")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex-1 border-slate-300"
                        onClick={() => headerFileRef.current?.click()}
                        disabled={uploadingHeader}
                      >
                        {uploadingHeader ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5 mr-1.5 text-sky-700" />
                        )}
                        Choose Header Image...
                      </Button>
                      {formData.headerImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => setFormData((prev) => ({ ...prev, headerImage: "" }))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    {formData.headerImage && (
                      <div className="mt-1.5 p-1 border rounded bg-slate-50 flex items-center gap-2">
                        <img
                          src={getImageUrl(formData.headerImage)}
                          alt="Header Preview"
                          className="h-10 w-auto object-contain rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="text-[10px] text-slate-600 truncate flex-1">
                          {formData.headerImage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Footer Image & Signature Controls */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sky-900 text-[11px] uppercase tracking-wide">
                    Footer Image & Signatures
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Footer Image</Label>
                    <Switch
                      checked={formData.showFooterImage}
                      onCheckedChange={(val) => handleToggle("showFooterImage", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Doctor Signatures Grid</Label>
                    <Switch
                      checked={formData.showDoctorSignatures}
                      onCheckedChange={(val) => handleToggle("showDoctorSignatures", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Legal Disclaimer Banner</Label>
                    <Switch
                      checked={formData.showLegalDisclaimer}
                      onCheckedChange={(val) => handleToggle("showLegalDisclaimer", val)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">
                      Legal Disclaimer Text
                    </Label>
                    <Input
                      value={formData.legalDisclaimerText}
                      onChange={(e) => handleChange("legalDisclaimerText", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Footer Image Upload Control */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" /> Upload Footer Image / Banner
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={footerFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "footer")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex-1 border-slate-300"
                        onClick={() => footerFileRef.current?.click()}
                        disabled={uploadingFooter}
                      >
                        {uploadingFooter ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5 mr-1.5 text-sky-700" />
                        )}
                        Choose Footer Image...
                      </Button>
                      {formData.footerImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              footerImage: "",
                              showFooterImage: false,
                            }))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    {formData.footerImage && (
                      <div className="mt-1.5 p-1 border rounded bg-slate-50 flex items-center gap-2">
                        <img
                          src={getImageUrl(formData.footerImage)}
                          alt="Footer Preview"
                          className="h-10 w-auto object-contain rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="text-[10px] text-slate-600 truncate flex-1">
                          {formData.footerImage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Barcode & Verification Stamp Controls */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sky-900 text-[11px] uppercase tracking-wide">
                    Barcode & Timestamps
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Barcode on Report</Label>
                    <Switch
                      checked={formData.showBarcodeOnReport}
                      onCheckedChange={(val) => handleToggle("showBarcodeOnReport", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Approved At Timestamp</Label>
                    <Switch
                      checked={formData.showApprovedAtOnReport}
                      onCheckedChange={(val) => handleToggle("showApprovedAtOnReport", val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Received At Timestamp</Label>
                    <Switch
                      checked={formData.showReceivedAtOnReport}
                      onCheckedChange={(val) => handleToggle("showReceivedAtOnReport", val)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Format & Typography Controls */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sky-900 text-[11px] uppercase tracking-wide">
                    Format & Typography
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Report Format</Label>
                      <Select
                        value={formData.reportFormat}
                        onValueChange={(val) => handleChange("reportFormat", val)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4 Standard</SelectItem>
                          <SelectItem value="A5">A5 Compact</SelectItem>
                          <SelectItem value="Thermal">Thermal 80mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Text Font</Label>
                      <Select
                        value={formData.textFont}
                        onValueChange={(val) => handleChange("textFont", val)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Report Preview Container — 7 Cols */}
          <div className="col-span-12 lg:col-span-7">
            <Card className="shadow-sm border overflow-hidden">
              <CardHeader className="px-4 py-3 bg-sky-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold text-sky-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Eye className="h-4 w-4" /> Live Real-Time Print Report Preview
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-white border-sky-300 text-sky-800">
                  Format: {formData.reportFormat}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 bg-slate-100 overflow-auto max-h-[78vh]">
                {/* Print Paper Preview Frame */}
                <Card
                  ref={previewPrintRef}
                  className="bg-white p-6 shadow-md border rounded mx-auto text-black font-sans space-y-4 max-w-[210mm]"
                  style={{ fontFamily: formData.textFont }}
                >
                  {/* Reusable Lab Header */}
                  <LabHeader caseData={sampleCaseData} settings={formData} />

                  {/* Sample Test 1: BIOCHEMISTRY */}
                  <div className="pt-2">
                    <LabTestBarcodeStamp
                      testName="BIOCHEMISTRY"
                      caseNo="65,075"
                      testId="3333-09-07"
                      approvedAt="2026-08-12T18:07:00"
                      settings={formData}
                    />
                    <Table className="border text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-100 h-7">
                          <TableHead className="font-bold text-black text-xs">TEST NAME</TableHead>
                          <TableHead className="font-bold text-black text-xs">RESULT</TableHead>
                          <TableHead className="font-bold text-black text-xs">UNITS</TableHead>
                          <TableHead className="font-bold text-black text-xs">NORMAL RANGE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-medium">Glucose (Random)</TableCell>
                          <TableCell className="font-bold">74</TableCell>
                          <TableCell>mg/dl</TableCell>
                          <TableCell>60---140</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Sample Test 2: BLOOD GROUP */}
                  <div>
                    <LabTestBarcodeStamp
                      testName="BLOOD GROUP"
                      caseNo="65,075"
                      testId="3333-09-08"
                      approvedAt="2026-08-12T18:07:00"
                      settings={formData}
                    />
                    <Table className="border text-xs">
                      <TableBody>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-medium w-1/3">Blood Group</TableCell>
                          <TableCell className="font-bold">&quot;B&quot;</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-medium">Rh. Type</TableCell>
                          <TableCell className="font-bold">Positive</TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Sample Test 3: HAEMATOLOGY (CBC / DLC) */}
                  <div>
                    <LabTestBarcodeStamp
                      testName="HAEMATOLOGY"
                      caseNo="65,075"
                      testId="3333-09-09"
                      approvedAt="2026-08-12T18:07:00"
                      settings={formData}
                    />
                    <Table className="border text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-100 h-7">
                          <TableHead className="font-bold text-black text-xs">TEST NAME</TableHead>
                          <TableHead className="font-bold text-black text-xs">RESULT</TableHead>
                          <TableHead className="font-bold text-black text-xs">UNITS</TableHead>
                          <TableHead className="font-bold text-black text-xs">NORMAL RANGE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-bold">WBC</TableCell>
                          <TableCell className="font-bold">8.4</TableCell>
                          <TableCell>x10^3/ul</TableCell>
                          <TableCell>4.0---11.0</TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b bg-gray-50/50">
                          <TableCell colSpan={4} className="font-bold text-sky-900 text-xs">
                            DLC
                          </TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b">
                          <TableCell className="pl-6">Neutrophils</TableCell>
                          <TableCell className="font-bold">62</TableCell>
                          <TableCell>%</TableCell>
                          <TableCell>44---70</TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b">
                          <TableCell className="pl-6">Lymphocytes</TableCell>
                          <TableCell className="font-bold">33</TableCell>
                          <TableCell>%</TableCell>
                          <TableCell>22---44</TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-bold">HB</TableCell>
                          <TableCell className="font-bold text-red-700">8.5</TableCell>
                          <TableCell>G/dl</TableCell>
                          <TableCell>Male = 13.5---17.5 | Female = 12.0---16.0</TableCell>
                        </TableRow>
                        <TableRow className="h-7 border-b">
                          <TableCell className="font-bold">PLATLETS</TableCell>
                          <TableCell className="font-bold">309</TableCell>
                          <TableCell>x10^3/ul</TableCell>
                          <TableCell>150---450</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Reusable Lab Footer */}
                  <LabFooter settings={formData} />
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
