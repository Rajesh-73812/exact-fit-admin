'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, IndianRupee, Package, Image as ImageIcon } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Category {
  title: string;
  category_slug: string;
  position: string;
  status: 'active' | 'inactive';
  image_url?: string;
  image_alt?: string;
  createdAt: string;
  productsCount?: number;
  totalEarnings?: number;
}

interface CategoryAnalytics {
  product: number;
  Earning: number;
  activeCategoryCount: number;
  inactiveCategoryCount: number;
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CategoryAnalytics>({
    product: 0,
    Earning: 0,
    activeCategoryCount: 0,
    inactiveCategoryCount: 0,
  });

  /* -------------------------------------------------- FETCH -------------------------------------------------- */
  useEffect(() => {
    fetchCategories();
    fetchAnalytics();
  }, [page, searchQuery]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await apiClient.get('/category/V1/get-all-category');
      setAnalytics({
        product: data.TotalProduct || 0,
        Earning: data.TotalEarning || 0,
        activeCategoryCount: data.activeCategoryCount || 0,
        inactiveCategoryCount: data.inactiveCategoryCount || 0,
      });

      console.log(data, "dataaaaaaaaaaaaa")
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/category/V1/get-all-category', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Category[] = items.map((cat: any) => ({
        title: cat.title || '',
        category_slug: cat.category_slug || '',
        position: cat.position?.toString() || '',
        status: cat.status === 'active' ? 'active' : 'inactive',
        image_url: cat.image_url || '',
        image_alt: cat.image_alt || '',
        createdAt: cat.createdAt || new Date().toISOString(),
        productsCount: cat.productsCount || 0,
        totalEarnings: cat.totalEarnings || 0,
      }));

      setCategories(transformed);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------------- TOGGLE -------------------------------------------------- */
  const handleStatusToggle = async (slug: string) => {
    if (!slug) return;
    try {
      setIsLoading(true);
      await apiClient.patch(`/category/V1/update-status/${slug}`);
      await fetchCategories();
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
  const handleDeleteCategory = async (slug: string) => {
    alert(slug);
    if (!slug) return;
    try {
      setIsLoading(true);
      await apiClient.delete(`/category/V1/delete-category-by-slug/${slug}`);
      await fetchCategories();
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
      render: (item: Category) =>
        item.image_url ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.image_alt || 'Category Image'}
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
          onClick={() => router.push(`/categories/${item.category_slug}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.title}
        </button>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      render: (item: Category) => <span className="text-center">{item.position}</span>,
    },
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
              {analyticsLoading ? '...' : analytics.activeCategoryCount + analytics.inactiveCategoryCount}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active:{' '}
                <span className="font-semibold text-green-600">
                  {analyticsLoading ? '...' : analytics.activeCategoryCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Inactive:{' '}
                <span className="font-semibold text-red-600">
                  {analyticsLoading ? '...' : analytics.inactiveCategoryCount}
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
        editRoute={(slug) => `/categories/edit/${slug}`}
        viewRoute={(slug) => `/categories/${slug}`}
        deleteEndpoint={(slug) => `/category/V1/delete-category-by-slug/${slug}`}
        onDelete={async (slug) => {
          setDeleteSlug(slug);
          setDeleteDialog(true);
        }}
        statusToggleEndpoint={(slug) => `/category/V1/update-status/${slug}`}
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
        description="Are you sure you want to update the active status of this category?"
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
        description="Are you sure you want to delete this category?"
        onConfirm={async () => { handleDeleteCategory(deleteSlug!)  }}
        confirmText="Confirm"
      />
    </ContentLayout>
  );
}