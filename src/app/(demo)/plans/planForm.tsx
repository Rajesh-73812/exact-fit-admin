'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from 'primereact/editor';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tag, Activity, IndianRupee, Calendar, Users, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/utils/Loader';
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

export default function PlanForm() {
  const router = useRouter();
  const { slug } = useParams();
  const isEdit = !!slug;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    base_price: '',
    duration_in_days: '365',
    scheduled_visits_count: '1',
    stars: '',
    is_active: '1',
  });
  const [description, setDescription] = useState<string>('');

  // Auto-update slug
  useEffect(() => {
    if (formData.name.trim()) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name]);

  // Load existing plan
  useEffect(() => {
    if (!isEdit || !slug) return;

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/subscription-plan/V1/get-by-slug/${slug}`);
        const plan = data.data;

        setFormData({
          name: plan.name || '',
          slug: plan.slug || '',
          base_price: plan.base_price?.toString() || '',
          duration_in_days: plan.duration_in_days?.toString() || '365',
          scheduled_visits_count: plan.scheduled_visits_count?.toString() || '1',
          stars: plan.stars?.toString() || '',
          is_active: plan.is_active ? '1' : '0',
        });
        setDescription(plan.description || '');
      } catch (err) {
        alert('Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [slug, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert('Plan name is required');
    if (!formData.base_price || Number(formData.base_price) <= 0) return alert('Valid base price is required');
    if (!formData.duration_in_days || Number(formData.duration_in_days) <= 0) return alert('Duration must be greater than 0');
    if (!formData.scheduled_visits_count || Number(formData.scheduled_visits_count) <= 0) return alert('Visits must be at least 1');

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        ...(isEdit && { old_slug: slug as string }),
        base_price: Number(formData.base_price),
        duration_in_days: Number(formData.duration_in_days),
        scheduled_visits_count: Number(formData.scheduled_visits_count),
        stars: formData.stars ? Number(formData.stars) : null,
        description: description || null,
        is_active: formData.is_active === '1',
      };

      await apiClient.post('/subscription-plan/V1/upsert', payload);
      router.push('/plans');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title={isEdit ? 'Edit Subscription Plan' : 'Create New Plan'}>
      {loading && <Loader />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/plans">Plans</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isEdit ? 'Edit' : 'Create'}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Form Fields */}
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="w-5 h-5" /> Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Standard Plan / Year"
                required
              />
            </div>

            <div>
              <Label>URL Slug (auto-generated)</Label>
              <Input value={formData.slug} readOnly className="bg-gray-100 font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Updates automatically from plan name</p>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" /> Base Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                placeholder="499.00"
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Duration (in Days) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.duration_in_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_in_days: e.target.value }))}
                placeholder="365"
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Scheduled Visits <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.scheduled_visits_count}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_visits_count: e.target.value }))}
                placeholder="2"
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Star className="w-5 h-5" /> Rating Stars (Optional)
              </Label>
              <Input
                type="number"
                min="0"
                max="5"
                value={formData.stars}
                onChange={(e) => setFormData(prev => ({ ...prev, stars: e.target.value }))}
                placeholder="e.g. 4"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Activity className="w-5 h-5" /> Status
              </Label>
              <Select value={formData.is_active} onValueChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RIGHT: PrimeReact Editor */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg">Plan Description & Benefits</h3>
                <p className="text-sm text-gray-600">Rich text editor with bold, lists, headings, links, etc.</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800">
                <Editor
                  value={description}
                  onTextChange={(e) => setDescription(e.htmlValue || '')}
                  style={{ height: '520px' }}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/plans')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 px-8">
              {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}