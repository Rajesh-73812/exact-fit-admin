'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, DollarSign } from 'lucide-react';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';
import Loader from '@/components/utils/Loader';

function StatCard({
    title,
    value,
    icon,
    trend,
}: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactElement;
    trend: string;
}) {
    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white rounded-full p-2">
                        {icon}
                    </div>
                    <span className="text-sm text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {trend}
                    </span>
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ServiceDetailsPage() {
    const { slug } = useParams();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        const fetchService = async () => {
            try {
                const res = await apiClient.get(`/service/V1/get-service-by-slug/${slug}`);
                setService(res.data.data);
            } catch (error) {
                console.error('Failed to fetch service:', error);
                setError('Failed to load service data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [slug]);

    // Placeholder sales data
    const salesData = [
        { month: 'Jan', sales: 4000 },
        { month: 'Feb', sales: 3000 },
        { month: 'Mar', sales: 5000 },
        { month: 'Apr', sales: 4500 },
        { month: 'May', sales: 6000 },
    ];

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!service) return <p>Service not found.</p>;

    return (
        <ContentLayout title={service.title || service.name}>
            {/* Service Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="md:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-800">Service Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border">
                            {service.image_url ? (
                                <Image
                                    src={service.image_url}
                                    alt={service.image_alt || service.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                    <Package className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={`text-white ${service.status === 'active'
                                        ? 'bg-gradient-to-b from-[#8000FF] to-[#DE00FF]'
                                        : 'bg-gray-300'
                                        }`}
                                >
                                    {service.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Created on {new Date(service.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subservices Count with Circular Progress */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Total Subservices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-40 relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                {/* Background Circle */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="#e5e7eb"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 70}`}
                                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - (service.sub_services?.length || 0) / 10)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-700 ease-out"
                                />
                                {/* Gradient Definition */}
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8000FF" />
                                        <stop offset="100%" stopColor="#DE00FF" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Count in Center */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-[#8000FF]">
                                    {service.sub_services?.length || 0}
                                </span>
                                {/* <span className="text-sm text-muted-foreground mt-1">of 10</span> */}
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Active Subservices
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Total Subservices"
                    value={service.sub_services?.length || 0}
                    icon={<Package className="h-5 w-5" />}
                    trend="+12%"
                />
                <StatCard
                    title="Total Sales"
                    value="$0"
                    icon={<DollarSign className="h-5 w-5" />}
                    trend="+0%"
                />
                <StatCard
                    title="Monthly Growth"
                    value="0%"
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend="+0%"
                />
            </div>

            {/* Sales Chart (Placeholder) */}
            <Card className="mb-6 shadow-lg">
                <CardHeader>
                    <CardTitle>Sales Performance (Placeholder)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="sales" stroke="#8000FF" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Subservices Table */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Subservices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subservice Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {service.sub_services?.length > 0 ? (
                                service.sub_services.map((sub: any) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.title}</TableCell>
                                        <TableCell>₹{sub.price}</TableCell>
                                        <TableCell>{sub.discount ? `${sub.discount}%` : '—'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`text-white ${sub.status === 'active'
                                                    ? 'bg-gradient-to-b from-[#8000FF] to-[#DE00FF]'
                                                    : 'bg-gray-300'
                                                    }`}
                                            >
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No subservices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </ContentLayout>
    );
}