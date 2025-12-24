// app/bookings/subscriptions/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/utils/Loader";

interface Technician {
  id: string;
  fullname: string | null;
  service_type: string | null;
}

interface ScheduledVisit {
  id: string;
  subservice_id: string;
  scheduled_date: string;
  status: string;
  visit_number: number;
  technician_id: string | null;
}

interface ServiceVisit {
  service_name?: string;
  scheduled_visits: ScheduledVisit[];
}

interface SubscriptionDetail {
  id: string;
  visits: ServiceVisit[];
}

export default function EditSubscriptionPage() {
  const { id } = useParams();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Pending changes per visit ID
  const [pendingChanges, setPendingChanges] = useState<Record<string, {
    technicianId?: string;
    scheduledDate?: string;
  }>>({});

  const fetchData = async () => {
      try {
        setLoading(true);

        const subRes = await apiClient.get(`/booking/V1/get-subscription-booking-by-id/${id}`);
        console.log(subRes,"kkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        setSubscription(subRes.data.data);

        const techRes = await apiClient.get("/technicians/V1/get-all");
        const techList = techRes.data?.data?.rows || [];
        setTechnicians(techList);
      } catch (err) {
        console.error("Failed to load data:", err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const assignTechnician = async (visitId: string) => {
    const changes = pendingChanges[visitId];
    console.log(changes,"fffffffffffff")

    if (!changes?.technicianId) {
      alert("Please select a technician first");
      return;
    }

    try {
      setSaving(visitId);

      const payload: any = { technician_id: changes.technicianId };
      if (changes.scheduledDate) payload.scheduled_date = changes.scheduledDate;

      await apiClient.post(`/booking/V1/subscription/visit/${visitId}/assign`, payload);

      // Update main subscription state
      setSubscription(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          visits: prev.visits.map(sv => ({
            ...sv,
            scheduled_visits: sv.scheduled_visits.map(v =>
              v.id === visitId
                ? {
                    ...v,
                    technician_id: changes.technicianId,
                    ...(changes.scheduledDate && { scheduled_date: changes.scheduledDate })
                  }
                : v
            )
          }))
        };
      });

      // Clear only this visit's pending changes
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[visitId];
        return newChanges;
      });

      alert("Technician assigned successfully!");
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign technician");
    } finally {
      setSaving(null);
    }
  };

  const updatePendingTechnician = (visitId: string, technicianId: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [visitId]: {
        ...prev[visitId],
        technicianId
      }
    }));
  };

  const updatePendingDate = (visitId: string, date: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [visitId]: {
        ...prev[visitId],
        scheduledDate: date
      }
    }));
  };

  if (loading) return <Loader />;

  if (!subscription) return <p className="text-center py-10">Subscription not found</p>;

  return (
    <ContentLayout title={`Edit Subscription #${subscription.id}`}>
      <div className="space-y-8">
        {subscription.visits.map((serviceBlock, serviceIdx) => {
          const serviceName = serviceBlock.service_name || "Unknown Service";

          return (
            <Card key={`service-${serviceIdx}`} className="shadow-lg border">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-xl text-indigo-800">
                  {serviceName}
                  <Badge variant="secondary" className="ml-3">
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
                      <th className="text-center py-4 px-6 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBlock.scheduled_visits.map((visit) => {
                      const isCompleted = visit.status === "completed";
                      const visitPending = pendingChanges[visit.id] || {};
                      const displayedTechId = visitPending.technicianId || visit.technician_id;
                      const currentTech = technicians.find(t => t.id === displayedTechId);
                      const hasPendingTechnician = !!visitPending.technicianId;

                      return (
                        <tr key={visit.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium">Visit {visit.visit_number}</td>

                          <td className="py-4 px-6">
                            <input
                              type="date"
                              className="border rounded px-3 py-2 w-full"
                              defaultValue={visitPending.scheduledDate || visit.scheduled_date}
                              disabled={isCompleted}
                              onBlur={(e) => {
                                const value = e.target.value;
                                if (value && value !== visit.scheduled_date && !isCompleted) {
                                  updatePendingDate(visit.id, value);
                                }
                              }}
                            />
                          </td>

                          <td className="py-4 px-6 text-center">
                            {isCompleted ? (
                              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                            ) : visit.status === "in_progress" ? (
                              <Clock className="w-8 h-8 text-orange-600 mx-auto" />
                            ) : (
                              <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <Select
                              value={displayedTechId || undefined}
                              onValueChange={(techId) => updatePendingTechnician(visit.id, techId)}
                              disabled={saving !== null || isCompleted}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Technician" />
                              </SelectTrigger>
                              <SelectContent>
                                {technicians.length > 0 ? (
                                  technicians.map((tech) => (
                                    <SelectItem key={tech.id} value={tech.id}>
                                      {tech.fullname || "Unnamed"} ({tech.service_type || "No Service"})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-sm text-gray-500">
                                    No technicians available
                                  </div>
                                )}
                              </SelectContent>
                            </Select>

                            {currentTech && (
                              <p className={`text-sm mt-2 ${hasPendingTechnician ? "text-blue-700" : "text-green-700"}`}>
                                {hasPendingTechnician ? "Pending:" : "Assigned:"} {currentTech.fullname}
                              </p>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <Button
                              size="sm"
                              onClick={() => assignTechnician(visit.id)}
                              disabled={saving === visit.id || isCompleted || !hasPendingTechnician}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {saving === visit.id ? "Assigning..." : "Assign"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ContentLayout>
  );
}