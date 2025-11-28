'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IndianRupee } from 'lucide-react';

import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';

// Icons
import ActivePlanIcon from '/public/active_plan.svg';
import InActivePlanIcon from '/public/inactive_plan.svg';
import PlanIcon from '/public/plan.svg';

interface Plan {
    name: string;
    slug: string;
    base_price: number;
    duration_in_days: number;
    scheduled_visits_count: number;
    stars?: number;
    is_active: boolean;
    category: string;
    description?: string;
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
            const { data } = await apiClient.get('/plan/V1/get-all-plan', {
                params: { page, limit: 10, search: searchQuery || undefined },
            });

            const items = data.data || [];
            const transformed: Plan[] = items.map((item: any) => ({
                name: item.name || 'Unnamed Plan',
                slug: item.slug || '',
                base_price: parseFloat(item.base_price) || 0,
                duration_in_days: Number(item.duration_in_days) || 365,
                scheduled_visits_count: Number(item.scheduled_visits_count) || 0,
                stars: item.stars || 0,
                category: item.category || '',
                is_active: item.is_active === true,
                description: item.description || '',
                createdAt: item.createdAt || new Date().toISOString(),
            }));

            setPlans(transformed);
            setTotal(items.length); // or data.pagination?.total if exists

            const active = transformed.filter(p => p.is_active).length;
            const revenue = transformed.reduce((sum, p) => sum + p.base_price, 0);

            setAnalytics({
                totalPlans: transformed.length,
                activePlans: active,
                inactivePlans: transformed.length - active,
                totalRevenue: revenue,
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

    // Toggle Status - called from modal
    const handleStatusToggle = async () => {
        if (!selectedSlug) return;

        try {
            setIsLoading(true);
            await apiClient.patch(`/plan/V1/update-plan-status/${selectedSlug}`);
            await fetchPlans();
        } catch (err: any) {
            console.error('Toggle failed:', err);
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setIsLoading(false);
            setOpenDialog(false);
            setSelectedSlug(null);
        }
    };

    // Delete Plan - called from modal
    const handleDeletePlan = async () => {
        if (!deleteSlug) return;

        try {
            setIsLoading(true);
            await apiClient.delete(`/plan/V1/delete-plan/${deleteSlug}`);
            await fetchPlans();
        } catch (err: any) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.message || 'Failed to delete plan');
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
                    className="font-semibold hover:text-violet-600 transition-colors flex items-center gap-1"
                >
                    {item.name}
                    {item.stars ? ` ${'★'.repeat(item.stars)}` : ''}
                </button>
            ),
        },
        {
            key: 'category',
            header: 'Category',
            render: (item: Plan) => (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{item.category}</span>
            ),
        },
        {
            key: 'base_price',
            header: 'Price',
            render: (item: Plan) => (
                <span className="font-medium text-green-600">
                    ₹{item.base_price.toLocaleString('en-IN')}
                </span>
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
            header: 'Visits',
            render: (item: Plan) => (
                <span className="text-center font-medium">{item.scheduled_visits_count}</span>
            ),
        },
    ];

    return (
        <ContentLayout title="Subscription Plans">
            {/* Analytics Cards - Same Design as Services */}
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
                            <Image src={ActivePlanIcon} alt="Active" width={20} height={20} />
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
                            <Image src={InActivePlanIcon} alt="Inactive" width={20} height={20} />
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

            {/* List Component - EXACTLY like Services */}
            <ListComponent
                title="Plan"
                data={plans}
                columns={columns}
                isLoading={isLoading}
                addRoute="/plans/add"
                editRoute={(slug) => `/plans/edit/${slug}`}
                viewRoute={(slug) => `/plans/view/${slug}`}

                // Endpoints
                deleteEndpoint={(slug) => `/plan/V1/delete-plan/${slug}`}
                statusToggleEndpoint={(slug) => `/plan/V1/update-plan-status/${slug}`}

                // Critical Fix: Accept 2 args from ListComponent
                onStatusToggle={async (slug: string, _newStatus: string) => {
                    setSelectedSlug(slug);
                    setOpenDialog(true);
                }}

                onDelete={async (slug: string) => {
                    setDeleteSlug(slug);
                    setDeleteDialog(true);
                }}

                currentPage={page}
                setCurrentPage={setPage}
                itemsPerPage={10}
                setItemsPerPage={() => { }}
                totalItems={total}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusField="is_active"  // This is the actual field in your data
                showStatusToggle={true}
            />

            {/* Status Toggle Modal */}
            <CustomModal
                isOpen={openDialog}
                onRequestClose={() => {
                    setOpenDialog(false);
                    setSelectedSlug(null);
                }}
                title="Toggle Plan Status"
                description={`Are you sure you want to change the status of "${selectedSlug}"?`}
                onConfirm={handleStatusToggle}
                confirmText="Yes, Update Status"
            />

            {/* Delete Modal */}
            <CustomModal
                isOpen={deleteDialog}
                onRequestClose={() => {
                    setDeleteDialog(false);
                    setDeleteSlug(null);
                }}
                title="Delete Plan"
                description={`Are you sure you want to delete "${deleteSlug}"? This cannot be undone.`}
                onConfirm={handleDeletePlan}
                confirmText="Delete Permanently"
            />
        </ContentLayout>
    );
}