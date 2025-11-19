'use client';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tag, FileText, LocateIcon, ImagePlus, Activity, UploadIcon } from 'lucide-react';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    service_slug: '',
    position: '',
    image_alt: '',
    description: '',
    is_active: '1',
    image_url: null as File | null,
    existing_image_url: '',
  });

  // Auto-update slug when title changes
  useEffect(() => {
    if (formData.title.trim()) {
      setFormData(prev => ({ ...prev, service_slug: generateSlug(prev.title) }));
    }
  }, [formData.title]);

  // Load service in edit mode
  useEffect(() => {
    if (!isEdit || !slug) return;

    const fetchService = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/service/V1/get-service-by-slug/${slug}`);
        const svc = data.data;

        setFormData({
          title: svc.title || '',
          service_slug: svc.service_slug || '',
          position: svc.position?.toString() || '',
          image_alt: svc.image_alt || '',
          description: svc.description || '',
          is_active: svc.status === 'active' ? '1' : '0',
          image_url: null,
          existing_image_url: svc.image_url || '',
        });
        setImagePreview(svc.image_url || null);
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

    if (file.size > 1024 * 1024) {
      alert('Image must be ≤ 1MB');
      return;
    }

    setFormData(prev => ({ ...prev, image_url: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.existing_image_url;

      if (formData.image_url) {
        const uploadData = new FormData();
        uploadData.append('image', formData.image_url);
        const uploadRes = await apiClient.post('/upload-image', uploadData);
        imageUrl = uploadRes.data.url;
      }

      const payload = {
        title: formData.title.trim(),
        service_slug: generateSlug(formData.title),
        // This is the key: send old slug so backend knows which record to update
        ...(isEdit && { old_service_slug: slug as string }),
        position: formData.position ? Number(formData.position) : null,
        description: formData.description.trim(),
        image_url: imageUrl,
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

          {/* Left: Form */}
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div>
              <Label className="flex items-center gap-2"><Tag className="w-5 h-5" /> Service Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Web Development"
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
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <Label><ImagePlus className="w-5 h-5 inline mr-2" /> Image Alt Text</Label>
              <Input
                value={formData.image_alt}
                onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                placeholder="Describe image for SEO"
              />
            </div>

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

            <div>
              <Label><FileText className="w-5 h-5 inline mr-2" /> Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
              />
            </div>
          </div>

          {/* Right: Image */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-semibold mb-4">Service Image</h3>
              <div className="border-2 border-dashed rounded-xl h-80 flex items-center justify-center overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                ) : (
                  <div className="text-center">
                    <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No image selected</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-2 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/services')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}