'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Image as ImageIcon, TrendingUp } from 'lucide-react';
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
        <div className="relative h-14 w-32 rounded-lg overflow-hidden bg-gray-100 border">
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
      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Banners</p>
              <p className="text-3xl font-bold mt-1">{analytics.total}</p>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <ImageIcon className="h-7 w-7 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {analytics.active}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {analytics.inactive}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ImageIcon className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
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
      </div>

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
    </ContentLayout>
  );
}