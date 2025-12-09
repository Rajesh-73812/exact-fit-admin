'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IndianRupee, Home, CheckCircle, XCircle } from 'lucide-react';

import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';

// Icons
import PropertyIcon from '/public/property.png';
import ActiveIcon from '/public/active_plan.svg';
import InactiveIcon from '/public/inactive_plan.svg';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Property {
  slug: string;
  name: string;
  category: string;
  description?: string;
  is_active: boolean;
}

interface PropertyAnalytics {
  totalProperties: number;
  activeProperties: number;
  inactiveProperties: number;
}

export default function PropertyPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<PropertyAnalytics>({
    totalProperties: 0,
    activeProperties: 0,
    inactiveProperties: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/property/V1/get-all-property', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Property[] = items.map((item: any) => ({
        slug: item.slug,
        name: item.name || 'Unnamed Property',
        category: item.category || 'Uncategorized',
        description: item.description || '',
        is_active: item.is_active === true,
      }));

      setProperties([...transformed]); // Only slug used
      setTotal(items.length);

      const active = transformed.filter(p => p.is_active).length;

      setAnalytics({
        totalProperties: transformed.length,
        activeProperties: active,
        inactiveProperties: transformed.length - active,
      });

    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, searchQuery]);

  // Toggle Status
  const handleStatusToggle = async () => {
    if (!selectedSlug) return;

    try {
      setIsLoading(true);
      await apiClient.patch(`/property/V1/update-property/${selectedSlug}`);
      await fetchProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
      setOpenStatusModal(false);
      setSelectedSlug(null);
    }
  };

  // Delete Property
  const handleDelete = async () => {
    if (!selectedSlug) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/property/V1/delete-property/${selectedSlug}`);
      await fetchProperties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete property');
    } finally {
      setIsLoading(false);
      setOpenDeleteModal(false);
      setSelectedSlug(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Property Name',
      render: (item: Property) => (
        <button
          onClick={() => router.push(`/properties/${item.slug}`)}
          className="font-semibold hover:text-violet-600 transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          {item.name}
        </button>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Property) => (
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {item.category}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Property) => (
        <span className={`flex items-center gap-1 text-sm font-medium ${item.is_active ? 'text-green-600' : 'text-red-600'}`}>
          {item.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <ContentLayout title="Properties">
      {/*/* Analytics Cards */
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Properties */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#E31E24] bg-opacity-10 p-2">
              <Image src="/property.png" alt="Total" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#E31E24] uppercase">Total Properties</p>
              <p className="text-2xl font-bold">{analytics.totalProperties}</p>
            </div>
          </div>
        </div>

        {/* Active Properties */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-green-600 bg-opacity-10 p-2">
              <Image src="/active_plan.svg" alt="Active" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">Active</p>
              <p className="text-2xl font-bold">{analytics.activeProperties}</p>
            </div>
          </div>
        </div>

        {/* Inactive Properties */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-red-600 bg-opacity-10 p-2">
              <Image src="/inactive_plan.svg" alt="Inactive" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">Inactive</p>
              <p className="text-2xl font-bold">{analytics.inactiveProperties}</p>
            </div>
          </div>
        </div>

        {/* Add Property Button Card */}
        <div
          className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg p-4 text-white hover:shadow-xl transition cursor-pointer"
          onClick={() => router.push('/property/add')}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Home className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold text-lg">Add New Property</p>
              <p className="text-sm opacity-90">Click to create</p>
            </div>
          </div>
        </div>
      </div>

      }
      <ListComponent
        title="Property"
        data={properties}
        columns={columns}
        isLoading={isLoading}
        addRoute="/property/add"
        editRoute={(slug) => `/property/edit/${slug}`}
        viewRoute={(slug) => `/properties/${slug}`}

        deleteEndpoint={(slug) => `/property/V1/delete-property/${slug}`}
        statusToggleEndpoint={(slug) => `/property/V1/update-property/${slug}`}

        onStatusToggle={async(slug: string) => {
          setSelectedSlug(slug);
          setOpenStatusModal(true);
        }}

        onDelete={async(slug: string) => {
          setSelectedSlug(slug);
          setOpenDeleteModal(true);
        }}

        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        setItemsPerPage={() => {}}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="is_active"
        showStatusToggle={true}
      />

      {/* Status Toggle Modal */}
      <CustomModal
        isOpen={openStatusModal}
        onRequestClose={() => {
          setOpenStatusModal(false);
          setSelectedSlug(null);
        }}
        title="Toggle Property Status"
        description="Are you sure you want to change the status of this property?"
        onConfirm={handleStatusToggle}
        confirmText="Yes, Update Status"
      />

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={openDeleteModal}
        onRequestClose={() => {
          setOpenDeleteModal(false);
          setSelectedSlug(null);
        }}
        title="Delete Property"
        description="This action cannot be undone. This will permanently delete the property."
        onConfirm={handleDelete}
        confirmText="Delete Permanently"
      />
    </ContentLayout>
  );
}