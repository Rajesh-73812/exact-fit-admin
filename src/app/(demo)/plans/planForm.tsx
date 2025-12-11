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
import SafeHtml from '@/components/SafeHtml';

interface PlanFormProps {
  slug?: string;
}
const generateSlug = (name: string, category: string): string => {
  const cleanName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${cleanName}-${category.toLowerCase()}`;
};

export default function PlanForm({ slug }: PlanFormProps) {
  const router = useRouter();
  const params = useParams();
  const currentSlug = slug || (params.slug as string);
  const isEdit = !!currentSlug;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'residential',
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
    if (formData.name.trim() && formData.category) {
      const newSlug = generateSlug(formData.name, formData.category);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name, formData.category]);

  // Load existing plan
  useEffect(() => {
    if (!isEdit || !currentSlug) return;

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/plan/V1/get-plan-by-slug/${slug}`);
        const plan = data.data;

        setFormData({
          name: plan.name || '',
          category: plan.category || '',
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
    const newSlug = generateSlug(formData.name, formData.category);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      slug: newSlug,
      // ALWAYS send old_slug when editing — this is the key!
      ...(isEdit && { old_slug: currentSlug }),
      base_price: Number(formData.base_price),
      duration_in_days: Number(formData.duration_in_days),
      scheduled_visits_count: Number(formData.scheduled_visits_count),
      stars: formData.stars ? Number(formData.stars) : null,
      description: description || null,
      is_active: formData.is_active === '1',
    };

    console.log('SUBMITTING PAYLOAD:', payload);
    console.log('isEdit:', isEdit, 'currentSlug:', currentSlug, 'newSlug:', newSlug);

    await apiClient.post('/plan/V1/upsert-plan', payload);
    router.push('/plans');
  } catch (err: any) {
    console.error('SUBMIT ERROR:', err.response?.data || err);
    alert(err.response?.data?.message || 'Failed to save');
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
              <Label className="flex items-center gap-2">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                </SelectContent>
              </Select>
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

          {/* RIGHT: PrimeReact Editor - FIXED & PREMIUM */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-8 py-5 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Plan Description & Benefits
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use headings, bold, lists, — looks premium!
                </p>
              </div>

              {/* Editor with Clean Toolbar */}
              <div className="p-6">
                <div className="border-2 border-gray-300 border-dashed rounded-xl overflow-hidden">
                  <Editor
                    value={description}
                    onTextChange={(e) => setDescription(e.htmlValue || '')}
                    style={{ height: '520px' }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'indent',
                      'link'
                    ]}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' },],
                        // [{ list: 'ordered' }, { list: 'bullet' }],
                        // ['link'],
                        // ['clean']
                      ]
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Pro Tip: Use numbered lists for benefits — converts better!</span>
                  <span className="flex items-center gap-1">
                    Live preview below
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/plans')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-black px-8">
              {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
        {/* LIVE PREVIEW SECTION */}
        <div className="lg:col-span-2 mt-10">
          <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              Live Preview
            </h3>
            <div className="bg-white rounded-xl shadow-inner p-8 min-h-96">
              {description ? (
                <SafeHtml html={description} />
              ) : (
                <p className="text-gray-400 text-center py-16">
                  Start typing in the editor to see live preview here...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}