'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, IndianRupee, Tag, Trash2 } from 'lucide-react';
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

interface Plan {
    id: string;
    name: string;
    base_price: number;
}

interface SubscriptionWithPrice {
    subscription_plan_id: string;
    price: number;
}

interface PropertyFormProps {
  slug?: string;  
}
export default function PropertyForm({slug}: PropertyFormProps) {
    const router = useRouter();
    const params = useParams();
    const currentSlug = slug || (params.slug as string);
    const isEdit = !!currentSlug;

    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlans, setSelectedPlans] = useState<SubscriptionWithPrice[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        category: 'residential' as 'residential' | 'commercial',
        description: '',
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
    // Load existing property on edit
    useEffect(() => {
        if (!isEdit || !currentSlug) return;

        const fetchProperty = async () => {
            setLoading(true);
            try {
                const { data } = await apiClient.get(`/property/V1/get-property-by-slug/${currentSlug}`);
                console.log(data, "full response");

                const property = data; // <-- Important: use `data`, not `data.dataValues`

                setFormData({
                    name: property.name || '',
                    slug: property.slug || '',
                    category: property.category || 'residential',
                    description: property.description || '',
                    is_active: property.is_active ? '1' : '0',
                });

                // Fix: Use `propertySubscriptions` and convert price to number
                if (property.propertySubscriptions && property.propertySubscriptions.length > 0) {
                    const formattedSubscriptions = property.propertySubscriptions.map((sub: any) => ({
                        subscription_plan_id: sub.subscription_plan_id,
                        price: Number(sub.price) // Convert string → number
                    }));

                    // Remove duplicates (in case backend sends duplicates)
                    const uniqueSubs = formattedSubscriptions.reduce((acc: SubscriptionWithPrice[], current: SubscriptionWithPrice) => {
                        const exists = acc.find(item => item.subscription_plan_id === current.subscription_plan_id);
                        if (!exists) {
                            acc.push(current);
                        }
                        return acc;
                    }, []);

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

    // Add or update subscription price
    const handlePlanSelect = (planId: string) => {
        if (selectedPlans.some(p => p.subscription_plan_id === planId)) return; // prevent duplicate

        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        setSelectedPlans(prev => [
            ...prev,
            { subscription_plan_id: planId, price: plan.base_price }
        ]);
    };

    const updatePrice = (planId: string, price: string) => {
        if (price === '') {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
                setSelectedPlans(prev =>
                    prev.map(p =>
                        p.subscription_plan_id === planId ? { ...p, price: plan.base_price } : p
                    )
                );
            }
            return;
        }

        const num = Number(price);
        if (!isNaN(num) && num >= 0) {
            setSelectedPlans(prev =>
                prev.map(p => p.subscription_plan_id === planId ? { ...p, price: num } : p)
            );
        }
    };

    const removePlan = (planId: string) => {
        setSelectedPlans(prev => prev.filter(p => p.subscription_plan_id !== planId));
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
                category: formData.category,
                description: formData.description || null,
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
                    <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><Link href="/properties">Properties</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{isEdit ? 'Edit' : 'Create'}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Home className="w-6 h-6 text-indigo-600" />
                            Property Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label className="flex items-center gap-2">
                                    <Tag className="w-5 h-5" /> Property Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Bungalow, Villa, Apartment"
                                    required
                                />
                            </div>

                            <div>
                                <Label>URL Slug (auto-generated)</Label>
                                <Input value={formData.slug} readOnly className="bg-gray-50 font-mono text-sm" />
                            </div>

                            <div>
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(v: any) => setFormData(prev => ({ ...prev, category: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="residential">Residential</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select value={formData.is_active} onValueChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label>Description (Optional)</Label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    placeholder="Luxurious 5-bedroom villa with pool and garden..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subscription Plans */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <IndianRupee className="w-6 h-6 text-green-600" />
                            Subscription Plans & Pricing <span className="text-red-500">*</span>
                        </h2>

                        {/* Dropdown to Add Plan */}
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
                                                {plan.name} — Base: ₹{plan.base_price}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected Plans List */}
                        <div className="space-y-4">
                            {selectedPlans.length === 0 ? (
                                <p className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                                    No subscription plan selected yet
                                </p>
                            ) : (
                                selectedPlans.map(item => {
                                    const plan = plans.find(p => p.id === item.subscription_plan_id);
                                    return (
                                        <div key={item.subscription_plan_id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                            <div>
                                                <p className="font-semibold">{plan?.name || 'Unknown Plan'}</p>
                                                <p className="text-sm text-gray-600">Base Price: ₹{plan?.base_price}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updatePrice(item.subscription_plan_id, e.target.value)}
                                                        className="w-32"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Custom price"
                                                    />
                                                </div>
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

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
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
                </form>
            </div>
        </ContentLayout>
    );
}