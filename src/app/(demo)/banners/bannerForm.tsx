'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Calendar } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';
import toast from 'react-hot-toast';

const sectionOptions = ['homepage', 'about us', 'contact us', 'services'] as const;
type BannerSection = typeof sectionOptions[number];

const generateSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function BannerForm() {
  const router = useRouter();
  const { slug } = useParams() as { slug?: string };
  const isEdit = !!slug;

  const [loading, setLoading] = useState(false);
  const { files, uploading, uploadFiles, removeFile, getUploadedUrls } = usePresignedUpload('banners');

  const [formData, setFormData] = useState({
    id: '',                    // ← Now we store real DB id (UUID)
    name: '',
    slug: '',
    priority: '',
    link_url: '',
    start_date: '',
    end_date: '',
    is_active: 'true',
    banner_type: 'homepage' as BannerSection,
    existing_image_url: '',
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name.trim()) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name]);

  // Load banner on edit mode
  useEffect(() => {
    if (!isEdit || !slug) return;

    const loadBanner = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/banner/V1/get-banner-by-slug/${slug}`);
        const b = data.data;

        setFormData({
          id: b.id || '',                                      // ← Save real UUID
          name: b.name || '',
          slug: b.slug || '',
          priority: b.priority?.toString() || '',
          link_url: b.link_url || '',
          start_date: b.start_date ? new Date(b.start_date).toISOString().slice(0, 16) : '',
          end_date: b.end_date ? new Date(b.end_date).toISOString().slice(0, 16) : '',
          is_active: b.is_active ? 'true' : 'false',
          banner_type: (b.banner_type as BannerSection) || 'homepage',
          existing_image_url: b.image_url || '',
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load banner');
        router.push('/banners/list');
      } finally {
        setLoading(false);
      }
    };

    loadBanner();
  }, [slug, isEdit, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be ≤ 5MB');
      return;
    }
    uploadFiles([file]);
  };

  const currentImageUrl =
    files[0]?.uploadedUrl ||
    (files[0]?.uploading ? files[0].preview : null) ||
    formData.existing_image_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('Banner name is required');
    if (!formData.banner_type) return toast.error('Please select a section');
    if (uploading) return toast.error('Please wait for image upload');

    // Date validation
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        return toast.error('End date must be after start date');
      }
    }

    const uploadedUrl = getUploadedUrls()[0];
    const finalImageUrl = uploadedUrl || formData.existing_image_url;
    if (!finalImageUrl) return toast.error('Banner image is required');

    setLoading(true);

    try {
      await apiClient.post('/banner/V1/upsert-banner', {
        id: isEdit ? formData.id : undefined,

        name: formData.name.trim(),
        slug: generateSlug(formData.name), 
        image_url: finalImageUrl,
        priority: formData.priority ? Number(formData.priority) : null,
        link_url: formData.link_url || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active === 'true',
        banner_type: formData.banner_type,
      });

      toast.success(isEdit ? 'Banner updated successfully!' : 'Banner created successfully!');
      router.push('/banners/list');
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title={isEdit ? 'Edit Banner' : 'Add New Banner'}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/banners/list">Banners</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEdit ? 'Edit' : 'Add'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form Fields */}
          <div className="space-y-6 bg-white rounded-xl shadow-sm border p-8">
            <div>
              <Label>Banner Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Summer Sale 2025"
                required
              />
            </div>

            <div>
              <Label>Slug (auto-generated)</Label>
              <Input value={formData.slug} readOnly className="bg-gray-50 font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Used in URLs and API</p>
            </div>

            <div>
              <Label>Display Section <span className="text-red-500">*</span></Label>
              <Select value={formData.banner_type} onValueChange={v => setFormData(p => ({ ...p, banner_type: v as BannerSection }))}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority (lower = displays first)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setFormData(p => ({ ...p, priority: val }));
                  }
                }}
                placeholder="10"
                min="0"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Start Date (optional)
              </Label>
              <Input
                type="date"
                value={formData.start_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  const selectedDate = e.target.value;
                  setFormData(p => ({ ...p, start_date: selectedDate }));
                }}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> End Date (optional)
              </Label>
              <Input
                type="date"
                value={formData.end_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  const selectedDate = e.target.value;
                  setFormData(p => ({ ...p, end_date: selectedDate }));
                }}
              />
              {formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date) && (
                <p className="text-sm text-red-600 mt-1">End date must be after start date</p>
              )}
            </div>


            <div>
              <Label>Link URL (optional)</Label>
              <Input
                value={formData.link_url}
                onChange={e => setFormData(p => ({ ...p, link_url: e.target.value }))}
                placeholder="https://example.com/promo"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.is_active} onValueChange={v => setFormData(p => ({ ...p, is_active: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Image Upload */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <Label>Banner Image <span className="text-red-500">*</span></Label>
              <p className="text-sm text-gray-500 mt-1">Recommended: 1200×600px</p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl h-96 mt-4 relative overflow-hidden bg-gray-50">
                {currentImageUrl ? (
                  <>
                    <Image
                      src={currentImageUrl}
                      alt="Banner preview"
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="text-white text-lg font-medium">Uploading...</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-4 right-4 z-20 shadow-lg"
                      onClick={() => removeFile(0)}
                      disabled={uploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-xl mb-4" />
                    <p className="text-lg font-medium">No image selected</p>
                  </div>
                )}
              </div>

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

        <div className="mt-10 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/banners/list')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
}