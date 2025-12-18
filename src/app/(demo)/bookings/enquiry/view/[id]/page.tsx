"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/utils/Loader"; // Optional: if you have a loader

interface EnquiryDetails {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  scope_of_work: string | null;
  existing_drawing: boolean;
  plan_images: string | null; // JSON string like "[]" or '["url1","url2"]'
  estimated_budget_range: string | null;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminEnquiryDetailsPage() {
  const { id } = useParams() as { id: string };

  const [enquiry, setEnquiry] = useState<EnquiryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEnquiry = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await apiClient.get(`/booking/V1/get-enquiry-booking-by-id/${id}`);
        const data = res.data?.data;

        if (!data) throw new Error("No data returned");

        setEnquiry({
          id: data.id,
          fullname: data.fullname || "N/A",
          email: data.email || "N/A",
          mobile: data.mobile || "N/A",
          scope_of_work: data.scope_of_work || null,
          existing_drawing: data.existing_drawing || false,
          plan_images: data.plan_images,
          estimated_budget_range: data.estimated_budget_range || null,
          description: data.description || "No description provided",
          status: data.status === "pending"
            ? "Pending"
            : data.status === "under-review"
            ? "Under Review"
            : data.status === "in-progress"
            ? "In Progress"
            : data.status === "completed"
            ? "Completed"
            : "Pending",
          createdAt: data.createdAt,
        });
      } catch (err) {
        console.error("Failed to fetch enquiry:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [id]);

  if (loading) {
    return (
      <ContentLayout title="Enquiry Details">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </ContentLayout>
    );
  }

  if (error || !enquiry) {
    return (
      <ContentLayout title="Enquiry Details">
        <div className="bg-white border p-6 rounded-xl shadow-sm text-center text-red-600">
          <p>Failed to load enquiry details. Please try again.</p>
        </div>
      </ContentLayout>
    );
  }

  // Parse plan_images if it's a JSON string
  let planImageUrls: string[] = [];
  if (enquiry.plan_images && enquiry.plan_images !== "[]") {
    try {
      planImageUrls = JSON.parse(enquiry.plan_images);
    } catch (e) {
      console.error("Failed to parse plan_images:", e);
    }
  }

  return (
    <ContentLayout title={`Enquiry #${enquiry.id.slice(0, 8)}...`}>
      <div className="bg-white border p-6 rounded-xl shadow-sm space-y-6 text-sm">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Enquiry Details</h3>
            <p className="text-xs text-gray-500">
              Submitted on {new Date(enquiry.createdAt).toLocaleDateString("en-GB")} at{" "}
              {new Date(enquiry.createdAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge
            variant={
              enquiry.status === "Pending"
                ? "secondary"
                : enquiry.status === "Under Review"
                ? "outline"
                : enquiry.status === "In Progress"
                ? "default"
                : "destructive"
            }
          >
            {enquiry.status}
          </Badge>
        </div>

        {/* GRID FIELDS */}
        <div className="grid md:grid-cols-2 gap-4">
          <ReadOnlyField label="Full Name" value={enquiry.fullname} />
          <ReadOnlyField label="Email" value={enquiry.email} />
          <ReadOnlyField label="Mobile" value={enquiry.mobile} />
          <ReadOnlyField label="Scope of Work" value={enquiry.scope_of_work || "Not specified"} />
          <ReadOnlyField label="Budget Range" value={enquiry.estimated_budget_range || "Not specified"} />
          <ReadOnlyField
            label="Has Existing Drawings"
            value={enquiry.existing_drawing ? "Yes" : "No"}
          />
        </div>

        {/* PLAN IMAGES */}
        <div>
          <label className="text-sm font-medium">Plan Images / Drawings</label>
          {planImageUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              {planImageUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={url}
                    alt={`Plan ${idx + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <p className="text-center text-xs p-2 bg-gray-50">View Image {idx + 1}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">No images uploaded</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            disabled
            value={enquiry.description}
            className="w-full border p-3 rounded-lg text-sm bg-gray-100 min-h-[120px] mt-1"
          />
        </div>
      </div>
    </ContentLayout>
  );
}

/* COMPONENT */
function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        disabled
        value={value}
        className="w-full border p-3 rounded-lg text-sm bg-gray-100"
      />
    </div>
  );
}