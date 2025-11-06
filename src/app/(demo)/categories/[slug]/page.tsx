'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { Package, TrendingUp, DollarSign, Boxes, } from 'lucide-react';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/apiClient';
import Loader from '@/components/utils/Loader';

function StatCard({
    title, value, icon, trend,
}: {
    title: string;
    value: string | number;
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

export default function CategoryDetailsPage() {
    const { slug } = useParams();
    console.log(slug, "slug");
    const router = useRouter()
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch category data
    useEffect(() => {
        if (!slug) return;
        setLoading(true)
        const fetchCategory = async () => {
            try {
                const res = await apiClient.get(`/category/V1/get-category-by-slug/${slug}`);
                console.log(res.data, "response");
                setCategory(res.data.data);  // Access the first item in the data array
            } catch (error) {
                console.error('Failed to fetch category:', error);
                setError('Failed to load category data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();

    }, [slug]);

    // Placeholder sales data (since not provided in backend)
    const salesData = [
        { month: 'Jan', sales: 4000 },
        { month: 'Feb', sales: 3000 },
        { month: 'Mar', sales: 5000 },
        { month: 'Apr', sales: 4500 },
        { month: 'May', sales: 6000 },
    ];

    // Calculate total stock for a product
    const calculateTotalStock = (stock: any[]) => {
        return stock.reduce((total, item) => total + item.quantity, 0);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!category) return <p>Category not found.</p>;

    return (
        <ContentLayout title={category.name}>
            {/* Category Overview */}
            {loading && <Loader />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="md:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-800">Category Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border">
                            {category.image_url ? (
                                <Image
                                    src={category.image_url}
                                    alt={category.image_alt || category.title || 'Category image'}
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
                            <h3 className="text-xl font-semibold">{category.name}</h3>
                            <p className="text-muted-foreground">{category.description}</p>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={`text-white ${category.status === 'active' ? 'bg-gradient-to-b from-[#8000FF] to-[#DE00FF]' : 'bg-gray-300'}`}
                                >
                                    {category.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Created on {new Date(category.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subcategory Count */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Subcategories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center">
                            <div className="relative h-32 w-32">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{category.subcategoryCount}</span>
                                </div>
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="url(#subcategoryGradient)"
                                        strokeWidth="3"
                                        strokeDasharray={`${(category.subcategoryCount / 100) * 100}, 100`} // Assuming 100 as max for scaling
                                    />
                                    <defs>
                                        <linearGradient id="subcategoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#8000FF" />
                                            <stop offset="100%" stopColor="#DE00FF" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Total Products"
                    value={category.productCount}
                    icon={<Package className="h-5 w-5" />}
                    trend="+5%"
                />
                <StatCard
                    title="Total Sales"
                    value="$0" // Placeholder since not provided
                    icon={<DollarSign className="h-5 w-5" />}
                    trend="+0%"
                />
                <StatCard
                    title="Monthly Growth"
                    value="0%" // Placeholder since not provided
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend="+0%"
                />
                {/* <StatCard
                    title="Active Subcategories"
                    value={category.subcategories.filter((sub: any) => sub.status === 'active').length}
                    icon={<Boxes className="h-5 w-5" />}
                    trend="+2%"
                /> */}
            </div>

            {/* Sales Chart */}
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

            {/* Products Table */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Products in Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        {/* <TableBody>
                            {category.products.map((product: any) => (
                                <TableRow key={product._id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>${product.base_price.toFixed(2)}</TableCell>
                                    <TableCell>{calculateTotalStock(product.stock)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`text-white ${product.status === 'active' ? 'bg-gradient-to-b from-[#8000FF] to-[#DE00FF]' : 'bg-gray-400'}`}
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/products/${product.slug}`)}>
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody> */}
                    </Table>
                </CardContent>
            </Card>
        </ContentLayout>
    );
}