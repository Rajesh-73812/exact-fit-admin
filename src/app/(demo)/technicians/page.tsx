'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, UserCheck, Briefcase, MapPin } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Total Technicians</p>
              <p className="text-3xl font-bold mt-1">{total}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="h-7 w-7 text-indigo-600" />
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
              <Briefcase className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
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
      </div>

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