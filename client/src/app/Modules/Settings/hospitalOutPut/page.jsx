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
import hospitalOutputSettingService from "@/services/hospitalOutputSetting.service";
import HospitalHeader from "@/components/hospital/HospitalHeader";
import HospitalFooter from "@/components/hospital/HospitalFooter";
import { getImageUrl } from "@/lib/utils";

export default function HospitalOutputSettingPage() {
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
    showFooter: true,
    showFooterImage: false,
    footerImage: "",
    showLegalDisclaimer: true,
    legalDisclaimerText: "Thank you for choosing our services",
    footerHeightMargin: 0,
    textFont: "Inter",
    textSize: 12,
    reportFormat: "A4",
  });

  const headerFileRef = useRef(null);
  const footerFileRef = useRef(null);
  const previewPrintRef = useRef(null);

  const handlePrintPreview = useReactToPrint({
    contentRef: previewPrintRef,
    documentTitle: "Hospital_Print_Preview",
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
    setLoading(true);
    try {
      const res = await hospitalOutputSettingService.get();
      if (res.data) {
        setFormData({
          headerFooterByDefault: res.data.headerFooterByDefault ?? true,
          showHeader: res.data.showHeader ?? true,
          headerImage: res.data.headerImage || "",
          showQrCode: res.data.showQrCode ?? true,
          headerHeightMargin: res.data.headerHeightMargin || 0,
          showFooter: res.data.showFooter ?? true,
          showFooterImage: res.data.showFooterImage ?? false,
          footerImage: res.data.footerImage || "",
          showLegalDisclaimer: res.data.showLegalDisclaimer ?? true,
          legalDisclaimerText: res.data.legalDisclaimerText || "Thank you for choosing our services",
          footerHeightMargin: res.data.footerHeightMargin || 0,
          textFont: res.data.textFont || "Inter",
          textSize: res.data.textSize || 12,
          reportFormat: res.data.reportFormat || "A4",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load hospital output settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field, checked) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);
    data.append("type", type);

    if (type === "header") setUploadingHeader(true);
    else setUploadingFooter(true);

    try {
      const res = await hospitalOutputSettingService.uploadImage(data);
      if (res.data && res.data.url) {
        setFormData((prev) => ({
          ...prev,
          [type === "header" ? "headerImage" : "footerImage"]: res.data.url,
          [type === "header" ? "showHeader" : "showFooterImage"]: true,
        }));
        setMessage({
          type: "success",
          text: `${type === "header" ? "Header" : "Footer"} image uploaded successfully!`,
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: `Failed to upload ${type} image`,
      });
    } finally {
      if (type === "header") setUploadingHeader(false);
      else setUploadingFooter(false);
    }
  };

  const handleRemoveImage = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type === "header" ? "headerImage" : "footerImage"]: "",
      ...(type === "footer" ? { showFooterImage: false } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hospitalOutputSettingService.update(formData);
      setMessage({ type: "success", text: "Hospital output settings updated successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save hospital output settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm font-medium">Loading Hospital Output Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Hospital Print Output Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure header, footer, letterhead, logos, and page layouts for non-laboratory invoices and report printouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintPreview}>
            <Printer className="mr-2 h-4 w-4" /> Print Sample Test Page
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : ""}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription className="font-medium">{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Main Settings Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Settings Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 space-y-6">
          {/* Header & Banner Settings Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Header & Letterhead Banner
              </CardTitle>
              <CardDescription>
                Customize top letterhead banner image, hospital name, address, and QR code verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Display Header</Label>
                  <p className="text-xs text-muted-foreground">Show hospital logo/header banner on invoices & reports</p>
                </div>
                <Switch checked={formData.showHeader} onCheckedChange={(val) => handleToggle("showHeader", val)} />
              </div>

              <Separator />

              {/* Upload Custom Header Image */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Custom Header Image (Left 50% Banner)</Label>
                <input
                  type="file"
                  ref={headerFileRef}
                  onChange={(e) => handleImageUpload(e, "header")}
                  accept="image/*"
                  className="hidden"
                />
                {formData.headerImage ? (
                  <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                    <div className="relative h-20 w-full overflow-hidden rounded border bg-white flex items-center justify-center">
                      <img
                        src={getImageUrl(formData.headerImage)}
                        alt="Header"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => headerFileRef.current?.click()} disabled={uploadingHeader}>
                        {uploadingHeader ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                        Change Header Image
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveImage("header")}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => headerFileRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/40 cursor-pointer transition-colors space-y-2"
                  >
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground">Click to upload header image (JPG, PNG, WebP max 5MB)</p>
                    <Button type="button" variant="outline" size="sm" disabled={uploadingHeader}>
                      {uploadingHeader ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload Header Image
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Show QR Code Verification</Label>
                  <p className="text-xs text-muted-foreground">Renders scannable verification QR code on top right</p>
                </div>
                <Switch checked={formData.showQrCode} onCheckedChange={(val) => handleToggle("showQrCode", val)} />
              </div>
            </CardContent>
          </Card>

          {/* Footer Settings Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Footer Banner & Disclaimer
              </CardTitle>
              <CardDescription>
                Configure custom full-width footer image banner or legal disclaimer text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Display Footer</Label>
                  <p className="text-xs text-muted-foreground">Enable or disable footer block on printouts</p>
                </div>
                <Switch checked={formData.showFooter} onCheckedChange={(val) => handleToggle("showFooter", val)} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Show Footer Image (100% Full Width)</Label>
                  <p className="text-xs text-muted-foreground">Display custom full-width banner image at page bottom</p>
                </div>
                <Switch checked={formData.showFooterImage} onCheckedChange={(val) => handleToggle("showFooterImage", val)} />
              </div>

              {/* Upload Custom Footer Image */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Custom Footer Image</Label>
                <input
                  type="file"
                  ref={footerFileRef}
                  onChange={(e) => handleImageUpload(e, "footer")}
                  accept="image/*"
                  className="hidden"
                />
                {formData.footerImage ? (
                  <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                    <div className="relative h-16 w-full overflow-hidden rounded border bg-white flex items-center justify-center">
                      <img
                        src={getImageUrl(formData.footerImage)}
                        alt="Footer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => footerFileRef.current?.click()} disabled={uploadingFooter}>
                        {uploadingFooter ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                        Change Footer Image
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleRemoveImage("footer")}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => footerFileRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/40 cursor-pointer transition-colors space-y-2"
                  >
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/60" />
                    <p className="text-xs text-muted-foreground">Click to upload full-width footer image</p>
                    <Button type="button" variant="outline" size="sm" disabled={uploadingFooter}>
                      {uploadingFooter ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload Footer Image
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Show Legal Disclaimer Text</Label>
                  <p className="text-xs text-muted-foreground">Hidden automatically if footer image toggle is enabled</p>
                </div>
                <Switch checked={formData.showLegalDisclaimer} onCheckedChange={(val) => handleToggle("showLegalDisclaimer", val)} />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Disclaimer / Thank You Text</Label>
                <Input
                  value={formData.legalDisclaimerText}
                  onChange={(e) => handleChange("legalDisclaimerText", e.target.value)}
                  placeholder="Thank you for choosing our services"
                />
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Right Side: Live A4 Print Preview Box */}
        <div className="lg:col-span-6 space-y-3 sticky top-6">
          <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-xs">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" /> Live A4 Print Setup Preview
            </span>
            <Badge variant="outline" className="text-[10px]">A4 Format</Badge>
          </div>

          <div className="border shadow-lg rounded-lg bg-white p-6 overflow-hidden min-h-[640px] flex flex-col justify-between" ref={previewPrintRef}>
            <div>
              <HospitalHeader
                settings={formData}
                hospitalProfile={{
                  name: "MUSA MEMORIAL HOSPITAL",
                  address: "Near Daewoo Terminal, Main City Road, Bhakkar",
                  phone: "0453-510319 / 0333-8908071",
                  email: "info@musahospital.com",
                }}
                title="INVOICE"
                qrData="INV-0826-001|MRN-0726-001"
              />

              {/* Sample Document Body with padding */}
              <div className="space-y-4 py-4 my-2">
                <div className="grid grid-cols-2 gap-2 text-xs border p-3 rounded-lg bg-slate-50">
                  <div><span className="font-semibold text-slate-600">Invoice No:</span> INV-0826-043</div>
                  <div><span className="font-semibold text-slate-600">Date:</span> 13/08/2026</div>
                  <div><span className="font-semibold text-slate-600">Patient:</span> Azeem Khan (MRN-26-00008)</div>
                  <div><span className="font-semibold text-slate-600">Status:</span> <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px]">Paid</span></div>
                </div>

                <div className="border rounded-lg overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-700 text-white font-semibold">
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Service Name</th>
                        <th className="p-2.5 text-right">Qty</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-white">
                        <td className="p-2.5">1</td>
                        <td className="p-2.5 font-mono">1233</td>
                        <td className="p-2.5 font-medium">Lipid Profile</td>
                        <td className="p-2.5 text-right">1</td>
                        <td className="p-2.5 text-right font-semibold">1,200.00</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5">2</td>
                        <td className="p-2.5 font-mono">1213</td>
                        <td className="p-2.5 font-medium">BSR Fasting</td>
                        <td className="p-2.5 text-right">1</td>
                        <td className="p-2.5 text-right font-semibold">200.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end text-xs pt-2">
                  <div className="w-52 space-y-1.5 text-right">
                    <div className="flex justify-between text-slate-600"><span>SubTotal:</span> <span>1,400.00</span></div>
                    <div className="flex justify-between text-slate-600"><span>Discount:</span> <span>-0.00</span></div>
                    <div className="flex justify-between font-bold text-sm border-t border-slate-900 pt-1.5 text-slate-900"><span>Total:</span> <span>Rs. 1,400.00</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Footer Preview Pinned at Bottom */}
            <HospitalFooter
              settings={formData}
              hospitalProfile={{
                name: "MUSA MEMORIAL HOSPITAL",
                address: "Near Daewoo Terminal, Main City Road, Bhakkar",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
