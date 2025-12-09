'use client';

import { useEffect, useState } from 'react';
import ReportsComponent from '@/components/ReportsComponent';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ContentLayout } from '@/components/admin-panel/content-layout';

interface Technician {
    id: string;
    fullname: string | null;
    email: string | null;
    mobile: string;
    service_type: string | null;
    emirates_id: string | null;
    createdAt: string;
    addresses: { area: string | null; location: string | null }[];
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: {
        rows: Technician[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}

export default function TechnicianReportList() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
        totalPages: 1,
        limit: 10,
    });

    const fetchTechnicians = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: pagination.currentPage,
                limit: pagination.limit,
            };

            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (fromDate) params.from = format(fromDate, 'yyyy-MM-dd');
            if (toDate) params.to = format(toDate, 'yyyy-MM-dd');
            if (serviceTypeFilter && serviceTypeFilter !== 'all') {
                params.filter = serviceTypeFilter;
            }

            const response = await apiClient.get<ApiResponse>('/reports/V1/get-all-technicians-report', { params });
            const { rows, totalItems, totalPages, currentPage, limit } = response.data.data;

            setTechnicians(rows);
            setPagination({
                total: totalItems,
                currentPage,
                totalPages,
                limit,
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load technicians');
            setTechnicians([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTechnicians();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.currentPage, pagination.limit, searchQuery, serviceTypeFilter, fromDate, toDate]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPage = (limit: number) => {
        setPagination(prev => ({ ...prev, limit, currentPage: 1 }));
    };

    const columns = [
        { key: 'fullname', header: 'Name', render: (t: Technician) => t.fullname || <span className="text-gray-400 italic">Not Set</span> },
        { key: 'mobile', header: 'Mobile', render: (t: Technician) => t.mobile },
        { key: 'email', header: 'Email', render: (t: Technician) => t.email || '—' },
        { key: 'emirates_id', header: 'Emirates ID', render: (t: Technician) => t.emirates_id || '—' },
        {
            key: 'service_type',
            header: 'Type',
            render: (t: Technician) => {
                if (!t.service_type) return <span className="text-gray-400">—</span>;
                const isEmergency = t.service_type.toLowerCase() === 'emergency';
                return (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${isEmergency ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {t.service_type.charAt(0).toUpperCase() + t.service_type.slice(1)}
                    </span>
                );
            },
        },
        {
            key: 'location',
            header: 'Location',
            render: (t: Technician) => {
                const addr = t.addresses?.[0];
                if (!addr || (!addr.area && !addr.location)) return <span className="text-gray-400">—</span>;
                return (
                    <div className="text-sm">
                        {addr.area && <div className="font-medium">{addr.area}</div>}
                        {addr.location && <div className="text-xs text-gray-500 truncate max-w-xs">{addr.location}</div>}
                    </div>
                );
            },
        },
    ];

    return (
        <ContentLayout title="Technicians Report">
            <ReportsComponent
                title="Technicians Report"
                data={technicians}
                columns={columns}
                isLoading={isLoading}
                pagination={{
                    total: pagination.total ?? 0,
                    currentPage: pagination.currentPage ?? 1,
                    totalPages: pagination.totalPages ?? 1,
                    limit: pagination.limit ?? 10,
                }}
                onSearch={(q) => {
                    setSearchQuery(q);
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                serviceTypeFilter={serviceTypeFilter}
                setServiceTypeFilter={(value) => {
                    setServiceTypeFilter(value);
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
                downloadAllEndpoint="/reports/V1/get-all-technicians-report-download"
                downloadEndpoint={(id) => `/reports/V1/get-single-technician-report-download/${id}`}
            />
        </ContentLayout>
    );
}