'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, UserCheck, Calendar, Clock } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { mockCustomers } from '@/data/mockCustomers';
import { Badge } from '@/components/ui/badge';

export default function CustomersPage() {
  // const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = mockCustomers.filter(c =>
    c.fullname.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const total = filtered.length;

  const columns = [
    {
      key: 'profile',
      header: 'Customer',
      render: (item: typeof mockCustomers[0]) => (
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
              <div className="flex h-full w-full items-center justify-center bg-teal-100 text-teal-600 font-bold text-sm">
                {item.fullname.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{item.fullname}</p>
            <p className="text-xs text-gray-500">{item.mobile}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item: typeof mockCustomers[0]) => (
        <div>
          <p className="text-sm">{item.email}</p>
          <p className="text-xs text-gray-500">{item.addresses[0]?.emirate || '-'}</p>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (item: typeof mockCustomers[0]) => (
        <div className="text-sm">
          {item.subscription_plan_id ? (
            <div>
              <p className="font-medium">Premium</p>
              <p className="text-xs text-gray-500">
                {item.plan_start_date} → {item.plan_end_date}
              </p>
            </div>
          ) : (
            <span className="text-gray-400">No Plan</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: typeof mockCustomers[0]) => (
        <Badge
          variant={
            item.status === 'approved' ? 'default' :
            item.status === 'pending' ? 'secondary' : 'destructive'
          }
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Customers">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 rounded">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-600">Total Customers</p>
              <p className="text-xl font-bold">{mockCustomers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600">Active</p>
              <p className="text-xl font-bold">
                {mockCustomers.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600">Subscribed</p>
              <p className="text-xl font-bold">
                {mockCustomers.filter(c => c.subscription_plan_id).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600">Last Login</p>
              <p className="text-sm font-medium">
                {mockCustomers[0]?.last_login
                  ? new Date(mockCustomers[0].last_login).toLocaleDateString()
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ListComponent
        title="Customer"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/customers/${id}`}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={total}
        searchQuery={search}
        setSearchQuery={setSearch}
        showStatusToggle={false}
      />
    </ContentLayout>
  );
}