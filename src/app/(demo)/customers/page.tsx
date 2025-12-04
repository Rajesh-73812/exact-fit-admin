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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{total}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <Users className="h-7 w-7 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <UserCheck className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{inactiveCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
      </div>

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