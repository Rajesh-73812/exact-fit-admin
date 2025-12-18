'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: string;
  ticketNumber: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string[] | string | null;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

export default function TicketViewPage() {
  const { id } = useParams() as { id?: string };

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [technician, setTechnician] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [technicians, setTechnicians] = useState<any[]>([]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const { data } = await apiClient.get("/technicians/V1/get-all");
        setTechnicians(data.data.rows);
      } catch (err) {
        console.error("Failed to load technicians");
      }
    };
    loadTechnicians();
  }, []);

  const formatStatusForUI = (status: string) =>
    status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatStatusForBackend = (status: string) => {
    switch (status) {
      case "Open": return "open";
      case "In Progress": return "in_progress";
      case "Completed": return "completed";
      case "Pending": return "pending";
      default: return status.toLowerCase().replace(" ", "_");
    }
  };

  const getAvailableStatuses = (current: string) => {
  const uiCurrent = backendToUI(current);

  switch (current) {
    case "open":
      return [uiCurrent, "Pending", "In Progress", "Hold", "Completed"];

    case "pending":
      return [uiCurrent, "Open", "In Progress", "Hold", "Completed"];

    case "in_progress":
      return [uiCurrent, "Open", "Pending", "Hold", "Completed"];

    case "hold":
      return [uiCurrent, "Open", "Pending", "In Progress", "Completed"];

    case "completed":
      return [uiCurrent]; // completed cannot change

    default:
      return [uiCurrent];
  }
};


  const normalizeImages = useCallback((raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string' && raw.trim()) return [raw];
    return [];
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadTicket = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/ticket/V1/view-ticket/${id}`);
        const data = res.data?.data ?? res.data;

        setTicket({
          id: data.id,
          ticketNumber: data.ticketNumber,
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          image_url: normalizeImages(data.image_url),
          status: data.status.toLowerCase(),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } catch (err) {
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id, normalizeImages]);

  const handleDirectStatusUpdate = async (status: string) => {
    if (!ticket) return;

    setUpdatingStatus(true);
    try {
      await apiClient.patch(`/ticket/V1/assign-and-update-status/${ticket.id}`, {
        status,
      });

      setTicket({ ...ticket, status });
      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!ticket || !selectedStatus) return;

    setUpdatingStatus(true);

    try {
      await apiClient.patch(`/ticket/V1/assign/${ticket.id}`, {
        status: selectedStatus,
        technician_id: technician,
        notes: notes,
      });

      setTicket({ ...ticket, status: selectedStatus });
      toast.success("Status updated");
      setShowModal(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const backendToUI = (status: string) => {
  switch (status) {
    case "open": return "Open";
    case "in_progress": return "In Progress";
    case "completed": return "Completed";
    case "pending": return "Pending";
    default: return status;
  }
};


  return (
    <ContentLayout title="Ticket Details">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/tickets">Tickets</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>View</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6">

          {/* Loading */}
          {loading && <p className="text-center py-12">Loading…</p>}

          {/* Ticket Loaded */}
          {!loading && ticket && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT: IMAGES + MESSAGE */}
              <div className="lg:col-span-2 space-y-6">
                {ticket.image_url?.length ? (
                  <div className="relative bg-gray-50 border rounded-lg h-96">
                    <Image
                      src={ticket.image_url[activeIndex]}
                      alt="Ticket Image"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="border border-dashed p-12 text-center">
                    No images
                  </div>
                )}

                <div className="bg-muted/30 p-5 rounded-lg border">
                  <Label className="text-xs font-medium">Message</Label>
                  <p className="mt-2 text-sm">{ticket.description || "—"}</p>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="space-y-5">

                {/* Ticket Number */}
                <div className="bg-muted/30 p-5 rounded-lg border">
                  <Label className="text-xs">Ticket Number</Label>
                  <p className="text-lg font-semibold mt-1">{ticket.ticketNumber}</p>
                </div>

                {/* Title */}
                <div className="bg-muted/30 p-5 rounded-lg border">
                  <Label className="text-xs">Title</Label>
                  <p className="font-medium mt-1">{ticket.title}</p>
                </div>

                {/* STATUS DROPDOWN */}
                <div className="bg-muted/30 p-5 rounded-lg border">
                  <Label className="text-xs">Status</Label>

                  <Select
                    value={backendToUI(ticket.status)}
                    onValueChange={(uiValue) => {
                      const backendValue = formatStatusForBackend(uiValue);

                      if (backendValue === "completed") {
                        handleDirectStatusUpdate(backendValue);
                        return;
                      }

                      setSelectedStatus(backendValue);
                      setShowModal(true);
                    }}
                    disabled={getAvailableStatuses(ticket.status).length === 0}
                  >
                    <SelectTrigger className={`mt-2 ${getStatusColor(ticket.status)} font-medium`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      {getAvailableStatuses(ticket.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* MODAL */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Status</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Technician */}
                      <div>
                        <Label>Technician</Label>
                        <Select onValueChange={setTechnician}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select technician" />
                          </SelectTrigger>

                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>
                                {tech.fullname} | {tech.mobile} | Type: {tech.service_type} 
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Notes */}
                      <div>
                        <Label>Notes</Label>
                        <textarea
                          className="w-full border rounded p-2 text-sm"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </Button>

                      <Button onClick={handleConfirmStatusUpdate}>
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </div>
          )}

        </div>
      </div>
    </ContentLayout>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800";
    case "in_progress": return "bg-yellow-100 text-yellow-800";
    default: return "bg-blue-100 text-blue-800";
  }
};
