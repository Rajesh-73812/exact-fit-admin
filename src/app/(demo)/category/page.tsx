'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  TrendingUp,
  IndianRupee,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import Loader from '@/components/utils/Loader';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Category {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  productsCount?: number;
  totalEarnings?: number;
}

interface CategoryAnalytics {
  product: number;
  Earning: number;
  activeCategories: number;
  inactiveCategories: number;
}

export default function CategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CategoryAnalytics>({
    product: 0,
    Earning: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

  /* -------------------------------------------------- FETCH -------------------------------------------------- */
  useEffect(() => {
    fetchCategories();
    fetchAnalytics();
  }, [page, searchQuery]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await apiClient.get('/v1/catagory/get-analytics');
      setAnalytics({
        product: data.TotalProduct || 0,
        Earning: data.TotalEarning || 0,
        activeCategories: data.ActiveCity || 0,
        inactiveCategories: data.InActiveCity || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/v1/catagory/get-all-catagory', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Category[] = items.map((cat: any) => ({
        _id: cat._id || '',
        name: cat.name || '',
        description: cat.description || '',
        status: cat.status || 'inactive',
        image: cat.image || '',
        createdAt: cat.createdAt || new Date().toISOString(),
        productsCount: cat.productsCount || 0,
        totalEarnings: cat.totalEarnings || 0,
      }));

      setCategories(transformed);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------- TOGGLE -------------------------------------------------- */
  const handleStatusToggle = async (id: string) => {
    if (!id) return;
    try {
      setIsLoading(true);
      await apiClient.patch(`/v1/catagory/change-status/${id}`);
      await fetchCategories();
      await fetchAnalytics();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const openToggleModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setOpenDialog(true);
  };

  /* -------------------------------------------------- COLUMNS -------------------------------------------------- */
  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (item: Category) =>
        item.image ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
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
      render: (item: Category) => (
        <button
          onClick={() => router.push(`/categories/${item._id}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.name}
        </button>
      ),
    },
    { key: 'description', header: 'Description' },
    {
      key: 'productsCount',
      header: 'Total Products',
      render: (item: Category) => <span className="text-center">{item.productsCount}</span>,
    },
    {
      key: 'totalEarnings',
      header: 'Total Earnings',
      render: (item: Category) => <span className="text-center">₹{item.totalEarnings}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (item: Category) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  /* -------------------------------------------------- RENDER -------------------------------------------------- */
  return (
    <ContentLayout title="Categories">
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

        {/* Total Categories */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Categories</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analyticsLoading ? '...' : analytics.activeCategories + analytics.inactiveCategories}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active:{' '}
                <span className="font-semibold text-green-600">
                  {analyticsLoading ? '...' : analytics.activeCategories}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Inactive:{' '}
                <span className="font-semibold text-red-600">
                  {analyticsLoading ? '...' : analytics.inactiveCategories}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ListComponent */}
      <ListComponent
        title="Category"
        data={categories}
        columns={columns}
        isLoading={isLoading}
        addRoute="/categories/add"
        editRoute={(id) => `/categories/edit/${id}`}
        viewRoute={(id) => `/categories/${id}`}
        deleteEndpoint={(id) => `/v1/catagory/${id}`}
        statusToggleEndpoint={(id) => `/v1/catagory/change-status/${id}`}
        onStatusToggle={async (id) => {
          setSelectedId(id);
          setOpenDialog(true);
        }}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        setItemsPerPage={() => {}}
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
          setSelectedId(null);
        }}
        title="Confirm Status Update"
        description="Are you sure you want to update the active status of this category?"
        onConfirm={() => handleStatusToggle(selectedId!)}
        confirmText="Confirm"
      />
    </ContentLayout>
  );
}