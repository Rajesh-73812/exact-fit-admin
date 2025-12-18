'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, IndianRupee, Package, Image as ImageIcon, Plus, Bookmark, BookmarkMinus } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';

interface SubService {
  id: string;
  Service: string;
  title: string;
  sub_service_slug: string;
  description: string;
  status: 'active' | 'inactive';
  image_url?: string;
  service_id?: string;
  createdAt: string;
  position?: number;
  discount?: number;
  price?: number;
}

interface SubServiceAnalytics {
  totalSubcategories: number;
  activeSubcategories: number;
  inactiveSubcategories: number;
  totalProducts: number;
  totalEarnings: number;
}

export default function SubServicesPage() {
  const router = useRouter();

  const [subservices, setSubservices] = useState<SubService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SubServiceAnalytics>({
    totalSubcategories: 0,
    activeSubcategories: 0,
    inactiveSubcategories: 0,
    totalProducts: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchSubServices();
  }, [page, itemsPerPage, searchQuery]);

  const fetchSubServices = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/sub-service/V1/get-all-sub-service', {
        params: { page, limit: itemsPerPage, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: SubService[] = items.map((s: any) => ({
        id: s.id || s.sub_service_slug,
        Service: s.service ? s.service.title : 'No Service',
        title: s.title,
        sub_service_slug: s.sub_service_slug,
        description: s.description || '—',
        status: s.status || 'inactive',
        image_url: s.image_url || undefined,
        service_id: s.service_id || undefined,
        createdAt: s.createdAt || new Date().toISOString(),
        position: s.position ?? 0,
        discount: s.discount ?? 0,
        price: s.price ?? 0,
      }));
      console.log(transformed, "ttttttttttt")
      setSubservices(transformed);
      setTotal(data.pagination?.total || 0);
      setAnalytics((prev) => ({
        ...prev,
        totalSubcategories: data.activeCount + data.inactiveCount,
        activeSubcategories: data.activeCount || 0,
        inactiveSubcategories: data.inactiveCount || 0,
      }));
    } catch (err) {
      console.error('Sub-service fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedSlug) return;
    try {
      setIsLoading(true);
      await apiClient.patch(`/sub-service/V1/update-sub-service-status/${selectedSlug}`);
      await fetchSubServices();
    } catch (err) {
      console.error('Status toggle error:', err);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedSlug(null);
    }
  };

  const handleDeleteSubService = async () => {
    if (!deleteSlug) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/sub-service/V1/delete-sub-service-by-slug/${deleteSlug}`);

      await fetchSubServices();
    } catch (err: any) {
      console.error('Failed to delete sub-service:', err);
      alert(err?.response?.data?.message || 'Failed to delete sub-service');
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteSlug(null);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (item: SubService) =>
        item.image_url ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden cursor-pointer" onClick={() => { setPreviewImage(item.image_url || null) }}>
            <Image src={item.image_url} alt={item.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        ),
    },
    {
      key: 'service',
      header: 'Service',
      render: (item: SubService) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{item.Service}</p>
      ),
    },
    {
      key: 'title',
      header: 'Name',
      render: (item: SubService) => (
        <button
          onClick={() => router.push(`/subservices/edit/${item.sub_service_slug}`)}
          className="font-semibold text-left hover:text-violet-600 transition-colors"
        >
          {item.title}
        </button>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item: SubService) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{item.description}</p>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (item: SubService) => <span className="text-center font-medium">{item.position}</span>,
    },
    // {
    //   key: 'status',
    //   header: 'Status',
    //   render: (item: SubService) => (
    //     <span
    //       className={`px-3 py-1 text-xs font-medium rounded-full ${item.status === 'active'
    //         ? 'bg-green-100 text-green-800'
    //         : 'bg-red-100 text-red-800'
    //         }`}
    //     >
    //       {item.status}
    //     </span>
    //   ),
    // },
    // {
    //   key: 'createdAt',
    //   header: 'Created',
    //   render: (item: SubService) => new Date(item.createdAt).toLocaleDateString(),
    // },
  ];

  return (
    <ContentLayout title="Sub Services">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Sub Services */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <BookmarkMinus className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Total Sub Services
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics.totalSubcategories}
            </p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Total Earnings
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{analytics.totalEarnings}</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <BookmarkMinus className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Sub Services Status
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics.totalSubcategories}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active:{' '}
                <span className="font-semibold text-green-600">
                  {analytics.activeSubcategories}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Inactive:{' '}
                <span className="font-semibold text-red-600">
                  {analytics.inactiveSubcategories}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Table */}
      <ListComponent
        title="Sub Service"
        data={subservices}
        columns={columns}
        isLoading={isLoading}
        addRoute="/subservices/add"
        editRoute={(slug) => `/subservices/edit/${slug}`}
        viewRoute={(slug) => `/subservices/${slug}`}
        deleteEndpoint={(slug) => `/sub-service/V1/delete-sub-service-by-slug/${slug}`}
        onDelete={async (slug) => {
          setDeleteSlug(slug);
          setDeleteDialog(true);
        }}
        statusToggleEndpoint={(slug) => `/sub-service/V1/update-sub-service-status/${slug}`}
        onStatusToggle={async (slug: string) => {
          setSelectedSlug(slug);
          setOpenDialog(true);
        }}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="status"
        showStatusToggle={true}
      />

      {/* Status Toggle Modal */}
      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
          setSelectedSlug(null);
        }}
        title="Toggle Status"
        description="Are you sure you want to change the status of this sub-service?"
        onConfirm={handleStatusToggle}
        confirmText="Yes, Update"
      />

      {/* Delete Modal */}
      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => {
          setDeleteDialog(false);
          setDeleteSlug(null);
        }}
        title="Confirm Delete"
        description="Are you sure you want to delete this sub-service?"
        onConfirm={handleDeleteSubService}
        confirmText="Delete"
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