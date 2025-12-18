'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, UserCheck, Briefcase, MapPin, UserX } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

interface Address {
  emirate?: string;
  location?: string;
}

interface Technician {
  id: string;
  fullname: string | null;
  email: string | null;
  mobile: string | null;
  service_type: string | null;
  profile_pic: string | null;
  is_Active: number;
  addresses: Address[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    rows: Technician[];
    count: number;
    activeCount: number;
    inactiveCount: number;
  };
}

export default function TechniciansPage() {
  const router = useRouter();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusModal, setStatusModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');

  // Fetch technicians
  useEffect(() => {
    fetchTechnicians();
  }, [page, limit, searchQuery]);

  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<ApiResponse>('/technicians/V1/get-all', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
        },
      });

      const { rows, count, activeCount: active, inactiveCount: inactive } = data.data;

      setTechnicians(rows);
      setTotal(count);
      setActiveCount(active);
      setInactiveCount(inactive);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load technicians');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle status
  const confirmStatusToggle = async () => {
    if (!selectedId) return;
    try {
      await apiClient.patch(`/technicians/V1/toggle-status/${selectedId}`);
      toast.success('Technician status updated');
      fetchTechnicians();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusModal(false);
      setSelectedId('');
    }
  };

  // Delete technician
  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await apiClient.delete(`/technicians/V1/delete-technician/${selectedId}`);
      toast.success('Technician deleted successfully');
      fetchTechnicians();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete technician');
    } finally {
      setDeleteModal(false);
      setSelectedId('');
    }
  };

  const columns = [
    {
      key: 'technician',
      header: 'Technician',
      render: (item: Technician) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 border">
            {item.profile_pic ? (
              <Image
                src={item.profile_pic}
                alt={item.fullname || 'Technician'}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-lg">
                {item.fullname?.[0]?.toUpperCase() || 'T'}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {item.fullname || <span className="text-gray-400 italic">No name</span>}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {item.service_type || 'Not assigned'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: Technician) => (
        <div className="text-sm">
          <p className="font-medium">{item.mobile || '—'}</p>
          <p className="text-xs text-gray-500">{item.email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: Technician) => {
        const addr = item.addresses?.[0];
        const display = addr
          ? [addr.emirate, addr.location].filter(Boolean).join(', ') || '—'
          : 'No location';

        return (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{display}</span>
          </div>
        );
      },
    },
    // {
    //   key: 'status',
    //   header: 'Status',
    //   render: (item: Technician) => (
    //     <Badge variant={item.is_Active ? 'default' : 'secondary'}>
    //       {item.is_Active ? 'Active' : 'Inactive'}
    //     </Badge>
    //   ),
    // },
  ];

  return (
    <ContentLayout title="Technicians">
      {/* Analytics Cards */}
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
          title="Technician"
          data={technicians}
          columns={columns}
          isLoading={isLoading}
          addRoute="/technicians/add"
          editRoute={(id: string) => `/technicians/edit/${id}`}
          viewRoute={(id: string) => `/technicians/view/${id}`}
          deleteEndpoint={(id: string) => `/technicians/V1/delete-technician/${id}`}
          onStatusToggle={async(id: string) => {
            setSelectedId(id);
            setStatusModal(true);
          }}
          onDelete={async(id: string) => {
            setSelectedId(id);
            setDeleteModal(true);
          }}
          currentPage={page}
          setCurrentPage={setPage}
          itemsPerPage={limit}
          setItemsPerPage={setLimit}
          totalItems={total}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusField="is_Active"
          showStatusToggle={true}
          // showView={true}
        />

      {/* Status Toggle Modal */}
      <CustomModal
        isOpen={statusModal}
        onRequestClose={() => {
          setStatusModal(false);
          setSelectedId('');
        }}
        title="Change Technician Status"
        description="Are you sure you want to toggle this technician's status?"
        onConfirm={confirmStatusToggle}
        confirmText="Yes, Update"
      />

      {/* Delete Modal */}
      <CustomModal
        isOpen={deleteModal}
        onRequestClose={() => {
          setDeleteModal(false);
          setSelectedId('');
        }}
        title="Delete Technician"
        description="This action cannot be undone. The technician will be permanently removed."
        onConfirm={confirmDelete}
        confirmText="Delete Permanently"
      />
    </ContentLayout>
  );
}