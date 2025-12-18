'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileText, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import ListComponent from '@/components/ListComponent';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';


interface Ticket {
  id: string;
  ticketNumber: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string[] | string | null;
  thumbnail?: string | null; // normalized first image (if any)
  status: string;
  createdAt: string;
  updatedAt?: string | null;
}

interface TicketAnalytics {
  total: number;
  pending: number;
  completed: number;
  withAttachments: number;
}

export default function TicketPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<TicketAnalytics>({
    total: 0,
    pending: 0,
    completed: 0,
    withAttachments: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/ticket/V1/get-all', {
        params: { page, limit: itemsPerPage, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Ticket[] = items.map((t: any) => {
        let imgs: string[] = [];
        if (Array.isArray(t.image_url)) imgs = t.image_url;
        else if (typeof t.image_url === 'string' && t.image_url) imgs = [t.image_url];

        return {
          id: t.id,
          ticketNumber: t.ticketNumber,
          user_id: t.user_id,
          title: t.title || '—',
          description: t.description || '',
          image_url: imgs,
          thumbnail: imgs.length ? imgs[0] : null,
          status: t.status || 'pending',
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || null,
        };
      });

      setTickets(transformed);

      const totalCount = data.pagination?.totalCount ?? transformed.length;
      setTotal(totalCount);
      const pending = transformed.filter(x => x.status === 'pending').length;
      const completed = transformed.filter(x => x.status === 'completed').length;
      const withAttachments = transformed.filter(x => x.thumbnail).length;

      setAnalytics({
        total: transformed.length,
        pending,
        completed,
        withAttachments,
      });
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, limit, itemsPerPage, searchQuery]);

  const handleDeleteTicket = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/ticket/V1/delete-ticket/${deleteId}`);
      await fetchTickets();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (item: Ticket) => (
        <button
          onClick={() => router.push(`/tickets/view/${item.id}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.ticketNumber}
        </button>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (item: Ticket) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Ticket) => {
        const color =
          item.status === 'completed' ? 'bg-green-100 text-green-800' : item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
        return <span className={`px-3 py-1 text-xs font-medium rounded-full ${color}`}>{item.status}</span>;
      },
    },
    {
      key: 'attachments',
      header: 'Attachments',
      render: (item: Ticket) => (
        <div className="flex items-center gap-2">
          {item.thumbnail ? (
            <div
              className="w-12 h-8 relative rounded overflow-hidden bg-gray-100 border"
              onClick={() => { setPreviewImage(item.image_url?.[0] || null); }}
            >
              <Image
                src={item.thumbnail}
                alt="attachment"
                fill
                className="object-cover cursor-pointer"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-12 h-8 flex items-center justify-center text-xs text-gray-500 bg-gray-50 border rounded "
              onClick={() => { setPreviewImage(null); }}
            >
              {/* <img src="/path/to/fallback-image.jpg" alt="fallback" className="object-cover" />  */}
              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          <span className="text-sm">{Array.isArray(item.image_url) ? item.image_url.length : 0}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted At',
      render: (item: Ticket) => <span className="text-sm">{format(new Date(item.createdAt), 'dd MMM yyyy')}</span>,
    },
  ];

  return (
    <ContentLayout title="Support Tickets">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Tickets */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0b74de] rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#0b74de] bg-opacity-10 p-2">
              <Image src="/ticket.svg" alt="Tickets" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0b74de] uppercase">Total Tickets</p>
              <p className="text-2xl font-bold">{analytics.total}</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-yellow-500 bg-opacity-10 p-2">
              <FileText className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase">Pending</p>
              <p className="text-2xl font-bold">{analytics.pending}</p>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-green-600 bg-opacity-10 p-2">
              <FileText className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">Completed</p>
              <p className="text-2xl font-bold">{analytics.completed}</p>
            </div>
          </div>
        </div>

        {/* With Attachments */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-400 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-gray-400 bg-opacity-10 p-2">
              <FileText className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">With Attachments</p>
              <p className="text-2xl font-bold">{analytics.withAttachments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* List Component */}
      <ListComponent
        title="Ticket"
        data={tickets}
        columns={columns}
        isLoading={isLoading}
        addRoute={undefined}
        editRoute={(id: string) => `/tickets/edit/${id}`}
        viewRoute={(id: string) => `/tickets/view/${id}`}

        // Endpoints
        deleteEndpoint={(id: string) => `/ticket/V1/delete-ticket/${id}`}
        statusToggleEndpoint={undefined}

        onStatusToggle={async () => { /* not used */ }}

        onDelete={async (id: string) => {
          setDeleteId(id);
          setDeleteDialog(true);
        }}

        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="status"
        showStatusToggle={false}
        
      />
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <Image
              src={previewImage}
              alt="Preview"
              width={800}
              height={600}
              className="rounded shadow-lg object-contain max-h-[90vh] max-w-[90vw]"
            />
            <button
              className="absolute top-2 right-2 text-white bg-red-600 bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 "
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </ContentLayout>
  );
}
