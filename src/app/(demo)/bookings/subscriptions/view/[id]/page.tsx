// app/bookings/subscriptions/view/[id]/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, CheckCircle2, XCircle } from "lucide-react";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/utils/Loader";

interface ScheduledVisit {
  scheduled_date: string;
  status: string;
  visit_number: number;
  technician_assigned: boolean;
}

interface ServiceVisit {
  service_name: string;
  scheduled_visits: ScheduledVisit[];
}

interface SubscriptionDetail {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  price_total: number;
  payment_option: string;
  payment_status: string;
  subscriptionType: string;
  subscriptionPlanName: string | null;
  visits: ServiceVisit[];
}

export default function ViewSubscriptionPage() {
  const { id } = useParams();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/booking/V1/get-subscription-booking-by-id/${id}`);
        setSubscription(response.data.data);
      } catch (err) {
        console.error("Failed to load subscription:", err);
        alert("Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSubscription();
  }, [id]);

  if (loading) return <Loader />;

  if (!subscription) return <p className="text-center py-10">Subscription not found</p>;

  return (
    <ContentLayout title={`Subscription #${subscription.id}`}>
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {subscription.subscriptionType === "plan"
                ? subscription.subscriptionPlanName || "Unnamed Plan"
                : "Custom Subscription"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {subscription.start_date} → {subscription.end_date}
            </p>
            <p className="text-sm text-gray-600 mt-1 capitalize">{subscription.payment_option}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">AED {subscription.price_total}</p>
            <Badge variant={subscription.payment_status === "paid" ? "default" : "outline"} className="mt-2">
              {subscription.payment_status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Services & Visits Table */}
      {subscription.visits.map((serviceBlock, idx) => (
        <Card key={idx} className="mb-8 shadow-lg border">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="text-xl text-indigo-800 flex items-center gap-3">
              {serviceBlock.service_name}
              <Badge variant="secondary">
                {serviceBlock.scheduled_visits.length} visit{serviceBlock.scheduled_visits.length > 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Visit #</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Scheduled Date</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Technician</th>
                </tr>
              </thead>
              <tbody>
                {serviceBlock.scheduled_visits.map((visit, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="py-4 px-6">Visit {visit.visit_number}</td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {visit.scheduled_date}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {visit.status === "completed" || visit.status === "done" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {visit.technician_assigned ? (
                        <Badge className="bg-green-100 text-green-800">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Assigned
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </ContentLayout>
  );
}