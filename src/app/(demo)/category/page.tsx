'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Plus, Image as ImageIcon, TrendingUp, IndianRupee, Package, ChevronRight, ChevronLeft } from 'lucide-react';
import apiClient from '@/lib/apiClient';
// import Loader from '@/components/ui/Loader';
import CustomModal from '@/components/CustomModal';

interface Category {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  image?: string;
  createdAt: string;
  productsCount?: number;
  totalProducts?: number;
  totalEarnings?: number;
}

interface CatagoryAnalytics {
  product: number;
  Earning: number;
  activeCategories: number;
  inactiveCategories: number;
}
const LIMIT = 10;
export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [catagoryAnalytics, setCatagoryAnalytics] = useState<CatagoryAnalytics>({
    product: 0,
    Earning: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchCatagoryAnalytics();
  }, [page]);

  const fetchCatagoryAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await apiClient.get('/v1/catagory/get-analytics');
      const data = response.data.data;

      setCatagoryAnalytics({
        product: data.TotalProduct || 0,
        Earning: data.TotalEarning || 0,
        activeCategories: data.ActiveCity || 0,
        inactiveCategories: data.InActiveCity || 0,
      });
    } catch (error) {
      console.error('Error fetching category analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/v1/catagory/get-all-catagory',{
        params: { page,limit:LIMIT}
      });
      const data = await response.data.data;
      console.log(data, "dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

      const transformedCategories = data.map((cat: any) => ({
        _id: cat._id || '',
        name: cat.name || '',
        description: cat.description || '',
        status: cat.status || 'inactive',
        image: cat.image || '',
        createdAt: cat.createdAt || new Date().toISOString(),
        productsCount: cat.productsCount || 0,
        totalProducts: cat.totalProducts || 0,
        totalEarnings: cat.totalEarnings || 0,
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchClick = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    setSelectedCategoryId(categoryId);
    setOpenDialog(true);
  };

  const handleStatusToggle = async (categoryId: string) => {
    if (!selectedCategoryId) return;
    try {
      setIsLoading(true);
      await apiClient.patch(`/v1/catagory/change-status/${categoryId}`);
      await fetchCategories();
      await fetchCatagoryAnalytics()
    } catch (error) {
      console.error('Error toggling category status:', error);
    } finally {
      setOpenDialog(false);
      setSelectedCategoryId(null);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // Add delete logic here if needed
    setDeleteDialog(false);
    setSelectedCategoryId(null);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <ContentLayout title="Categories">
      {/* {isLoading && <Loader />} */}
      {/* Top Summary Row with Cards and Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Products</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">{catagoryAnalytics.product}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+12%</span> vs last month
            </div>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Earnings</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">₹{catagoryAnalytics.Earning}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600 font-medium">+8%</span> vs last month
            </div>
          </div>
        </div>

        <div className="relative rounded-lg bg-white shadow hover:shadow-lg transition p-3 border border-gray-200">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="rounded bg-violet-100 p-1.5 flex items-center justify-center">
                <Package className="h-4 w-4 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-violet-600 uppercase">Total Categories</h4>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {analyticsLoading ? '...' : catagoryAnalytics.activeCategories + catagoryAnalytics.inactiveCategories}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Active: <span className="font-semibold text-green-600">{analyticsLoading ? '...' : catagoryAnalytics.activeCategories}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Inactive: <span className="font-semibold text-red-600">{analyticsLoading ? '...' : catagoryAnalytics.inactiveCategories}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => router.push('/categories/add')}
          className="text-white "
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="text-muted-foreground text-sm font-medium">
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Total Products</TableHead>
              <TableHead className="text-center">Total Earnings</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id} className="hover:bg-muted/20 transition-all">
                  <TableCell>
                    {category.image ? (
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={100}
                          height={100}
                          loading='lazy'
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    <button
                      onClick={() => router.push(`/categories/${category._id}`)}
                      className="hover:text-violet-600 transition-colors"
                    >
                      {category.name}
                    </button>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell className="text-center">{category.productsCount}</TableCell>
                  <TableCell className="text-center">₹{category.totalEarnings}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.status === 'active'}
                        onClick={(e) => handleSwitchClick(e, category._id)}
                      />
                      <Badge
                        variant={category.status === 'active' ? 'default' : 'secondary'}
                        className={category.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                      >
                        {category.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/categories/edit/${category._id}`)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={openDialog}
        onRequestClose={() => {
          setOpenDialog(false);
          setSelectedCategoryId(null);
        }}
        title="Confirm Status Update"
        description="Are you sure you want to update the active status of this category?"
        onConfirm={() => handleStatusToggle(selectedCategoryId!)}
        confirmText="Confirm"
      />

      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => {
          setDeleteDialog(false);
          setSelectedCategoryId(null);
        }}
        title="Confirm Deletion"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </ContentLayout>
  );
}