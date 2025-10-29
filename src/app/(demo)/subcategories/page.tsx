'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, IndianRupee, Package, Image as ImageIcon, Plus,} from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import Loader from '@/components/utils/Loader';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Button } from '@/components/ui/button';

interface Subcategory {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  category?: { name: string; _id: string };
  createdAt: string;
  productsCount?: number;
  totalEarnings?: number;
}

interface SubcategoryAnalytics {
  totalSubcategories: number;
  activeSubcategories: number;
  inactiveSubcategories: number;
  totalProducts: number;
  totalEarnings: number;
}

export default function SubcategoriesPage() {
  const router = useRouter();

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SubcategoryAnalytics>({
    totalSubcategories: 0,
    activeSubcategories: 0,
    inactiveSubcategories: 0,
    totalProducts: 0,
    totalEarnings: 0,
  });

  /* -------------------------------------------------- FETCH -------------------------------------------------- */
  useEffect(() => {
    fetchSubcategories();
    fetchAnalytics();
  }, [page, searchQuery]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data } = await apiClient.get('/v1/subcategory/analytics');
      setAnalytics(data.data || analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/v1/subcategory/all', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.subcategories || [];
      const transformed: Subcategory[] = items.map((s: any) => ({
        _id: s._id,
        name: s.name,
        description: s.description,
        status: s.status || 'inactive',
        image: s.image,
        category: s.category,
        createdAt: s.createdAt,
        productsCount: s.productsCount ?? 0,
        totalEarnings: s.totalEarnings ?? 0,
      }));

      setSubcategories(transformed);
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
      await apiClient.patch(`/v1/subcategory/${id}/change-status`);
      await fetchSubcategories();
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
      render: (item: Subcategory) =>
        item.image ? (
          <div className="relative h-10 w-10 rounded-md overflow-hidden">
            <Image src={item.image} alt={item.name} fill loading="lazy" className="object-cover" />
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
      render: (item: Subcategory) => (
        <button
          onClick={() => router.push(`/subcategories/${item._id}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.name}
        </button>
      ),
    },
    { key: 'description', header: 'Description' },
    {
      key: 'category',
      header: 'Category',
      render: (item: Subcategory) => item.category?.name || '—',
    },
    {
      key: 'productsCount',
      header: 'Products',
      render: (item: Subcategory) => <span className="text-center">{item.productsCount}</span>,
    },
    {
      key: 'totalEarnings',
      header: 'Earnings',
      render: (item: Subcategory) => <span className="text-center">₹{item.totalEarnings}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item: Subcategory) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  /* -------------------------------------------------- RENDER -------------------------------------------------- */

  return (
    <ContentLayout title="Subcategories">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Products */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Products</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{analytics.totalProducts}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+10%</span> vs last month
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Earnings</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{analytics.totalEarnings}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+15%</span> vs last month
            </div>
          </div>
        </div>

        {/* Total Subcategories */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Subcategories</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analyticsLoading ? '...' : analytics.totalSubcategories}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Active: <span className="font-semibold text-green-600">
                  {analyticsLoading ? '...' : analytics.activeSubcategories}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Inactive: <span className="font-semibold text-red-600">
                  {analyticsLoading ? '...' : analytics.inactiveSubcategories}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {/* <div className="flex justify-end mb-4">
        <Button
          onClick={() => router.push('/subcategories/add')}
          className=" text-white hover:from-violet-700 hover:to-fuchsia-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subcategory
        </Button>
      </div> */}

      {/* ---------- ListComponent (replaces manual table) ---------- */}
      <ListComponent
        title="Subcategory"
        data={subcategories}
        columns={columns}
        isLoading={isLoading}
        addRoute="/subcategories/add"
        editRoute={(id) => `/subcategories/edit/${id}`}
        viewRoute={(id) => `/subcategories/${id}`}
        deleteEndpoint={(id) => `/v1/subcategory/${id}`}
        statusToggleEndpoint={(id) => `/v1/subcategory/${id}/change-status`}
        onStatusToggle={async (id) => {
          setSelectedId(id);
          setOpenDialog(true);
        }}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        setItemsPerPage={() => {} /* fixed 10 */}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="status"
        showStatusToggle={true}
      />

      {/* ---------- Status Modal ---------- */}
      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
          setSelectedId(null);
        }}
        title="Confirm Status Update"
        description="Are you sure you want to update the active status of this subcategory?"
        onConfirm={() => handleStatusToggle(selectedId!)}
        confirmText="Confirm"
      />
    </ContentLayout>
  );
}