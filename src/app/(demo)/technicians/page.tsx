'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, UserCheck, Briefcase } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import apiClient from '@/lib/apiClient';   // <-- direct import
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Technician {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  service_category: string;
  location: string;
  status: 'active' | 'inactive';
  profile_pic?: string;
  total_jobs?: number;
  rating?: number;
  is_active: boolean;
}

export default function TechniciansPage() {
  const router = useRouter();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_desc');

  // Modals
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Summary stats
  const [summary, setSummary] = useState({ total: 0, active: 0, jobs: 0 });

  /* -------------------------------------------------
   *  Fetch Technicians – DIRECT API CALL
   * ------------------------------------------------- */
  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/technicians/get-all', {
        params: { page, limit, search, sort },
      });
      console.log(res,"all technicians")

      const { data, total: count } = res.data.data;
      setTechnicians(data);
      setTotal(count);

      const active = data.filter((t: Technician) => t.is_active).length;
      setSummary({ total: count, active, jobs: 0 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load technicians');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  /* -------------------------------------------------
   *  Toggle Status – DIRECT API CALL
   * ------------------------------------------------- */
  const handleStatusToggle = async () => {
    if (!selectedId) return;
    try {
      await apiClient.put(`/technicians/${selectedId}/toggle-status`);
      toast.success('Status updated');
      fetchTechnicians();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  /* -------------------------------------------------
   *  Delete Technician – DIRECT API CALL
   * ------------------------------------------------- */
  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await apiClient.delete(`/technicians/${selectedId}`);
      toast.success('Technician deleted');
      fetchTechnicians();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteDialog(false);
      setSelectedId(null);
    }
  };

  /* -------------------------------------------------
   *  Table Columns
   * ------------------------------------------------- */
  const columns = [
    {
      key: 'profile',
      header: 'Technician',
      render: (item: Technician) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
            {item.profile_pic ? (
              <Image
                src={item.profile_pic}
                alt={item.fullname}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm">
                {item.fullname.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{item.fullname}</p>
            <p className="text-xs text-gray-500">{item.service_category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: Technician) => (
        <div>
          <p className="text-sm">{item.email}</p>
          <p className="text-xs text-gray-500">{item.mobile}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: Technician) => <span className="text-sm">{item.location}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Technician) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Technicians">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-purple-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-indigo-100 p-1.5 flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <h4 className="text-xs font-semibold text-indigo-600 uppercase">Total Technicians</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{summary.total}</p>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-purple-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-indigo-100 p-1.5 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <h4 className="text-xs font-semibold text-indigo-600 uppercase">Active</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{summary.active}</p>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-purple-600 rounded" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-indigo-100 p-1.5 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-indigo-600" />
              </div>
              <h4 className="text-xs font-semibold text-indigo-600 uppercase">Total Jobs</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>

      {/* List Component */}
      <ListComponent
        title="Technician"
        data={technicians}
        columns={columns}
        isLoading={loading}
        addRoute="/technicians/add"
        editRoute={(id) => `/technicians/edit/${id}`}
        viewRoute={(id) => `/technicians/${id}`}
        onDelete={(id) => {
          setSelectedId(id);
          setDeleteDialog(true);
        }}
        onStatusToggle={(id) => {
          setSelectedId(id);
          setOpenDialog(true);
        }}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={total}
        searchQuery={search}
        setSearchQuery={setSearch}
        statusField="is_active"
        showStatusToggle={true}
      />

      {/* Status Toggle Modal */}
      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => setOpenDialog(false)}
        title="Toggle Status"
        description="Are you sure you want to change the technician's status?"
        onConfirm={handleStatusToggle}
        confirmText="Confirm"
      />

      {/* Delete Modal */}
      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => setDeleteDialog(false)}
        title="Delete Technician"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </ContentLayout>
  );
}