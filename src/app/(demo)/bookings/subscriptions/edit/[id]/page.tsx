// app/bookings/subscriptions/edit/[id]/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import apiClient from "@/lib/apiClient";
import Loader from "@/components/utils/Loader";

/* ---------- TYPES ---------- */

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

type PendingChange = {
  technicianId?: string;
  scheduledDate?: string;
  status?: string;
};

export default function EditSubscriptionPage() {
  const { id } = useParams();
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({});

  /* ---------- FETCH ---------- */

  const fetchData = async () => {
    try {
      setLoading(true);

      const subRes = await apiClient.get(
        `/booking/V1/get-subscription-booking-by-id/${id}`
      );
      setSubscription(subRes.data.data);

      const techRes = await apiClient.get("/technicians/V1/get-all");
      setTechnicians(techRes.data?.data?.rows || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  /* ---------- PENDING UPDATERS ---------- */

  const updatePending = (visitId: string, change: Partial<PendingChange>) => {
    setPendingChanges(prev => ({
      ...prev,
      [visitId]: {
        ...prev[visitId],
        ...change,
      },
    }));
  };

  /* ---------- ASSIGN ---------- */

  const assignVisit = async (visit: ScheduledVisit) => {
    const changes = pendingChanges[visit.id];
    if (!changes) return;

    try {
      setSaving(visit.id);

      const payload: any = {
        technician_id: changes.technicianId ?? visit.technician_id,
      };

      if (changes.scheduledDate) payload.scheduled_date = changes.scheduledDate;
      if (changes.status) payload.status = changes.status;

      await apiClient.post(
        `/booking/V1/subscription/visit/${visit.id}/assign`,
        payload
      );

      setSubscription(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          visits: prev.visits.map(sv => ({
            ...sv,
            scheduled_visits: sv.scheduled_visits.map(v =>
              v.id === visit.id
                ? {
                    ...v,
                    technician_id: payload.technician_id,
                    scheduled_date: payload.scheduled_date ?? v.scheduled_date,
                    status: payload.status ?? v.status,
                  }
                : v
            ),
          })),
        };
      });

      setPendingChanges(prev => {
        const copy = { ...prev };
        delete copy[visit.id];
        return copy;
      });

      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign technician");
    } finally {
      setSaving(null);
    }
  };

  /* ---------- RENDER ---------- */

  if (loading) return <Loader />;
  if (!subscription) return <p className="text-center py-10">Subscription not found</p>;

  return (
    <ContentLayout title={`Edit Subscription #${subscription.id}`}>
      <div className="space-y-8">
        {subscription.visits.map((serviceBlock, idx) => (
          <Card key={idx} className="shadow-lg border">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="text-xl text-indigo-800">
                {serviceBlock.service_name || "Unknown Service"}
                <Badge variant="secondary" className="ml-3">
                  {serviceBlock.scheduled_visits.length} visits
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-4 px-6 text-left">Visit #</th>
                    <th className="py-4 px-6 text-left">Scheduled Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-left">Technician</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {serviceBlock.scheduled_visits.map(visit => {
                    const isCompleted = visit.status === "completed";
                    const pending = pendingChanges[visit.id] || {};
                    const displayedTechId =
                      pending.technicianId ?? visit.technician_id;

                    const hasChanges =
                      pending.technicianId ||
                      pending.scheduledDate ||
                      pending.status;

                    const currentTech = technicians.find(
                      t => t.id === displayedTechId
                    );

                    return (
                      <tr
                        key={visit.id}
                        className={`border-b hover:bg-gray-50 ${
                          isCompleted ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <td className="py-4 px-6 font-medium">
                          Visit {visit.visit_number}
                        </td>

                        <td className="py-4 px-6">
                          <input
                            type="date"
                            className="border rounded px-3 py-2 w-full"
                            defaultValue={visit.scheduled_date}
                            onChange={e =>
                              updatePending(visit.id, {
                                scheduledDate: e.target.value,
                              })
                            }
                          />
                        </td>

                        {/* -------- STATUS DROPDOWN (FIXED) -------- */}
                        <td className="py-4 px-6 text-center">
                          <Select
                            value={pending.status ?? visit.status}
                            onValueChange={val =>
                              updatePending(visit.id, { status: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
  {visit.status === "pending" && (
    <>
      <SelectItem value="pending">Pending</SelectItem>
      <SelectItem value="in_progress">In Progress</SelectItem>
    </>
  )}

  {visit.status === "in_progress" && (
    <>
      <SelectItem value="in_progress">In Progress</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
    </>
  )}

  {visit.status === "completed" && (
    <SelectItem value="completed">Completed</SelectItem>
  )}
</SelectContent>

                          </Select>
                        </td>

                        <td className="py-4 px-6">
                          <Select
                            value={displayedTechId || undefined}
                            onValueChange={val =>
                              updatePending(visit.id, { technicianId: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicians.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.fullname} ({t.service_type || "No Service"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {currentTech && (
                            <p className="text-sm mt-2 text-green-700">
                              Assigned: {currentTech.fullname}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <Button
                            size="sm"
                            disabled={!hasChanges || saving === visit.id}
                            onClick={() => assignVisit(visit)}
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
        ))}
      </div>
    </ContentLayout>
  );
}
