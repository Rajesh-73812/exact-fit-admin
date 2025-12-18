'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bookmark, BookmarkMinus, Image as ImageIcon, TrendingUp } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

interface Banner {
  slug: string;
  name: string;
  image_url: string;
  is_active: boolean;
  priority?: number;
  section?: string;
  createdAt?: string;
}

export default function BannersListPage() {
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [statusModal, setStatusModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, [page, limit, searchQuery]);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/banner/V1/get-all-banners', {
        params: { page, limit, search: searchQuery || undefined },
      });

      const items: Banner[] = data.data || [];
      setBanners(items);
      setTotal(data.pagination?.total || items.length);

      setAnalytics({
        total: items.length,
        active: data.activeCount ?? items.filter(b => b.is_active).length,
        inactive: data.inactiveCount ?? items.filter(b => !b.is_active).length,
      });
    } catch (err) {
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle status
  const confirmStatusToggle = async () => {
    if (!selectedSlug) return;
    try {
      await apiClient.patch(`/banner/V1/toggle-banner-status/${selectedSlug}`);
      toast.success('Banner status updated');
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusModal(false);
      setSelectedSlug('');
    }
  };

  // Delete banner
  const confirmDelete = async () => {
    if (!selectedSlug) return;
    try {
      await apiClient.delete(`/banner/V1/delete-banner/${selectedSlug}`);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete banner');
    } finally {
      setDeleteModal(false);
      setSelectedSlug('');
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (b: Banner) => (
        <div className="relative h-14 w-32 rounded-lg overflow-hidden bg-gray-100 border cursor-pointer" onClick={() => { setPreviewImage(b.image_url || null) }}>
          {b.image_url ? (
            <Image
              src={b.image_url}
              alt={b.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (b: Banner) => (
        <button
          onClick={() => router.push(`/banners/edit/${b.slug}`)}
          className="font-semibold text-violet-600 hover:underline"
        >
          {b.name}
        </button>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (b: Banner) => (
        <Badge variant="secondary">{b.priority ?? '-'}</Badge>
      ),
    },
    // {
    //   key: 'status',
    //   header: 'Status',
    //   render: (b: Banner) => (
    //     <Badge variant={b.is_active ? 'default' : 'secondary'}>
    //       {b.is_active ? 'Active' : 'Inactive'}
    //     </Badge>
    //   ),
    // },
  ];

  return (
    <ContentLayout title="Banners">
      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
       {/* Total Banners */}
       <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
         <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1">
             <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
               <ImageIcon className="h-4 w-4 text-black" />
             </div>
             <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
               Total Banners
             </h4>
           </div>
           <p className="text-xl font-bold text-gray-900">{analytics.total}</p>
         </div>
       </div>

       {/* Active Banners */}
       <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
         <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1">
             <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
               <Bookmark className="h-4 w-4 text-black" />
             </div>
             <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
               Active
             </h4>
           </div>
           <p className="text-xl font-bold text-gray-900">{analytics.active}</p>
         </div>
       </div>

       {/* Inactive Banners */}
       <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
         <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
         <div className="flex flex-col gap-1">
           <div className="flex items-center gap-1">
             <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
               <BookmarkMinus className="h-4 w-4 text-black" />
             </div>
             <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
               Inactive
             </h4>
           </div>
           <p className="text-xl font-bold text-gray-900">{analytics.inactive}</p>
         </div>
       </div>
     </div>

      {/* Table */}
        <ListComponent
          title="Banner"
          data={banners}
          columns={columns}
          isLoading={isLoading}
          addRoute="/banners/add"
          editRoute={(slug: string) => `/banners/edit/${slug}`}
          deleteEndpoint={(slug: string) => `/banner/V1/delete-banner/${slug}`}
          statusToggleEndpoint={(slug: string) => `/banner/V1/toggle-banner-status/${slug}`}
          onStatusToggle={async (slug: string) => {
            setSelectedSlug(slug);
            setStatusModal(true);
          }}
          onDelete={async (slug: string) => {
            setSelectedSlug(slug);
            setDeleteModal(true);
          }}
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={limit}
          setItemsPerPage={setLimit}
          totalItems={total}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusField="is_active"
          showStatusToggle={true}
        />

      {/* Confirm Status Toggle */}
      <CustomModal
        isOpen={statusModal}
        onRequestClose={() => {
          setStatusModal(false);
          setSelectedSlug('');
        }}
        title="Change Banner Status"
        description="Are you sure you want to toggle this banner's status?"
        onConfirm={confirmStatusToggle}
        confirmText="Yes, Update"
      />

      {/* Confirm Delete */}
      <CustomModal
        isOpen={deleteModal}
        onRequestClose={() => {
          setDeleteModal(false);
          setSelectedSlug('');
        }}
        title="Delete Banner"
        description="This action cannot be undone. The banner will be permanently removed."
        onConfirm={confirmDelete}
        confirmText="Delete Permanently"
        cancelText="Cancel"
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