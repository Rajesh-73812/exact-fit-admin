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
import { Home, IndianRupee, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Loader from '@/components/utils/Loader';
import apiClient from '@/lib/apiClient';
import SafeHtml from '@/components/SafeHtml';

const generateSlug = (title: string): string => {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface Plan {
  id: string;
  name: string;
  base_price: number;
  category: string;
}

interface SubscriptionWithPrice {
  subscription_plan_id: string;
  residential_price: number;
  commercial_price: number;
}

interface PropertyFormProps {
  slug?: string;
}

export default function PropertyForm({ slug }: PropertyFormProps) {
  const router = useRouter();
  const params = useParams();
  const currentSlug = slug || (params.slug as string);
  const isEdit = !!currentSlug;

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<SubscriptionWithPrice[]>([]);
  const [description, setDescription] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    is_active: '1',
  });

  // Fetch all subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await apiClient.get('/plan/V1/get-all-plan');
        setPlans(data.data || []);
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
    };
    fetchPlans();
  }, []);

  // Auto-generate slug
  useEffect(() => {
    if (formData.name.trim()) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name]);

  // Load existing property on edit
  useEffect(() => {
    if (!isEdit || !currentSlug) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/property/V1/get-property-by-slug/${currentSlug}`);

        const property = data;

        setFormData({
          name: property.name || '',
          slug: property.slug || '',
          is_active: property.is_active ? '1' : '0',
        });

        setDescription(property.description || '');

        if (property.propertySubscriptions && property.propertySubscriptions.length > 0) {
          const formattedSubscriptions: SubscriptionWithPrice[] =
            property.propertySubscriptions.map((sub: any) => ({
              subscription_plan_id: sub.subscription_plan_id,
              residential_price: Number(sub.residential_price),
              commercial_price: Number(sub.commercial_price),
            }));

          const uniqueSubs = formattedSubscriptions.reduce(
            (acc: SubscriptionWithPrice[], current: SubscriptionWithPrice) => {
              const exists = acc.find(
                item => item.subscription_plan_id === current.subscription_plan_id,
              );
              if (!exists) acc.push(current);
              return acc;
            },
            [],
          );

          setSelectedPlans(uniqueSubs);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [currentSlug, isEdit]);

  // Add plan — only set relevant price based on category
  const handlePlanSelect = (planId: string) => {
    if (selectedPlans.some(p => p.subscription_plan_id === planId)) return;

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const isResidential = plan.category === "residential";
    const isCommercial = plan.category === "commercial";

    setSelectedPlans(prev => [
      ...prev,
      {
        subscription_plan_id: planId,
        residential_price: isResidential ? plan.base_price ?? 0 : 0,
        commercial_price: isCommercial ? plan.base_price ?? 0 : 0,
      },
    ]);
  };

  const updatePlanPrice = (
    planId: string,
    field: 'residential_price' | 'commercial_price',
    value: string,
  ) => {
    const num = Number(value);
    if (value === '' || isNaN(num) || num < 0) return;

    setSelectedPlans(prev =>
      prev.map(p =>
        p.subscription_plan_id === planId
          ? { ...p, [field]: num }
          : p,
      ),
    );
  };

  const removePlan = (planId: string) => {
    setSelectedPlans(prev =>
      prev.filter(p => p.subscription_plan_id !== planId),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert('Property name is required');
    if (selectedPlans.length === 0) return alert('Please select at least one subscription plan');

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        description: description || null,
        is_active: formData.is_active === '1',
        subscriptions: selectedPlans,
        ...(isEdit && { old_slug: currentSlug }),
      };

      await apiClient.post('/property/V1/upsert-property', payload);
      router.push('/property');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title={isEdit ? 'Edit Property Type' : 'Create Property Type'}>
      {loading && <Loader />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href="/property">Properties</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEdit ? 'Edit' : 'Create'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Form Fields */}
          <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="w-5 h-5" /> Property Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Villa, Apartment, Office"
                required
              />
            </div>

            <div>
              <Label>URL Slug (auto-generated)</Label>
              <Input value={formData.slug} readOnly className="bg-gray-100 font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-1">Updates automatically from name</p>
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

          {/* RIGHT: Rich Editor + Live Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-5 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Property Description & Features
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use headings, lists, bold — make it premium!
                </p>
              </div>

              <div className="p-6 property-description-editor">
                <div className="border-2 border-gray-300 border-dashed rounded-xl overflow-hidden">
                  <Editor
                    className='rich-text-editor'
                    value={description}
                    onTextChange={(e) => setDescription(e.htmlValue || '')}
                    style={{ height: '489px',  }}
                    formats={[
                      'header', 'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet', 'indent', 'link'
                    ]}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                      ]
                    }}
                  />
                </div>

                <div className="mt-4 text-xs text-gray-500 flex justify-between">
                  <span>Pro Tip: Use bullet lists for features!</span>
                  <span>Live preview below</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plans Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <IndianRupee className="w-6 h-6 text-green-600" />
                Subscription Plans & Pricing <span className="text-red-500">*</span>
              </h2>

              <div className="mb-6">
                <Label>Add Subscription Plan</Label>
                <Select onValueChange={handlePlanSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a subscription plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans
                      .filter(plan => !selectedPlans.some(p => p.subscription_plan_id === plan.id))
                      .map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} — Base: ₹{plan.base_price} ({plan.category})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {selectedPlans.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                    No subscription plan selected yet
                  </p>
                ) : (
                  selectedPlans.map(item => {
                    const plan = plans.find(p => p.id === item.subscription_plan_id);
                    if (!plan) return null;

                    const isResidential = plan.category === "residential";
                    const isCommercial = plan.category === "commercial";

                    return (
                      <div key={item.subscription_plan_id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-semibold">{plan.name}</p>
                          <p className="text-sm text-gray-600">
                            Base: ₹{plan.base_price} ({plan.category})
                          </p>
                        </div>

                        <div className="flex items-center gap-8">
                          {isResidential && (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-gray-600">Residential Price</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">₹</span>
                                <Input
                                  type="number"
                                  value={item.residential_price}
                                  onChange={e => updatePlanPrice(item.subscription_plan_id, 'residential_price', e.target.value)}
                                  className="w-32"
                                  min="0"
                                  step="1"
                                />
                              </div>
                            </div>
                          )}

                          {isCommercial && (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-gray-600">Commercial Price</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">₹</span>
                                <Input
                                  type="number"
                                  value={item.commercial_price}
                                  onChange={e => updatePlanPrice(item.subscription_plan_id, 'commercial_price', e.target.value)}
                                  className="w-32"
                                  min="0"
                                  step="1"
                                />
                              </div>
                            </div>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlan(item.subscription_plan_id)}
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

              {selectedPlans.length === 0 && (
                <p className="text-center text-red-600 mt-6 font-medium">
                  Please select at least one subscription plan
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="lg:col-span-2 flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/properties')}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedPlans.length === 0}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
            </Button>
          </div>

          {/* LIVE PREVIEW */}
          <div className="lg:col-span-2 mt-10">
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h3>
              <div className="bg-white rounded-xl shadow-inner p-8 min-h-96">
                {description ? (
                  <SafeHtml html={description} />
                ) : (
                  <p className="text-gray-400 text-center py-16">
                    Start typing in the editor above to see live preview...
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