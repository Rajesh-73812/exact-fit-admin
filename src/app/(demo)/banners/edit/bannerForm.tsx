'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockBanners, BannerSection } from '@/data/mockBanners';
import Image from 'next/image';
import Link from 'next/link';
import { Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react';

interface BannerFormProps {
  readOnly?: boolean;
}

const sectionOptions: BannerSection[] = ['homepage', 'about us', 'contact us', 'services'];

export default function BannerForm({ readOnly = false }: BannerFormProps) {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id && !readOnly;
  const isView = !!id && readOnly;

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    is_active: 'true',
    priority: '',
    section: 'homepage' as BannerSection,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const banner = mockBanners.find(b => b.id === id);
      if (banner) {
        setFormData({
          name: banner.name,
          image: banner.image,
          is_active: banner.is_active.toString(),
          priority: banner.priority.toString(),
          section: banner.section,
        });
        setImagePreview(banner.image);
      }
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (readOnly) return;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(p => ({ ...p, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    // In real app: save to API or localStorage
    alert(isEdit ? 'Banner updated!' : 'Banner created!');
    router.push('/banners/list');
  };

  return (
    <ContentLayout title={
      isView ? `View Banner: ${formData.name}` :
      isEdit ? 'Edit Banner' : 'Add Banner'
    }>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/banners/list">Banners</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>
            {isView ? 'View' : isEdit ? 'Edit' : 'Add'}
          </BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row">
          {/* LEFT – Form */}
          <div className="w-full lg:w-1/2 p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
            <div>
              <Label>Banner Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
                placeholder="e.g. Summer Sale"
              />
            </div>

            <div>
              <Label>Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(v) => handleSelectChange('section', v)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority (Lower = Higher)</Label>
              <Input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={readOnly}
                min="1"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={formData.is_active}
                onValueChange={(v) => handleSelectChange('is_active', v)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RIGHT – Image */}
          <div className="w-full lg:w-1/2 p-8 bg-white dark:bg-gray-800">
            <Label><ImageIcon className="w-5 h-5 mr-2" />Banner Image</Label>
            <div className="border-2 border-dashed rounded-xl p-4 mt-2">
              {imagePreview ? (
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">
                    {readOnly ? 'No image' : 'Upload JPG/PNG (1200x600 recommended)'}
                  </p>
                </div>
              )}
              {!readOnly && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-purple-50 file:text-purple-700"
                />
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          {!readOnly && (
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {isEdit ? 'Update' : 'Create'} Banner
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/banners/list')}
          >
            {readOnly ? 'Back to List' : 'Cancel'}
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
}