'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import CustomModal from '@/components/CustomModal';
import { toast } from 'sonner';

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

export default function ContactView() {
  const router = useRouter();
  const { id } = useParams() as { id?: string };

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const loadContact = async () => {
      try {
        setLoading(true);
        // Preferred: endpoint to fetch single contact by id
        const { data } = await apiClient.get(`/contactus/V1/get-by-id/${id}`);
        // If your backend returns data.data (like other endpoints), adjust:
        const c = data.data ?? data;
        setContact({
          id: c.id,
          fullname: c.fullname || '—',
          email: c.email || '—',
          country_code: c.country_code || null,
          mobile_number: c.mobile_number || null,
          description: c.description || '',
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || null,
          deletedAt: c.deletedAt || null,
        });
      } catch (err: any) {
        // If the backend doesn't have a single-get route, try getting list and find the id
        try {
          const res = await apiClient.get('/contact-us/V1/get-all-contact', { params: { page: 1, limit: 1000 } });
          const list = res.data?.data ?? [];
          const found = list.find((x: any) => x.id === id);
          if (found) {
            setContact({
              id: found.id,
              fullname: found.fullname || '—',
              email: found.email || '—',
              country_code: found.country_code || null,
              mobile_number: found.mobile_number || null,
              description: found.description || '',
              createdAt: found.createdAt || new Date().toISOString(),
              updatedAt: found.updatedAt || null,
              deletedAt: found.deletedAt || null,
            });
          } else {
            toast.error(err.response?.data?.message || 'Contact not found');
            router.push('/contacts');
          }
        } catch (innerErr) {
          console.error('Failed to load contact:', innerErr);
          toast.error('Failed to load contact');
          router.push('/contacts');
        }
      } finally {
        setLoading(false);
      }
    };

    loadContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/contact-us/V1/delete-contact/${id}`);
      toast.success('Contact deleted');
      router.push('/contacts');
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  return (
    <ContentLayout title="Contact Details">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/contacts">Contacts</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>View</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-4xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading…</p>
          ) : contact ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-xs">Full Name</Label>
                <p className="mt-1 text-lg font-medium">{contact.fullname}</p>
              </div>

              <div>
                <Label className="text-xs">Email</Label>
                <p className="mt-1 text-lg">{contact.email}</p>
              </div>

              <div>
                <Label className="text-xs">Phone</Label>
                <p className="mt-1 text-lg">
                  {contact.country_code ?? ''}{contact.mobile_number ?? ' — '}
                </p>
              </div>

              <div>
                <Label className="text-xs">Submitted At</Label>
                <p className="mt-1 text-lg">{new Date(contact.createdAt).toLocaleString('en-IN')}</p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Message</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap">{contact.description ?? '—'}</div>
              </div>

              {contact.updatedAt && (
                <div className="md:col-span-2">
                  <Label className="text-xs">Last Updated</Label>
                  <p className="mt-1 text-sm text-gray-600">{new Date(contact.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500">Contact not found.</p>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <CustomModal
        isOpen={deleteDialog}
        onRequestClose={() => setDeleteDialog(false)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={deleting ? 'Deleting…' : 'Delete Permanently'}
      />
    </ContentLayout>
  );
}
