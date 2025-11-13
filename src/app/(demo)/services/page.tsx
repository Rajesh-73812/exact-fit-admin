'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, IndianRupee, Package, Image as ImageIcon } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Service {
  title: string;
  service_slug: string;
  position: string;
  status: 'active' | 'inactive';
  image_url?: string;
  image_alt?: string;
  createdAt: string;
  productsCount?: number;
  totalEarnings?: number;
}

interface ServiceAnalytics {
  product: number;
  Earning: number;
  activeServiceCount: number;
  inactiveServiceCount: number;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ServiceAnalytics>({
    product: 0,
    Earning: 0,
    activeServiceCount: 0,
    inactiveServiceCount: 0,
  });

  /* -------------------------------------------------- FETCH -------------------------------------------------- */
  useEffect(() => {
    fetchServices();
    fetchAnalytics();
  }, [page, searchQuery]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await apiClient.get('/service/V1/get-all-service');
      setAnalytics({
        product: data.TotalProduct || 0,
        Earning: data.TotalEarning || 0,
        activeServiceCount: data.activeServiceCount || 0,
        inactiveServiceCount: data.inactiveServiceCount || 0,
      });

      console.log(data, "dataaaaaaaaaaaaa")
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/services/V1/get-all-services', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Service[] = items.map((cat: any) => ({
        title: cat.title || '',
        service_slug: cat.services_slug || '',
        position: cat.position?.toString() || '',
        status: cat.status === 'active' ? 'active' : 'inactive',
        image_url: cat.image_url || '',
        image_alt: cat.image_alt || '',
        createdAt: cat.createdAt || new Date().toISOString(),
        productsCount: cat.productsCount || 0,
        totalEarnings: cat.totalEarnings || 0,
      }));

      setServices(transformed);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------- TOGGLE -------------------------------------------------- */
  const handleStatusToggle = async (slug: string) => {
    if (!slug) return;
    try {
      setIsLoading(true);
      await apiClient.patch(`/service/V1/update-status/${slug}`);
      await fetchServices();
      await fetchAnalytics();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedSlug(null);
    }
  };

   /* -------------------------------------------------- DELETE -------------------------------------------------- */
  const handleDeleteService = async (slug: string) => {
    alert(slug);
    if (!slug) return;
    try {
      setIsLoading(true);
      await apiClient.delete(`/service/V1/delete-service-by-slug/${slug}`);
      await fetchServices();
      await fetchAnalytics();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteSlug(null);
    }
  };
  const openToggleModal = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    setSelectedSlug(slug);
    setOpenDialog(true);
  };

  /* -------------------------------------------------- COLUMNS -------------------------------------------------- */
  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (item: Service) =>
        item.image_url ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.image_alt || 'Service Image'}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (item: Service) => (
        <button
          onClick={() => router.push(`/services/${item.service_slug}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.title}
        </button>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (item: Service) => <span className="text-center">{item.position}</span>,
    },
    {
      key: 'productsCount',
      header: 'Total Products',
      render: (item: Service) => <span className="text-center">{item.productsCount}</span>,
    },
    {
      key: 'totalEarnings',
      header: 'Total Earnings',
      render: (item: Service) => <span className="text-center">₹{item.totalEarnings}</span>,
    },
  ];

  /* -------------------------------------------------- RENDER -------------------------------------------------- */
  return (
    <ContentLayout title="Services">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Products */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Products</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{analytics.product}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+12%</span> vs last month
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Earnings</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{analytics.Earning}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+8%</span> vs last month
            </div>
          </div>
        </div>

        {/* Total services */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Services</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analyticsLoading ? '...' : analytics.activeServiceCount + analytics.inactiveServiceCount}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active:{' '}
                <span className="font-semibold text-green-600">
                  {analyticsLoading ? '...' : analytics.activeServiceCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Inactive:{' '}
                <span className="font-semibold text-red-600">
                  {analyticsLoading ? '...' : analytics.inactiveServiceCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ListComponent */}
      <ListComponent
        title="Service"
        data={services}
        columns={columns}
        isLoading={isLoading}
        addRoute="/services/add"
        editRoute={(slug) => `/services/edit/${slug}`}
        viewRoute={(slug) => `/services/${slug}`}
        deleteEndpoint={(slug) => `/service/V1/delete-service-by-slug/${slug}`}
        onDelete={async (slug) => {
          setDeleteSlug(slug);
          setDeleteDialog(true);
        }}
        statusToggleEndpoint={(slug) => `/service/V1/update-status/${slug}`}
        onStatusToggle={async (slug: string) => {
          setSelectedSlug(slug);
          setOpenDialog(true);
        }}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        setItemsPerPage={() => { }}
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
        title="Confirm Status Update"
        description="Are you sure you want to update the active status of this service?"
        onConfirm={() => handleStatusToggle(selectedSlug!)}
        confirmText="Confirm"
      />

      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => {
          setDeleteDialog(false);
          setDeleteSlug(null);
        }}
        title="Confirm Delete"
        description="Are you sure you want to delete this service?"
        onConfirm={async () => { handleDeleteService(deleteSlug!)  }}
        confirmText="Confirm"
      />
    </ContentLayout>
  );
}