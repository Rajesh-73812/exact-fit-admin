'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

import apiClient from '@/lib/apiClient';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
// import Loader from '@/components/demo/utils/Loader';
// import { useNotification } from '@/components/ui/NotificationContext';

interface User {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  role: string;
  profile_pic?: string;
  is_active: boolean;
  created_at?: string;
}

interface Column {
  key: string;
  header: string;
  render?: (item: User) => React.ReactElement;
}

const AdminsListPage: React.FC = () => {
  const router = useRouter();
  // const { addNotification } = useNotification();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // status / delete modals
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/auth/V1/get-all', {
        withCredentials: true,
        params: {
          page: currentPage,
          limit: itemsPerPage,
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
        },
      });

      // Expected backend result from getAllAdmin:
      // {
      //   success: true,
      //   message: 'Admins fetched successfully',
      //   data: [...],
      //   pagination: { totalItems, totalPages, currentPage, limit }
      // }
      const { data, pagination } = response.data;

      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id || '',
        fullname: user.fullname || '',
        email: user.email || '',
        mobile: user.mobile || '',
        role: user.role || '',
        profile_pic: user.profile_pic || '',
        is_active: !!user.is_active,
        created_at: user.created_at || user.createdAt || '',
      }));

      setUsers(transformedUsers);
      setTotalItems(pagination?.totalItems ?? transformedUsers.length);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // addNotification({
      //   title: 'Error',
      //   description: 'Failed to fetch users.',
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleDeleteAdmin = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/auth/V1/delete-by-id/${id}`, {
        withCredentials: true,
      });

      // Optimistic refresh
      await fetchUsers();

      // addNotification({
      //   title: 'Success',
      //   description: 'Admin deleted successfully.',
      //   variant: 'default',
      // });
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      // addNotification({
      //   title: 'Error',
      //   description: error?.response?.data?.message || 'Failed to delete admin.',
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleStatusToggle = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      await apiClient.patch(`/auth/V1/update-status/${id}`, null, {
        withCredentials: true,
      });

      await fetchUsers();

      // addNotification({
      //   title: 'Success',
      //   description: 'Admin status updated successfully.',
      //   variant: 'default',
      // });
    } catch (error: any) {
      console.error('Error toggling status:', error);
      // addNotification({
      //   title: 'Error',
      //   description: error?.response?.data?.message || 'Failed to update admin status.',
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const columns: Column[] = [
    {
      key: 'profile_pic',
      header: 'Profile Picture',
      render: (item) =>
        item.profile_pic ? (
          <div
            className="relative h-10 w-10 rounded-md overflow-hidden cursor-pointer"
            onClick={() => setPreviewImage(item.profile_pic || null)}
          >
            <Image
              src={item.profile_pic}
              fill
              alt={item.fullname}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        ),
    },
    {
      key: 'fullname',
      header: 'Full Name',
      render: (item) => (
        <button
          onClick={() => router.push(`/admin/view/${item.id}`)}
          className="hover:text-violet-600 transition-colors"
        >
          {item.fullname || '-'}
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <button
          onClick={() => router.push(`/admin/view/${item.id}`)}
          className="hover:text-violet-600 transition-colors"
        >
          {item.email || '-'}
        </button>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item) => (
        <button
          onClick={() => router.push(`/admin/view/${item.id}`)}
          className="hover:text-violet-600 transition-colors"
        >
          {item.mobile || '-'}
        </button>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <span>{item.role}</span>,
    },
  ];

  return (
    <div>
      <ContentLayout title="Admins">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Admins</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* {isLoading && <Loader />} */}

        <ListComponent
          title="Admin"
          data={users}
          columns={columns}
          isLoading={isLoading}
          addRoute="/admin/add"
          editRoute={(id: string) => `/admin/edit/${id}`}
          viewRoute={(id: string) => `/admin/view/${id}`}
          deleteEndpoint={(id: string) => `/v1/admin/delete/${id}`}
          statusToggleEndpoint={(id: string) => `/v1/admin/toggle-status/${id}`}
          onStatusToggle={async (id: string) => {
            setSelectedId(id);
            setOpenDialog(true);
          }}
          onDelete={async (id: string) => {
            setDeleteId(id);
            setDeleteDialog(true);
          }}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          totalItems={totalItems}
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          statusField="is_active"
        />

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative">
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="rounded shadow-lg object-contain max-h-[90vh] max-w-[90vw]"
              />
              <button
                className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Status Confirm Modal */}
        <CustomModal
          isOpen={openDialog}
          onRequestClose={() => {
            setOpenDialog(false);
            setSelectedId(null);
          }}
          title="Confirm Status Update"
          description="Are you sure you want to update the status of this admin?"
          onConfirm={() => selectedId && handleStatusToggle(selectedId)}
          confirmText="Confirm"
        />

        {/* Delete Confirm Modal */}
        <CustomModal
          isOpen={deleteDialog}
          onRequestClose={() => {
            setDeleteDialog(false);
            setDeleteId(null);
          }}
          title="Confirm Delete"
          description="Are you sure you want to delete this admin?"
          onConfirm={() => deleteId && handleDeleteAdmin(deleteId)}
          confirmText="Delete"
        />
      </ContentLayout>
    </div>
  );
};

export default AdminsListPage;
