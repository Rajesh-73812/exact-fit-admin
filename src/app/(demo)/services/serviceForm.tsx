'use client';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tag, FileText, LocateIcon, ImagePlus, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import Loader from '@/components/utils/Loader';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from "@/hooks/usePresignedUpload";
import { Trash2 } from 'lucide-react';

const generateSlug = (title: string): string => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function ServiceForm() {
  const router = useRouter();
  const { slug } = useParams();
  const isEdit = !!slug;
  const [loading, setLoading] = useState(false);
  const { files, uploading, uploadFiles, removeFile, getUploadedUrls } = usePresignedUpload("services");

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    service_slug: '',
    position: '',
    image_alt: '',
    description: '',
    is_active: '1',
    existing_image_url: '',
  });

  // Auto-update slug
  useEffect(() => {
    if (formData.title.trim()) {
      setFormData(prev => ({ ...prev, service_slug: generateSlug(prev.title) }));
    }
  }, [formData.title]);

  // Load existing service
  useEffect(() => {
    if (!isEdit || !slug) return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/service/V1/get-service-by-slug/${slug}`);
        const svc = data.data;

        setFormData({
          type: svc.type,
          title: svc.title || '',
          service_slug: svc.service_slug || '',
          position: svc.position?.toString() || '',
          image_alt: svc.image_alt || '',
          description: svc.description || '',
          is_active: svc.status === 'active' ? '1' : '0',
          existing_image_url: svc.image_url || '',
        });
      } catch (err) {
        alert('Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be ≤ 5MB');
      return;
    }

    uploadFiles([file]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (uploading) {
      alert('Please wait for image to finish uploading');
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrl = getUploadedUrls()[0];
      const finalImageUrl = uploadedImageUrl || formData.existing_image_url;
      console.log("DEBUG UPLOAD STATE:", {
        files,
        uploadedUrls: getUploadedUrls(),
        hasUploadedImage: !!getUploadedUrls()[0],
        existingImage: formData.existing_image_url,
      });
      const payload = {
        type: formData.type,
        title: formData.title.trim(),
        service_slug: generateSlug(formData.title),
        ...(isEdit && { old_service_slug: slug as string }),
        position: formData.position ? Number(formData.position) : null,
        description: formData.description.trim(),
        image_url: finalImageUrl || null,
        image_alt: formData.image_alt.trim(),
        status: formData.is_active === '1' ? 'active' : 'inactive',
        external_link: '',
      };

      await apiClient.post('/service/V1/upsert-service', payload);
      router.push('/services');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl =
    files[0]?.uploadedUrl ||
    (files[0]?.uploading ? files[0]?.preview : null) ||
    formData.existing_image_url;


  return (
    <ContentLayout title={isEdit ? 'Edit Service' : 'Add Service'}>
      {loading && <Loader />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/services">Services</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isEdit ? 'Edit' : 'Create'}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Form Fields */}
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div>
              <Label> Service Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.type || ''}
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="enquiry">Enquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-2"><Tag className="w-5 h-5" /> Service Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter Service Name"
                required
              />
            </div>

            <div>
              <Label>URL Slug (auto-generated)</Label>
              <Input value={formData.service_slug} readOnly className="bg-gray-100 font-mono" />
              <p className="text-sm text-gray-500 mt-1">Updates automatically when title changes</p>
            </div>

            <div>
              <Label><LocateIcon className="w-5 h-5 inline mr-2" /> Position</Label>
              <Input
                type="number"
                min={1}
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <Label><FileText className="w-5 h-5 inline mr-2" /> Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
              />
            </div>
          </div>

          {/* Right: Image Upload */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
              {/* Image Alt Text */}
              <div>
                <Label><ImagePlus className="w-5 h-5 inline mr-2" /> Image Alt Text</Label>
                <Input
                  value={formData.image_alt}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                  placeholder="Describe image for SEO"
                />
              </div>

              {/* Status */}
              <div>
                <Label><Activity className="w-5 h-5 inline mr-2" /> Status</Label>
                <Select value={formData.is_active} onValueChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Image Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Image</h3>

                <div className="border-2 border-dashed border-gray-300 rounded-xl h-80 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                  {currentImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={currentImageUrl}
                        alt="Service preview"
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-xl mx-auto mb-4" />
                      <p className="text-gray-600">No image selected</p>
                    </div>
                  )}

                  {files[0]?.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                      <div className="text-white text-lg">Uploading...</div>
                    </div>
                  )}
                </div>

                {currentImageUrl && (
                  <div className="mt-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(0)}
                      disabled={uploading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Remove Image
                    </Button>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="mt-4 block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/services')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading} >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}