"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hospitalProfileSchema } from "@/lib/zodeSchema";
import hospitalProfileService from "@/services/hospitalProfile.service";
import { Loader2, Save, Upload, Building2 } from "lucide-react";

export default function HospitalProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hospitalProfileSchema),
    defaultValues: {
      hospital_name: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      registration_number: "",
      tax_number: "",
      contact_person: "",
      contact_person_phone: "",
      footer_text: "",
      terms_conditions: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await hospitalProfileService.get();
      if (res.data) {
        setHasProfile(true);
        reset({
          hospital_name: res.data.hospital_name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          website: res.data.website || "",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "",
          postal_code: res.data.postal_code || "",
          registration_number: res.data.registration_number || "",
          tax_number: res.data.tax_number || "",
          contact_person: res.data.contact_person || "",
          contact_person_phone: res.data.contact_person_phone || "",
          footer_text: res.data.footer_text || "",
          terms_conditions: res.data.terms_conditions || "",
        });
        if (res.data.logo) {
          setLogoPreview(
            `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/storage/${res.data.logo}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
      if (logoFile) {
        payload.append("logo", logoFile);
      } else {
        payload.delete("logo");
      }

      if (hasProfile) {
        await hospitalProfileService.update(payload);
      } else {
        await hospitalProfileService.create(payload);
        setHasProfile(true);
      }

      setMessage({ type: "success", text: "Hospital profile saved successfully" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hospital Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your hospital information and settings
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Logo Section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Hospital Logo</h2>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  width={96}
                  height={96}
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  Choose Logo
                </div>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospital_name">Hospital Name *</Label>
              <Input
                id="hospital_name"
                {...register("hospital_name")}
                placeholder="Enter hospital name"
              />
              {errors.hospital_name && (
                <p className="text-sm text-destructive">{errors.hospital_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="hospital@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+92 123 4567 890"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Enter full address"
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} placeholder="City" />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} placeholder="State" />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} placeholder="Country" />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input id="postal_code" {...register("postal_code")} placeholder="Postal code" />
                {errors.postal_code && (
                  <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                {...register("registration_number")}
                placeholder="Registration number"
              />
              {errors.registration_number && (
                <p className="text-sm text-destructive">{errors.registration_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_number">Tax Number</Label>
              <Input
                id="tax_number"
                {...register("tax_number")}
                placeholder="Tax number"
              />
              {errors.tax_number && (
                <p className="text-sm text-destructive">{errors.tax_number.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Person</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                {...register("contact_person")}
                placeholder="Contact person name"
              />
              {errors.contact_person && (
                <p className="text-sm text-destructive">{errors.contact_person.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person_phone">Contact Phone</Label>
              <Input
                id="contact_person_phone"
                {...register("contact_person_phone")}
                placeholder="Contact person phone"
              />
              {errors.contact_person_phone && (
                <p className="text-sm text-destructive">{errors.contact_person_phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer & Terms */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Footer & Terms</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footer_text">Footer Text</Label>
              <Textarea
                id="footer_text"
                {...register("footer_text")}
                placeholder="Text to display on receipts/invoices"
                rows={2}
              />
              {errors.footer_text && (
                <p className="text-sm text-destructive">{errors.footer_text.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_conditions">Terms & Conditions</Label>
              <Textarea
                id="terms_conditions"
                {...register("terms_conditions")}
                placeholder="Terms and conditions text"
                rows={4}
              />
              {errors.terms_conditions && (
                <p className="text-sm text-destructive">{errors.terms_conditions.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="px-6">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
