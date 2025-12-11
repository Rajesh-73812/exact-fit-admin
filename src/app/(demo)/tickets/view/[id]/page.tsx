'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import CustomModal from '@/components/CustomModal';
import { toast } from 'sonner';

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
  deletedAt?: string | null;
}

export default function TicketViewPage() {
  const router = useRouter();
  const { id } = useParams() as { id?: string };

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  // slider state
  const [activeIndex, setActiveIndex] = useState<number>(0);

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
        // Try single-ticket endpoint first
        const res = await apiClient.get(`/ticket/V1/view-ticket/${id}`);
        const payload = res.data?.data ?? res.data;
        if (!payload) throw new Error('Ticket payload empty');
        const imgs = normalizeImages(payload.image_url);
        setTicket({
          id: payload.id,
          ticketNumber: payload.ticketNumber,
          user_id: payload.user_id,
          title: payload.title || '—',
          description: payload.description || '',
          image_url: imgs,
          status: payload.status || 'pending',
          createdAt: payload.createdAt || new Date().toISOString(),
          updatedAt: payload.updatedAt || null,
          deletedAt: payload.deletedAt || null,
        });
        setActiveIndex(0);
      } catch (err: any) {
        // fallback: fetch list and find
        try {
          const res = await apiClient.get('/ticket/V1/get-all-ticket', { params: { page: 1, limit: 1000 } });
          const list = res.data?.data ?? [];
          const found = list.find((t: any) => t.id === id);
          if (!found) {
            toast.error(err.response?.data?.message || 'Ticket not found');
            return;
          }
          const imgs = normalizeImages(found.image_url);
          setTicket({
            id: found.id,
            ticketNumber: found.ticketNumber,
            user_id: found.user_id,
            title: found.title || '—',
            description: found.description || '',
            image_url: imgs,
            status: found.status || 'pending',
            createdAt: found.createdAt || new Date().toISOString(),
            updatedAt: found.updatedAt || null,
            deletedAt: found.deletedAt || null,
          });
          setActiveIndex(0);
        } catch (innerErr) {
          console.error('Failed to load ticket:', innerErr);
          toast.error('Failed to load ticket');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, normalizeImages]);

  // keyboard navigation for slider (left / right)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!ticket?.image_url || ticket.image_url.length <= 1) return;
      if (e.key === 'ArrowLeft') setActiveIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setActiveIndex(i => Math.min(ticket.image_url!.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ticket]);

  const handlePrev = () => {
    if (!ticket?.image_url) return;
    setActiveIndex(i => (i <= 0 ? ticket.image_url!.length - 1 : i - 1));
  };
  const handleNext = () => {
    if (!ticket?.image_url) return;
    setActiveIndex(i => (i >= ticket.image_url!.length - 1 ? 0 : i + 1));
  };


  return (
    <ContentLayout title="Ticket Details">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/tickets">Tickets</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>View</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading…</p>
          ) : ticket ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Images (span 2 columns on large) */}
              {/* We place images in the first two columns on large screens */}
              <div className="lg:col-span-2 space-y-4">
                {/* Image area only if images exist */}
                {Array.isArray(ticket.image_url) && ticket.image_url.length > 0 ? (
                  <div className="relative bg-gray-50 border rounded-lg overflow-hidden">
                    <div className="relative w-full h-96 bg-black/5 flex items-center justify-center">
                      {/* Current image */}
                      <Image
                        src={ticket.image_url[activeIndex]}
                        alt={`${ticket.title} - image ${activeIndex + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Controls */}
                    {ticket.image_url.length > 1 && (
                      <>
                        <button
                          aria-label="Previous image"
                          onClick={handlePrev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          aria-label="Next image"
                          onClick={handleNext}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                          {ticket.image_url.map((_, idx) => (
                            <button
                              key={idx}
                              aria-label={`Go to image ${idx + 1}`}
                              onClick={() => setActiveIndex(idx)}
                              className={`w-2 h-2 rounded-full ${idx === activeIndex ? 'bg-white' : 'bg-white/60'}`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-white/90">{activeIndex + 1}/{ticket.image_url.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  // No images: don't show image box (or show placeholder)
                  <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-gray-500">
                    <p className="font-medium">No attachments</p>
                    <p className="text-sm mt-2">This ticket has no images attached.</p>
                  </div>
                )}

                {/* Description / Message */}
                <div className="bg-white p-4 rounded border">
                  <Label className="text-xs">Message</Label>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{ticket.description || '—'}</div>
                </div>
              </div>

              {/* Right column: metadata */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded border">
                  <Label className="text-xs">Ticket Number</Label>
                  <p className="mt-1 font-medium text-lg">{ticket.ticketNumber}</p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <Label className="text-xs">Title</Label>
                  <p className="mt-1 font-medium">{ticket.title}</p>
                </div>

                <div className="bg-white p-4 rounded border">
                  <Label className="text-xs">Status</Label>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        ticket.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border">
                  <Label className="text-xs">Submitted At</Label>
                  <p className="mt-1 text-sm text-gray-600">{new Date(ticket.createdAt).toLocaleString('en-IN')}</p>
                </div>

                {ticket.updatedAt && (
                  <div className="bg-white p-4 rounded border">
                    <Label className="text-xs">Last Updated</Label>
                    <p className="mt-1 text-sm text-gray-600">{new Date(ticket.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500">Ticket not found.</p>
          )}
        </div>
      </div>

    </ContentLayout>
  );
}
