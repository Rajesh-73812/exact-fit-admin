'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  TrendingUp,
  IndianRupee,
  Image as ImageIcon,
  Bookmark,
  BookmarkMinus,
} from 'lucide-react';

import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
  title: string;
  service_slug: string;
  position: string;
  type: string;
  status: 'active' | 'inactive';
  image_url?: string;
  image_alt?: string;
  createdAt: string;
  subserviceCount?: number;
  totalEarnings?: number;
}

interface ServiceAnalytics {
  subService: number;
  Earning: number;
  activeServiceCount: number;
  inactiveServiceCount: number;
}

export default function ServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'subscription' | 'enquiry'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ServiceAnalytics>({
    subService: 0,
    Earning: 0,
    activeServiceCount: 0,
    inactiveServiceCount: 0,
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/service/V1/get-all-service', {
        params: { page, limit: itemsPerPage, search: searchQuery || undefined, filter: filterType === 'all' ? undefined : filterType },
      });
      console.log(data, "ddddddddddddddddddd")
      const items = data.data || [];
      const transformed: Service[] = items.map((item: any) => ({
        title: item.title || '',
        service_slug: item.service_slug || '',
        position: item.position?.toString() || '',
        type: item.type || '',
        status: item.status === 'active' ? 'active' : 'inactive',
        image_url: item.image_url || '',
        image_alt: item.image_alt || '',
        createdAt: item.createdAt || new Date().toISOString(),
        subserviceCount: item.subserviceCount || 0,
        totalEarnings: item.totalEarnings || 0,
      }));

      setServices(transformed);
      setTotal(data.pagination?.total || 0);

      setAnalytics({
        subService: data.totalSubserviceCount || 0,
        Earning: data.TotalEarning || 0,
        activeServiceCount: data.activeCount || 0,
        inactiveServiceCount: data.inactiveCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, itemsPerPage, searchQuery, filterType]);

  const handleStatusToggle = async (slug: string) => {
    try {
      setIsLoading(true);
      await apiClient.patch(`/service/V1/update-status/${slug}`);
      await fetchServices();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedSlug(null);
    }
  };

  const handleDeleteService = async (slug: string) => {
    try {
      setIsLoading(true);
      await apiClient.delete(`/service/V1/delete-service-by-slug/${slug}`);
      await fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
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
      render: (item: Service) =>
        item.image_url ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden cursor-pointer" onClick={() => { setPreviewImage(item.image_url || null) }}>
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
      key: 'type',
      header: 'Type',
      render: (item: Service) => < span className="text-center">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
    },
    {
      key: 'position',
      header: 'Position',
      render: (item: Service) => <span className="text-center">{item.position}</span>,
    },
    {
      key: 'subserviceCount',
      header: 'Total SubServices',
      render: (item: Service) => <span className="text-center">{item.subserviceCount ?? 0}</span>,
    },
    {
      key: 'totalEarnings',
      header: 'Total Earnings',
      render: (item: Service) => <span className="text-center">₹{item.totalEarnings ?? 0}</span>,
    },
  ];

  return (
    <ContentLayout title="Services">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Sub Services */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <BookmarkMinus className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">Total Sub Services</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{analytics.subService}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {/* <TrendingUp className="h-3 w-3 text-emerald-600" /> */}
              {/* <span className="text-emerald-600 font-medium">+12%</span> vs last month */}
            </div>
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
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">Total Earnings</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{analytics.Earning}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {/* <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+8%</span> vs last month */}
            </div>
          </div>
        </div>

        {/* Total Services */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <Bookmark className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">Total Services</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analytics.activeServiceCount + analytics.inactiveServiceCount}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active: <span className="font-semibold text-green-600">{analytics.activeServiceCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Inactive: <span className="font-semibold text-red-600">{analytics.inactiveServiceCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <ListComponent
        title="Service"
        data={services}
        columns={columns}
        isLoading={isLoading}
        addRoute="/services/add"
        editRoute={(slug) => `/services/edit/${slug}`}
        viewRoute={(slug) => `/services/${slug}`}
        deleteEndpoint={(slug) => `/service/V1/delete-service-by-slug/${slug}`}
        onDelete={async (slug: string) => {
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
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="status"
        showStatusToggle={true}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      {/* Modals */}
      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
          setSelectedSlug(null);
        }}
        title="Confirm Status Update"
        description="Are you sure you want to update the status of this service?"
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
        onConfirm={() => handleDeleteService(deleteSlug!)}
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