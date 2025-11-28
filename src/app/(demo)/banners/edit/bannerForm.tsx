// src/app/(demo)/banners/edit/bannerForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';
import { toast } from 'sonner';

const sectionOptions = ['homepage', 'about us', 'contact us', 'services'] as const;
type BannerSection = typeof sectionOptions[number];

// Generate clean slug
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
  const { id } = useParams() as { id?: string };
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image_url: '',
    priority: '',
    link_url: '',
    schedule_time: '',
    is_active: 'true',
    banner_type: 'homepage' as BannerSection,
  });

  // Auto-update slug
  useEffect(() => {
    if (formData.name.trim()) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    } else {
      setFormData(prev => ({ ...prev, slug: '' }));
    }
  }, [formData.name]);

  // Presigned upload
  const { files, uploading, uploadFiles, removeFile, getUploadedUrls } = usePresignedUpload("banners");

  // Load existing banner
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/V1/get-banner-by-id/${id}`);
        const b = res.data.data;

        setFormData({
          name: b.name || '',
          slug: b.slug || '',
          image_url: b.image_url || '',
          priority: b.priority ? b.priority.toString() : '',
          link_url: b.link_url || '',
          schedule_time: b.schedule_time ? new Date(b.schedule_time).toISOString().slice(0, 16) : '',
          is_active: b.is_active ? 'true' : 'false',
          banner_type: b.banner_type || 'homepage',
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load banner');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be ≤ 5MB");
      return;
    }
    uploadFiles([file]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return toast.error("Banner name is required");
    if (!formData.banner_type) return toast.error("Please select a display section");
    if (!formData.slug) return toast.error("Invalid banner name (cannot generate slug)");

    if (uploading) return toast.error("Please wait for image upload to complete");

    const uploadedUrl = getUploadedUrls()[0];
    const finalImageUrl = uploadedUrl || formData.image_url;
    if (!finalImageUrl) return toast.error("Banner image is required");

    setLoading(true);

    try {
      await apiClient.post('/V1/upsert-banner', {
        id: isEdit ? id : undefined,
        name: formData.name.trim(),
        slug: formData.slug,
        image_url: finalImageUrl,
        priority: formData.priority ? Number(formData.priority) : null,
        link_url: formData.link_url || null,
        schedule_time: formData.schedule_time ? new Date(formData.schedule_time).toISOString() : null,
        is_active: formData.is_active === 'true',
        banner_type: formData.banner_type,
      });

      toast.success(isEdit ? "Banner updated successfully!" : "Banner created successfully!");
      router.push('/banners/list');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const currentImageUrl = files[0]?.uploadedUrl ||
    (files[0]?.uploading ? files[0].preview : formData.image_url);

  return (
    <ContentLayout title={isEdit ? "Edit Banner" : "Add Banner"}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/banners/list">Banners</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isEdit ? 'Edit' : 'Add'}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form Fields */}
          <div className="space-y-6 bg-white rounded-xl shadow-lg p-8">
            {/* Banner Name */}
            <div>
              <Label>Banner Name <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Enter the banner name"
                required
              />
            </div>

            {/* Auto Slug */}
            <div>
              <Label>Slug (auto-generated)</Label>
              <Input
                value={formData.slug}
                readOnly
                className="bg-gray-50 font-mono text-sm"
                placeholder="summer-sale-2025"
              />
              <p className="text-xs text-gray-500 mt-1">Used for URLs and API</p>
            </div>

            {/* Display Section */}
            <div>
              <Label>Display Section <span className="text-red-500">*</span></Label>
              <Select value={formData.banner_type} onValueChange={v => setFormData(p => ({ ...p, banner_type: v as BannerSection }))}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace(' us', ' Us')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label>Priority (optional, lower = higher display)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                    setFormData(p => ({ ...p, priority: val }));
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                placeholder="e.g. 10"
                min="1"
              />
            </div>

            {/* Schedule Start Time */}
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Start Time (optional)
              </Label>
              <Input
                type="datetime-local"
                value={formData.schedule_time}
                onChange={e => setFormData(p => ({ ...p, schedule_time: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Banner will appear only after this time
              </p>
            </div>

            {/* Link URL */}
            <div>
              <Label>Link URL (optional)</Label>
              <Input
                value={formData.link_url}
                onChange={e => setFormData(p => ({ ...p, link_url: e.target.value }))}
                placeholder="https://yoursite.com/promo"
              />
            </div>

            {/* Status */}
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
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Label>Banner Image <span className="text-red-500">*</span> (1200×600 recommended)</Label>
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
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <div className="text-white text-xl font-medium">Uploading...</div>
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
                    <div className="w-20 h-20 bg-gray-200 border-2 border-dashed rounded-xl mb-4" />
                    <p className="text-lg font-medium">No image selected</p>
                    <p className="text-sm mt-2">Upload a high-quality banner image</p>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="mt-6 block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer transition"
              />
            </div>
          </div>
        </div>

        {/* Black Buttons */}
        <div className="mt-10 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/banners/list')}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploading}
            className="bg-black hover:bg-gray-800 text-white px-8"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
}