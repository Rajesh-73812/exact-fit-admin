"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/utils/Loader"; // Optional: if you have a loader component

interface EmergencyBooking {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  description: string;
  status: string;
  technician_id: string | null;
  createdAt: string;
  // You can extend with service name, address details later if joined
}

export default function AdminEmergencyView() {
  const { id } = useParams() as { id: string };

  const [booking, setBooking] = useState<EmergencyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await apiClient.get(`/booking/V1/get-emergency-booking-by-id/${id}`);
        const data = res.data?.data;

        if (!data) throw new Error("No data returned");

        setBooking({
          id: data.id,
          fullname: data.fullname || "N/A",
          email: data.email || "N/A",
          mobile: data.mobile || "N/A",
          description: data.description || "No description provided",
          status: data.status === "pending"
            ? "Active"
            : data.status === "in-progress"
            ? "In Progress"
            : data.status === "completed"
            ? "Completed"
            : "Active",
          technician_id: data.technician_id,
          createdAt: data.createdAt,
        });
      } catch (err) {
        console.error("Failed to fetch emergency booking:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <ContentLayout title="Emergency Request">
        <div className="flex items-center justify-center h-64">
          <Loader /> {/* Or any spinner */}
        </div>
      </ContentLayout>
    );
  }

  if (error || !booking) {
    return (
      <ContentLayout title="Emergency Request">
        <div className="bg-white p-6 rounded-xl border shadow-sm text-center text-red-600">
          <p>Failed to load emergency request. Please try again later.</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Emergency Request #${booking.id.slice(0, 8)}...`}>
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-semibold text-primary">Emergency Service Request</p>
            <p className="text-sm text-gray-500">
              Submitted on {new Date(booking.createdAt).toLocaleDateString("en-GB")} at{" "}
              {new Date(booking.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <Badge
            variant={
              booking.status === "Active"
                ? "default"
                : booking.status === "In Progress"
                ? "secondary"
                : "outline"
            }
            className={booking.status === "Completed" ? "bg-green-100 text-green-800" : ""}
          >
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <p>
            <span className="font-semibold">Customer Name:</span> {booking.fullname}
          </p>
          <p>
            <span className="font-semibold">Mobile:</span> {booking.mobile}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {booking.email}
          </p>
        </div>

        <div className="pt-4 border-t">
          <p className="font-semibold mb-2">Description</p>
          <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
            {booking.description}
          </p>
        </div>

        <div className="pt-4 border-t">
          <p className="font-semibold">
            Assigned Technician:{" "}
            <span className={booking.technician_id ? "text-green-600" : "text-gray-500"}>
              {booking.technician_id ? "Assigned" : "Not Assigned Yet"}
            </span>
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}