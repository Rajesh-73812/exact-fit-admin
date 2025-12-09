'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, User, Calendar, Clock, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Customer {
  id: string;
  fullname: string | null;
  email: string | null;
  mobile: string;
  is_active: boolean;
  createdAt: string;
}

export default function CustomerViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<{ success: boolean; data: Customer }>(
          `/auth/V1/get-customers-by-id/${id}`
        );
        setCustomer(data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load customer');
        router.replace('/customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomer();
  }, [id, router]);

  if (loading) {
    return (
      <ContentLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading customer details...</div>
        </div>
      </ContentLayout>
    );
  }

  if (!customer) {
    return (
      <ContentLayout title="Not Found">
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">Customer not found</p>
          <Button onClick={() => router.push('/customers')} variant="outline">
            Back to Customers
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const displayName = customer.fullname || 'Name Not Set';
  const initials = customer.fullname ? customer.fullname.charAt(0).toUpperCase() : 'C';

  return (
    <ContentLayout title={`Customer: ${displayName}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/customers">Customers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>View</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-5xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className=" text- p-8">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-white/20 shadow-xl">
                <div className="flex h-full w-full items-center justify-center bg-white/20 backdrop-blur-sm text-4xl font-bold">
                  {initials}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge
                    variant={customer.is_active ? 'default' : 'secondary'}
                    className={customer.is_active ? 'bg-white text-teal-700' : 'bg-white/80 text-gray-700'}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm opacity-90">Customer ID: {customer.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Personal Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Personal Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Mobile Number
                    </Label>
                    <p className="text-lg font-medium mt-1">{customer.mobile}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </Label>
                    <p className="text-lg font-medium mt-1">
                      {customer.email || <span className="text-gray-400 italic">Not provided</span>}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Joined On
                    </Label>
                    <p className="text-lg font-medium mt-1">
                      {format(new Date(customer.createdAt), 'dd MMM yyyy')}
                      <span className="text-sm text-gray-500 ml-2">
                        at {format(new Date(customer.createdAt), 'hh:mm a')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Activity */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Account Status
                </h2>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant={customer.is_active ? 'default' : 'secondary'} className="text-sm">
                      {customer.is_active ? 'Active Account' : 'Inactive Account'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Created</span>
                    <span className="text-sm font-medium">
                      {format(new Date(customer.createdAt), 'dd MMMM yyyy')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Since</span>
                    <span className="text-sm font-medium">
                      {format(new Date(customer.createdAt), 'MMM yyyy')}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push('/customers')}
                  >
                    Back to Customers List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </ContentLayout>
  );
}