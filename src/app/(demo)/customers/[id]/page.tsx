'use client';

import { useParams, useRouter } from 'next/navigation';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { mockCustomers } from '@/data/mockCustomers';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Home, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export default function CustomerViewPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) {
    return (
      <ContentLayout title="Not Found">
        <div className="text-center py-12">
          <p>Customer not found.</p>
          <Button variant="outline" onClick={() => router.push('/customers')} className="mt-4">
            Back to List
          </Button>
        </div>
      </ContentLayout>
    );
  }

  const addr = customer.addresses[0] || {};

  return (
    <ContentLayout title={`View Customer: ${customer.fullname}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/customers">Customers</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>View</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row">
          {/* LEFT – Details */}
          <div className="w-full lg:w-1/2 p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                {customer.profile_pic ? (
                  <Image src={customer.profile_pic} alt={customer.fullname} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-teal-100 text-teal-600 text-2xl font-bold">
                    {customer.fullname.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.fullname}</h2>
                <Badge variant={customer.is_active ? 'default' : 'secondary'} className="mt-1">
                  {customer.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Mail className="w-5 h-5 mr-2 text-teal-600" /> Email
              </Label>
              <p className="text-base">{customer.email}</p>
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Phone className="w-5 h-5 mr-2 text-teal-600" /> Mobile
              </Label>
              <p className="text-base">{customer.mobile}</p>
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <User className="w-5 h-5 mr-2 text-teal-600" /> Role
              </Label>
              <p className="text-base capitalize">{customer.role}</p>
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <CheckCircle className="w-5 h-5 mr-2 text-teal-600" /> Status
              </Label>
              <Badge
                variant={
                  customer.status === 'approved' ? 'default' :
                  customer.status === 'pending' ? 'secondary' : 'destructive'
                }
              >
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Calendar className="w-5 h-5 mr-2 text-teal-600" /> Subscription Plan
              </Label>
              {customer.subscription_plan_id ? (
                <div className="space-y-1">
                  <p className="font-medium">Premium Plan</p>
                  <p className="text-sm text-gray-600">
                    {customer.plan_start_date} → {customer.plan_end_date}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No active plan</p>
              )}
            </div>

            <div>
              <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Clock className="w-5 h-5 mr-2 text-teal-600" /> Last Login
              </Label>
              <p className="text-base">
                {customer.last_login
                  ? new Date(customer.last_login).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* RIGHT – Address */}
          <div className="w-full lg:w-1/2 p-8 bg-white dark:bg-gray-800 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" /> Address
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <Label>Emirate</Label>
                <p className="font-medium">{addr.emirate || '-'}</p>
              </div>
              <div>
                <Label>Area</Label>
                <p className="font-medium">{addr.area || '-'}</p>
              </div>
              <div>
                <Label>Building / Apartment</Label>
                <p className="font-medium">{addr.appartment || '-'}</p>
              </div>
              <div>
                <Label>Additional Address</Label>
                <p className="font-medium">{addr.addtional_address || '-'}</p>
              </div>
              <div>
                <Label>Location</Label>
                {addr.location ? (
                  <a href={addr.location} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                    Open in Google Maps
                  </a>
                ) : (
                  <p className="text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/customers')}
            className="px-6 py-3"
          >
            Back to List
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}