"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";

const mockData = {
  id: 1,
  name: "Ameer",
  email: "test@gmail.com",
  mobile: "989898989",
  emirate: "Dubai",
  address: "Home",
  fullAddress: "7B Spice Road, Banjara Hills, Hyderabad",
  category: "Residential",
  service: "AC Repair",
  description: "AC stopped working suddenly.",
  status: "Active",
  technician: null,
  date: "12-11-2025",
};

export default function AdminEmergencyView() {
  const { id } = useParams();

  return (
    <ContentLayout title={`Emergency Request #${id}`}>
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between">
          <p className="text-lg font-semibold">{mockData.service}</p>
          <Badge>{mockData.status}</Badge>
        </div>

        <p>
          <span className="font-semibold">Customer:</span> {mockData.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {mockData.email}
        </p>
        <p>
          <span className="font-semibold">Mobile:</span> {mockData.mobile}
        </p>
        <p>
          <span className="font-semibold">Emirate:</span> {mockData.emirate}
        </p>
        <p>
          <span className="font-semibold">Address:</span> {mockData.fullAddress}
        </p>
        <p>
          <span className="font-semibold">Category:</span>{" "}
          {mockData.category}
        </p>

        <p className="font-semibold mt-4">Description</p>
        <p className="text-gray-600">{mockData.description}</p>

        <p className="font-semibold mt-4">
          Assigned Technician:{" "}
          {mockData.technician || (
            <span className="text-gray-500">Not Assigned</span>
          )}
        </p>
      </div>
    </ContentLayout>
  );
}
