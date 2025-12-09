'use client';

import { useEffect, useState } from 'react';
import ReportsComponent from '@/components/ReportsComponent';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Customer {
  id: string;
  fullname: string | null;
  email: string | null;
  mobile: string;
  service_type: string | null;
  emirates_id: string | null;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    rows: Customer[];
    count: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export default function CustomerReportList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (fromDate) params.from = format(fromDate, 'yyyy-MM-dd');
      if (toDate) params.to = format(toDate, 'yyyy-MM-dd');

      const response = await apiClient.get<ApiResponse>('/reports/V1/get-all-customers-report', {
        params,
      });

      const { rows, count, totalPages, page, limit } = response.data.data;

      setCustomers(rows);
      setPagination({
        total: count,
        currentPage: page,
        totalPages,
        limit,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.currentPage, pagination.limit, searchQuery, fromDate, toDate]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPage = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, currentPage: 1 }));
  };

  const columns = [
    {
      key: 'fullname',
      header: 'Customer Name',
      render: (c: Customer) => c.fullname || <span className="text-gray-400 italic">Not Set</span>,
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (c: Customer) => c.mobile || '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (c: Customer) => c.email || <span className="text-gray-400">—</span>,
    },
    {
      key: 'createdAt',
      header: 'Registered On',
      render: (c: Customer) => format(new Date(c.createdAt), 'dd MMM yyyy'),
    },
  ];

  return (
    <ContentLayout title="Customers Report">
      <ReportsComponent
        title="Customers Report"
        data={customers}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          total: pagination.total,
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          limit: pagination.limit,
        }}
        onSearch={(q) => {
          setSearchQuery(q);
          setPagination(prev => ({ ...prev, currentPage: 1 }));
        }}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={(date) => {
          setFromDate(date);
          setPagination(prev => ({ ...prev, currentPage: 1 }));
        }}
        onToDateChange={(date) => {
          setToDate(date);
          setPagination(prev => ({ ...prev, currentPage: 1 }));
        }}
        onPageChange={handlePageChange}
        setItemsPerPage={handleItemsPerPage}
        downloadAllEndpoint="/reports/V1/get-all-customer-report-download"
        downloadEndpoint={(id) => `/reports/V1/get-single-customer-report-download/${id}`}
      />
    </ContentLayout>
  );
}