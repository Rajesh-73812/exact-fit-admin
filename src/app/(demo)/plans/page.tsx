'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  TrendingUp,
  IndianRupee,
  Bookmark,
  BookmarkMinus,
} from 'lucide-react';

import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';

// SVG Icons from public folder
import ActivePlanIcon from '/public/active_plan.svg';
import InActivePlanIcon from '/public/inactive_plan.svg';
import PlanIcon from '/public/plan.svg';

interface Plan {
  name: string;
  slug: string;
  position: string;
  status: 'active' | 'inactive';
  base_price: number;
  duration_in_days: number;
  stars?: number;
  scheduled_visits_count: number;
  createdAt: string;
}

interface PlanAnalytics {
  totalPlans: number;
  activePlans: number;
  inactivePlans: number;
  totalRevenue: number;
}

export default function PlanPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [analytics, setAnalytics] = useState<PlanAnalytics>({
    totalPlans: 0,
    activePlans: 0,
    inactivePlans: 0,
    totalRevenue: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/subscription-plan/V1/get-all-plans', {
        params: { page, limit: 10, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Plan[] = items.map((item: any) => ({
        name: item.name || '',
        slug: item.slug || '',
        position: item.position?.toString() || '0',
        status: item.is_active ? 'active' : 'inactive',
        base_price: Number(item.base_price) || 0,
        duration_in_days: item.duration_in_days || 365,
        stars: item.stars || 0,
        scheduled_visits_count: item.scheduled_visits_count || 1,
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      setPlans(transformed);
      setTotal(data.pagination?.total || 0);

      setAnalytics({
        totalPlans: data.totalPlans || 0,
        activePlans: data.activePlans || 0,
        inactivePlans: data.inactivePlans || 0,
        totalRevenue: data.totalRevenue || 0,
      });
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [page, searchQuery]);

  const handleStatusToggle = async (slug: string) => {
    try {
      setIsLoading(true);
      await apiClient.patch(`/subscription-plan/V1/toggle-status/${slug}`);
      await fetchPlans();
    } catch (err) {
      console.error('Failed to toggle plan status:', err);
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedSlug(null);
    }
  };

  const handleDeletePlan = async (slug: string) => {
    try {
      setIsLoading(true);
      await apiClient.delete(`/subscription-plan/V1/delete/${slug}`);
      await fetchPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteSlug(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Plan Name',
      render: (item: Plan) => (
        <button
          onClick={() => router.push(`/plans/${item.slug}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.name}
          {item.stars ? ` ${'★'.repeat(item.stars)}` : ''}
        </button>
      ),
    },
    {
      key: 'base_price',
      header: 'Base Price',
      render: (item: Plan) => (
        <span className="font-medium text-green-600">₹{item.base_price.toLocaleString('en-IN')}</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (item: Plan) => (
        <span>{item.duration_in_days === 365 ? '1 Year' : `${item.duration_in_days} Days`}</span>
      ),
    },
    {
      key: 'visits',
      header: 'Scheduled Visits',
      render: (item: Plan) => (
        <span className="text-center font-medium">{item.scheduled_visits_count}</span>
      ),
    },
  ];

  return (
    <ContentLayout title="Subscription Plans">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Plans */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#E31E24] bg-opacity-10 p-2">
              <Image src={PlanIcon} alt="Total Plans" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#E31E24] uppercase">Total Plans</p>
              <p className="text-2xl font-bold">{analytics.totalPlans}</p>
            </div>
          </div>
        </div>

        {/* Active Plans */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-green-600 bg-opacity-10 p-2">
              <Image src={ActivePlanIcon} alt="Active Plans" width={20} height={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">Active Plans</p>
              <p className="text-2xl font-bold">{analytics.activePlans}</p>
            </div>
          </div>
        </div>

        {/* Inactive Plans */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-red-600 bg-opacity-10 p-2">
              <Image src={InActivePlanIcon} alt="Inactive Plans" width={20} height={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase">Inactive Plans</p>
              <p className="text-2xl font-bold">{analytics.inactivePlans}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#E31E24] bg-opacity-10 p-2">
              <IndianRupee className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#E31E24] uppercase">Total Revenue</p>
              <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      <ListComponent
        title="Subscription Plans"
        data={plans}
        columns={columns}
        isLoading={isLoading}
        addRoute="/plans/add"
        editRoute={(slug) => `/plans/edit/${slug}`}
        viewRoute={(slug) => `/plans/${slug}`}
        onDelete={async (slug: string) => {
          setDeleteSlug(slug);
          setDeleteDialog(true);
        }}
        onStatusToggle={async (slug: string) => {
          setSelectedSlug(slug);
          setOpenDialog(true);
        }}
        statusToggleEndpoint={(slug) => `/subscription-plan/V1/toggle-status/${slug}`}
        deleteEndpoint={(slug) => `/subscription-plan/V1/delete/${slug}`}
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

      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
          setSelectedSlug(null);
        }}
        title="Toggle Plan Status"
        description="Are you sure you want to change the status of this plan?"
        onConfirm={() => handleStatusToggle(selectedSlug!)}
        confirmText="Confirm"
      />

      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => {
          setDeleteDialog(false);
          setDeleteSlug(null);
        }}
        title="Delete Plan"
        description="This action cannot be undone. Are you sure?"
        onConfirm={() => handleDeletePlan(deleteSlug!)}
        confirmText="Delete Permanently"
      />
    </ContentLayout>
  );
}