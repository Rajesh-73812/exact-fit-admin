"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/utils/Loader";
import apiClient from "@/lib/apiClient";

interface FormData {
  supportMobileNumber: string;
  supportEmail: string;
  contactUsEmail: string;
  contactUsNumber: string;
  websiteAddress: string;
  address: string;
}

type AddressSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function SettingsForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    supportMobileNumber: "",
    supportEmail: "",
    contactUsEmail: "",
    contactUsNumber: "",
    websiteAddress: "",
    address: "",
  });
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  // ======================
  // LOAD EXISTING SETTINGS
  // ======================
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get("/settings/V1/get-settings");
        const settings = data?.data || {};

        setSettingsId(settings.id ?? null);

        setFormData({
          supportMobileNumber: (settings.support_mobile_number || "")
            .toString()
            .replace(/^\+/, "")
            .trim(),
          supportEmail: settings.support_email || "",
          contactUsEmail: settings.contact_us_email || "",
          contactUsNumber: (settings.contact_us_number || "")
            .toString()
            .replace(/^\+/, "")
            .trim(),
          websiteAddress: settings.website_address || "",
          address: settings.address || "",
        });
      } catch (err) {
        alert("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ======================
  // ADDRESS SUGGESTIONS (OSM / NOMINATIM)
  // ======================
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      setAddressSearchLoading(true);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`;

      const res = await fetch(url, {
        headers: {
          "Accept-Language": "en",
        },
      });

      if (!res.ok) {
        setAddressSuggestions([]);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        setAddressSuggestions([]);
        return;
      }

      const mapped: AddressSuggestion[] = data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }));

      setAddressSuggestions(mapped);
    } catch (err) {
      console.error("Address search failed", err);
      setAddressSuggestions([]);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  // ======================
  // SUBMIT FORM
  // ======================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.supportMobileNumber)
      newErrors.supportMobileNumber = "Support mobile number is required";

    if (
      !formData.supportEmail ||
      !/\S+@\S+\.\S+/.test(formData.supportEmail)
    )
      newErrors.supportEmail = "Invalid email";

    if (
      !formData.contactUsEmail ||
      !/\S+@\S+\.\S+/.test(formData.contactUsEmail)
    )
      newErrors.contactUsEmail = "Invalid email";

    if (!formData.contactUsNumber)
      newErrors.contactUsNumber = "Contact us number is required";

    if (
      !formData.websiteAddress ||
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.websiteAddress
      )
    )
      newErrors.websiteAddress = "Invalid URL";

    if (!formData.address) newErrors.address = "Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const payload = {
        id: settingsId ?? undefined,
        support_mobile_number: formData.supportMobileNumber
          .toString()
          .replace(/^\+/, "")
          .replace(/\s+/g, "")
          .trim(),
        support_email: formData.supportEmail.trim(),
        contact_us_email: formData.contactUsEmail.trim(),
        contact_us_number: formData.contactUsNumber
          .toString()
          .replace(/^\+/, "")
          .replace(/\s+/g, "")
          .trim(),
        website_address: formData.websiteAddress.trim(),
        address: formData.address.trim(),
      };

      await apiClient.post("/settings/V1/upsert-settings", payload);

      alert("Settings updated successfully");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI RENDER
  // ======================
  return (
    <ContentLayout title="Settings">
      {loading && <Loader />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 w-full"
        >
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full">
            {/* Support Mobile Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-5 h-5" /> Support Mobile Number{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.supportMobileNumber}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setFormData({
                    ...formData,
                    supportMobileNumber: onlyDigits.slice(0, 9),
                  });
                }}
                maxLength={9}
                inputMode="numeric"
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />
              {errors.supportMobileNumber && (
                <p className="text-sm text-destructive">
                  {errors.supportMobileNumber}
                </p>
              )}
            </div>

            {/* Support Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-5 h-5" /> Support Email{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />
              {errors.supportEmail && (
                <p className="text-sm text-destructive">
                  {errors.supportEmail}
                </p>
              )}
            </div>

            {/* Contact Us Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-5 h-5" /> Contact Us Email{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={formData.contactUsEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactUsEmail: e.target.value })
                }
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />
              {errors.contactUsEmail && (
                <p className="text-sm text-destructive">
                  {errors.contactUsEmail}
                </p>
              )}
            </div>

            {/* Contact Us Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-5 h-5" /> Contact Us Number{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.contactUsNumber}
                onChange={(e) => {
                  const onlyDigits = e.target.value.replace(/\D/g, "");
                  setFormData({
                    ...formData,
                    contactUsNumber: onlyDigits.slice(0, 9),
                  });
                }}
                maxLength={9}
                inputMode="numeric"
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />
              {errors.contactUsNumber && (
                <p className="text-sm text-destructive">
                  {errors.contactUsNumber}
                </p>
              )}
            </div>

            {/* Website Address */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-5 h-5" /> Website Address{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="url"
                value={formData.websiteAddress}
                onChange={(e) =>
                  setFormData({ ...formData, websiteAddress: e.target.value })
                }
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />
              {errors.websiteAddress && (
                <p className="text-sm text-destructive">
                  {errors.websiteAddress}
                </p>
              )}
            </div>

            {/* Address with search + suggestions */}
            <div className="space-y-2 relative">
              <Label className="flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Address{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Input
                type="text"
                value={formData.address}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, address: value });

                  if (value.length >= 3) {
                    fetchAddressSuggestions(value);
                  } else {
                    setAddressSuggestions([]);
                  }
                }}
                placeholder="Search address..."
                className="text-primary border-primary/30 focus-visible:ring-primary w-full"
              />

              {addressSearchLoading && (
                <p className="text-xs text-gray-500 mt-1">Searching...</p>
              )}

              {addressSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white text-sm shadow-md">
                  {addressSuggestions.map((s) => (
                    <li
                      key={`${s.lat}-${s.lon}-${s.display_name}`}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setFormData({ ...formData, address: s.display_name });
                        setAddressSuggestions([]);
                      }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}

              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Update Settings"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}
