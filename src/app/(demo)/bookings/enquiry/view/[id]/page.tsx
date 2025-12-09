"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";

// MOCK DATA (replace with API call)
const enquiry = {
  id: 1,
  fullName: "Akhil",
  email: "akhil@gmail.com",
  countryCode: "+971",
  mobile: "999888777",
  emirate: "Dubai",
  address: "Home",
  area: "Dubai Marina",
  building: "Bay Central",
  apartment: "25B",
  additionalAddress: "Near Mall",
  category: "Residential",
  scope: "Full Interior",
  fullFitOut: "Yes",
  renovation: "No",
  specificWork: "Flooring",
  hasDrawings: "Yes",
  drawingsFilename: "floorplan.pdf",
  budgetRange: "AED 100K - 250K",
  description: "Need complete interior renovation.",
  date: "12-11-2025",
  status: "Pending",
};

export default function AdminEnquiryDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ContentLayout title={`Enquiry #${params.id}`}>
      <div className="bg-white border p-6 rounded-xl shadow-sm space-y-6 text-sm">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Enquiry Details</h3>
          <Badge>{enquiry.status}</Badge>
        </div>

        {/* GRID FIELDS */}
        <div className="grid md:grid-cols-2 gap-4">
          <ReadOnlyField label="Full Name" value={enquiry.fullName} />
          <ReadOnlyField label="Email" value={enquiry.email} />

          <ReadOnlyField
            label="Mobile"
            value={`${enquiry.countryCode} ${enquiry.mobile}`}
          />
          <ReadOnlyField label="Emirate" value={enquiry.emirate} />

          <ReadOnlyField label="Address" value={enquiry.address} />
          <ReadOnlyField label="Area" value={enquiry.area} />

          <ReadOnlyField label="Building" value={enquiry.building} />
          <ReadOnlyField label="Apartment" value={enquiry.apartment} />

          <ReadOnlyField
            label="Additional Address"
            value={enquiry.additionalAddress}
          />
          <ReadOnlyField label="Category" value={enquiry.category} />

          <ReadOnlyField label="Scope of Work" value={enquiry.scope} />
          <ReadOnlyField label="Full Fit Out" value={enquiry.fullFitOut} />

          <ReadOnlyField label="Renovation" value={enquiry.renovation} />
          <ReadOnlyField
            label="Specific Work"
            value={enquiry.specificWork}
          />

          <ReadOnlyField label="Budget Range" value={enquiry.budgetRange} />
        </div>

        {/* DRAWINGS FILE */}
        <div>
          <label className="text-sm font-medium">Drawings / Plans</label>
          {enquiry.drawingsFilename ? (
            <a
              href="#"
              download={enquiry.drawingsFilename}
              className="block text-primary underline mt-1"
            >
              {enquiry.drawingsFilename}
            </a>
          ) : (
            <p className="text-gray-500 text-sm">No file uploaded</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            disabled
            value={enquiry.description}
            className="w-full border p-3 rounded-lg text-sm bg-gray-100 min-h-[120px]"
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
