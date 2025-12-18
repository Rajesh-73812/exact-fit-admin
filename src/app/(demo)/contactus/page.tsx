'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import CustomModal from '@/components/CustomModal';
import apiClient from '@/lib/apiClient';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import ContactIcon from '../../opengraph-image.png';
import { format } from 'date-fns';

interface Contact {
  id: string;
  fullname: string;
  email: string;
  country_code?: string | null;
  mobile_number?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

interface ContactAnalytics {
  totalContacts: number;
  recentContacts: number;
}

export default function ContactPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<ContactAnalytics>({
    totalContacts: 0,
    recentContacts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/contactus/V1/get-all', {
        params: { page, limit: limit, search: searchQuery || undefined },
      });

      const items = data.data || [];
      const transformed: Contact[] = items.map((item: any) => ({
        id: item.id,
        fullname: item.fullname || 'No name',
        email: item.email || '',
        country_code: item.country_code || null,
        mobile_number: item.mobile_number || null,
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || null,
        deletedAt: item.deletedAt || null,
      }));

      setContacts(transformed);
      const totalItems = data.pagination?.totalItems ?? transformed.length;
      setTotal(totalItems);

      const recentThreshold = new Date();
      recentThreshold.setDate(recentThreshold.getDate() - 7); // last 7 days
      const recentCount = transformed.filter(c => new Date(c.createdAt) >= recentThreshold).length;

      setAnalytics({
        totalContacts: transformed.length,
        recentContacts: recentCount,
      });
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, limit, searchQuery]);

  const handleDeleteContact = async () => {
    if (!deleteId) return;

    try {
      setIsLoading(true);
      await apiClient.delete(`/contact-us/V1/delete-contact/${deleteId}`);
      await fetchContacts();
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setIsLoading(false);
      setDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'fullname',
      header: 'Full Name',
      render: (item: Contact) => (
        <button
          onClick={() => router.push(`/contacts/${item.id}`)}
          className="font-semibold hover:text-violet-600 transition-colors"
        >
          {item.fullname}
        </button>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item: Contact) => <span className="text-sm">{item.email}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item: Contact) => (
        <span className="text-sm">
          {item.country_code ?? ''}{item.mobile_number ?? ' — '}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted At',
      render: (item: Contact) => (
        <span className="text-sm">
          {format(new Date(item.createdAt), 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Message',
      render: (item: Contact) => (
        <span className="text-sm line-clamp-2">{item.description ?? '—'}</span>
      ),
    },
  ];

  return (
    <ContentLayout title="Contact Us">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0b74de] rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#0b74de] bg-opacity-10 p-2">
              <Image src={ContactIcon} alt="Contacts" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0b74de] uppercase">Total Contacts</p>
              <p className="text-2xl font-bold">{analytics.totalContacts}</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-600 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-green-600 bg-opacity-10 p-2">
              <Mail className="h-5 w-5 text-black" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase">Recent (7d)</p>
              <p className="text-2xl font-bold">{analytics.recentContacts}</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-4 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-400 rounded" />
          <div className="flex items-center gap-3">
            <div className="rounded bg-gray-400 bg-opacity-10 p-2">
              <Image src={ContactIcon} alt="Latest" width={20} height={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Last Updated</p>
              <p className="text-sm">
                {contacts.length ? new Date(contacts[0].createdAt).toLocaleString('en-IN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Component */}
      <ListComponent
        title="Contact"
        data={contacts}
        columns={columns}
        isLoading={isLoading}
        addRoute={undefined}
        editRoute={(id: string) => `/contactus/edit/${id}`}
        viewRoute={(id: string) => `/contactus/view/${id}`}

        // Endpoints
        deleteEndpoint={(id: string) => `/contact-us/V1/delete-contact/${id}`}
        statusToggleEndpoint={undefined}

        // Callbacks expected by ListComponent
        onStatusToggle={async () => { /* Not used for contacts */ }}

        onDelete={async (id: string) => {
          setDeleteId(id);
          setDeleteDialog(true);
        }}

        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={10}
        setItemsPerPage={() => { }}
        totalItems={total}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusField="is_active"
        showStatusToggle={false}
      />

      {/* Delete Modal */}
      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => {
          setDeleteDialog(false);
          setDeleteId(null);
        }}
        title="Delete Contact"
        description={`Are you sure you want to delete this contact? This cannot be undone.`}
        onConfirm={handleDeleteContact}
        confirmText="Delete Permanently"
      />
    </ContentLayout>
  );
}
