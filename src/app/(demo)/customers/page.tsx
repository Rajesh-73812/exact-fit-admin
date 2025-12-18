'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

interface Customer {
  id: string;
  fullname: string | null;
  email: string | null;
  mobile: string;
  is_active: boolean;
  plan_start_date?: string;
  plan_end_date?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    rows: Customer[];
    count: number;
    activeCount: number;
    deactiveCount: number;
  };
}

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [statusModal, setStatusModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  // Fetch customers
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse>('/auth/V1/get-all-customers', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });

      const { rows, count, activeCount: active, deactiveCount: inactive } = data.data;

      setCustomers(rows);
      setTotal(count);
      setActiveCount(active);
      setInactiveCount(inactive);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, searchQuery]);

  // Toggle status
  const handleStatusToggle = async () => {
    if (!selectedId) return;

    try {
      await apiClient.patch(`/auth/V1/update-status/${selectedId}`);
      toast.success('Customer status updated');
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusModal(false);
      setSelectedId('');
    }
  };

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 border">
            {item.fullname ? (
              <div className="flex h-full w-full items-center justify-center bg-teal-100 text-teal-600 font-bold">
                {item.fullname.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600 text-xs">
                —
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {item.fullname || <span className="text-gray-400 italic">No name</span>}
            </p>
           
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: Customer) => (
        <div className="text-sm">
          <p>{item.email || <span className="text-gray-400">—</span>}</p>
           <p className="text-xs text-gray-500">{item.mobile}</p>
        </div>
      ),
    },
    {
  key: 'Plan_start_date',
  header: 'Plan',
  render: (item: Customer) => {
    // Destructure the start and end date
    const { plan_start_date, plan_end_date } = item;

    // Check if both start and end date are present
    if (plan_start_date && plan_end_date) {
      return (
        <div className="text-sm">
          <p>{new Date(plan_start_date).toLocaleDateString()} → {new Date(plan_end_date).toLocaleDateString()}</p>
        </div>
      );
    }

    // If either or both dates are missing, show "No plan"
    return (
      <div className="text-sm">
        <p className="text-gray-400">No plan</p>
      </div>
    );
  },
}

  ];

  return (
    <ContentLayout title="Customers">
      {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Customers */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <Users className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Total Customers
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{total}</p>
          </div>
        </div>

        {/* Active Customers */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Active
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{activeCount}</p>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E31E24] rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-[#E31E24] bg-opacity-10 p-1.5 flex items-center justify-center">
                <UserX className="h-4 w-4 text-black" />
              </div>
              <h4 className="text-xs font-semibold text-[#E31E24] uppercase">
                Inactive
              </h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
        <ListComponent
          title="Customer"
          data={customers}
          columns={columns}
          isLoading={isLoading}
          addRoute="/customers/add"
          editRoute={(id) => `/customers/edit/${id}`}
          deleteEndpoint={(id) => `/auth/V1/delete-customer/${id}`}
          viewRoute={(id) => `/customers/view/${id}`}
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={limit}
          setItemsPerPage={setLimit}
          totalItems={total}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusField="is_active"
          showStatusToggle={true}
          onStatusToggle={async(id) => {
            setSelectedId(id);
            setStatusModal(true);
          }}
        />

      {/* Status Toggle Confirmation Modal */}
      <CustomModal
        isOpen={statusModal}
        onRequestClose={() => {
          setStatusModal(false);
          setSelectedId('');
        }}
        title="Update Customer Status"
        description="Are you sure you want to toggle this customer's status?"
        onConfirm={handleStatusToggle}
        confirmText="Yes, Update Status"
      />
    </ContentLayout>
  );
}