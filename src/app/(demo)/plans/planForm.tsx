'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from 'primereact/editor';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tag, IndianRupee, Calendar, Users, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/utils/Loader';
import apiClient from '@/lib/apiClient';
import SafeHtml from '@/components/SafeHtml';
import clsx from 'clsx';

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

interface Service {
  id: string;
  title: string;
}

interface PlanService {
  service_id: string;
  visit_count: number;
  title?: string;
}

interface PlanFormProps {
  slug?: string;
}

export default function PlanForm({ slug }: PlanFormProps) {
  const router = useRouter();
  const params = useParams();
  const currentSlug = slug || (params.slug as string);
  const isEdit = !!currentSlug;

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<PlanService[]>([]);
  const [description, setDescription] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'residential',
    slug: '',
    base_price: '',
    duration_in_days: '365',
    stars: '',
    is_active: '1',
  });

  // Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await apiClient.get('/service/V1/get-all-service?filter=subscription');
        setServices(data.data || []);
        console.log(data,"dddddddddddddddddddata")
      } catch (err) {
        console.error('Failed to load services:', err);
      }
    };
    fetchServices();
  }, []);

  // Auto-update slug
  useEffect(() => {
    if (formData.name.trim() && formData.category) {
      const newSlug = generateSlug(formData.name, formData.category);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name, formData.category]);

  // Load existing plan on edit
  useEffect(() => {
    if (!isEdit || !currentSlug) return;

    const fetchPlan = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/plan/V1/get-plan-by-slug/${currentSlug}`);
        const plan = data.data;
        console.log(data,"slug dddddddddata")

        setFormData({
          name: plan.name || '',
          category: plan.category || 'residential',
          slug: plan.slug || '',
          base_price: plan.base_price?.toString() || '',
          duration_in_days: plan.duration_in_days?.toString() || '365',
          stars: plan.stars?.toString() || '',
          is_active: plan.is_active ? '1' : '0',
        });

        setDescription(plan.description || '');

        // Load plan services (from pivot table)
        if (plan.planSubServices && plan.planSubServices.length > 0) {
          const services = plan.planSubServices.map((ps: any) => ({
            service_id: ps.service_id,
            visit_count: ps.visit_count,
            title: ps.service?.title || '',
          }));
          setSelectedServices(services);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [currentSlug, isEdit]);

  // Add service with default visit count = 1
  const handleServiceSelect = (serviceId: string) => {
    if (selectedServices.some(s => s.service_id === serviceId)) return;

    setSelectedServices(prev => [
      ...prev,
      {
        service_id: serviceId,
        visit_count: 1,
      },
    ]);
  };

  const updateVisitCount = (serviceId: string, value: string) => {
    const num = Number(value);
    if (isNaN(num) || num < 1) return;

    setSelectedServices(prev =>
      prev.map(s =>
        s.service_id === serviceId
          ? { ...s, visit_count: num }
          : s
      )
    );
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.filter(s => s.service_id !== serviceId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert('Plan name is required');
    if (!formData.base_price || Number(formData.base_price) <= 0) return alert('Valid base price required');
    if (selectedServices.length === 0) return alert('Please add at least one service');

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        slug: generateSlug(formData.name, formData.category),
        base_price: Number(formData.base_price),
        duration_in_days: Number(formData.duration_in_days),
        stars: formData.stars ? Number(formData.stars) : null,
        description: description || null,
        is_active: formData.is_active === '1',
        plan_services: selectedServices, // [{ service_id, visit_count }]
        ...(isEdit && { old_slug: currentSlug }),
      };

      await apiClient.post('/plan/V1/upsert-plan', payload);
      router.push('/plans');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save plan');
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
          <div className="space-y-6 bg-white rounded-xl shadow-lg p-8">
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="w-5 h-5" /> Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Standard Plan"
                required
              />
            </div>

            <div>
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={formData.category} onValueChange={v => setFormData(prev => ({ ...prev, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>URL Slug (auto-generated)</Label>
              <Input value={formData.slug} readOnly className="bg-gray-100 font-mono text-sm" />
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
                onChange={e => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Duration (Days) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.duration_in_days}
                onChange={e => setFormData(prev => ({ ...prev, duration_in_days: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, stars: e.target.value }))}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.is_active} onValueChange={v => setFormData(prev => ({ ...prev, is_active: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RIGHT: Editor + Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-8 py-5 border-b">
                <h3 className="text-xl font-bold">Plan Description & Benefits</h3>
                <p className="text-sm text-gray-600 mt-1">Use headings, lists, bold — looks premium!</p>
              </div>
              <div className="p-6">
                <div className="border-2 border-gray-300 border-dashed rounded-xl overflow-hidden">
                  <Editor
                    value={description}
                    onTextChange={(e) => setDescription(e.htmlValue || '')}
                    style={{ height: '520px' }}
                    formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Included Services & Visit Count <span className="text-red-500">*</span>
              </h2>

              <div className="mb-6">
                <Label>Add Service</Label>
                <Select onValueChange={handleServiceSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service to include..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter(s => !selectedServices.some(ps => ps.service_id === s.id))
                      .map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {selectedServices.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                    No services added yet
                  </p>
                ) : (
                  selectedServices.map(item => {
                    const service = services.find(s => s.id === item.service_id);
                    return (
                      <div key={item.service_id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs font-medium">Visits per Year</Label>
                            <Input
                              type="number"
                              value={item.visit_count}
                              onChange={e => updateVisitCount(item.service_id, e.target.value)}
                              min="1"
                              className="w-24"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeService(item.service_id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="lg:col-span-2 flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/plans')}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedServices.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2 mt-10">
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
              <h3 className="text-2xl font-bold mb-6">Live Preview</h3>
              <div className="bg-white rounded-xl shadow-inner p-8 min-h-96">
                {description ? (
                  <SafeHtml html={description} />
                ) : (
                  <p className="text-gray-400 text-center py-16">
                    Start typing above to see live preview...
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
}