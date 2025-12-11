'use client';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Tag, FileText, LocateIcon, ImagePlus,
    Activity, UploadIcon, Link as LinkIcon,
    DollarSign, Percent
} from 'lucide-react';
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

interface ParentService {
    id: string;
    title: string;
}

const SubServiceForm: React.FC = () => {
    const router = useRouter();
    const { slug } = useParams();
    const isEdit = !!slug && slug !== 'add';

    // Image Upload Hooks
    const {
        files: serviceImageFiles,
        uploading: uploadingImage,
        uploadFiles: uploadServiceImage,
        removeFile: removeServiceImage,
        getUploadedUrls: getServiceImageUrl,
    } = usePresignedUpload("sub-services");

    const {
        files: heroFiles,
        uploading: uploadingHero,
        uploadFiles: uploadHeroImage,
        removeFile: removeHeroImage,
        getUploadedUrls: getHeroImageUrl,
    } = usePresignedUpload("sub-service-hero-banners");

    // Form State
    const [isLoading, setIsLoading] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
    const [parentServices, setParentServices] = useState<ParentService[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: '',
        sub_service_slug: '',
        service_id: '',
        position: '',
        image_alt: '',
        status: 'active' as 'active' | 'inactive',
        description: '',
        external_link: '',
        discount: '',
        price: '',
        existing_image_url: null as string | null,
        existing_hero_banner: null as string | null,
    });

    // Load Parent Services + Edit Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data: serviceRes } = await apiClient.get('/service/V1/get-all-service');
                setParentServices(serviceRes.data.map((s: any) => ({ id: s.id, title: s.title })));

                if (isEdit && slug) {
                    const { data } = await apiClient.get(`/sub-service/V1/get-sub-service-by-slug/${slug}`);
                    const svc = data.data;

                    setFormData(prev => ({
                        ...prev,
                        title: svc.title || '',
                        sub_service_slug: svc.sub_service_slug || '',
                        service_id: svc.service_id || '',
                        position: svc.position?.toString() || '',
                        image_alt: svc.image_alt || '',
                        status: svc.status || 'active',
                        description: svc.description || '',
                        external_link: svc.external_link || '',
                        discount: svc.discount?.toString() || '',
                        price: svc.price?.toString() || '',
                        existing_image_url: svc.image_url || null,
                        existing_hero_banner: svc.hero_banner || null,
                    }));
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [slug, isEdit]);

    const generateSlug = (title: string) =>
        title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'title' && { sub_service_slug: generateSlug(value) }),
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image_url: "Image must be ≤ 5MB" }));
            return;
        }
        uploadServiceImage([file]);
    };

    const handleHeroBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, hero_banner: "Hero banner must be ≤ 5MB" }));
            return;
        }
        uploadHeroImage([file]);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.service_id) newErrors.service_id = 'Parent service is required';
        if (formData.position && isNaN(Number(formData.position))) newErrors.position = 'Invalid position';
        if (formData.price && isNaN(Number(formData.price))) newErrors.price = 'Invalid price';
        if (formData.discount && (isNaN(Number(formData.discount)) || Number(formData.discount) > 100))
            newErrors.discount = 'Invalid discount';
        if (formData.description.trim().length < 10)
            newErrors.description = 'Description must be at least 10 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (uploadingImage || uploadingHero) {
            alert("Please wait for images to finish uploading");
            return;
        }

        setIsLoading(true);
        try {
            const finalImageUrl = getServiceImageUrl()[0] || formData.existing_image_url;
            const finalHeroBannerUrl = getHeroImageUrl()[0] || formData.existing_hero_banner;

            const payload = {
                sub_service_slug: generateSlug(formData.title),
                ...(isEdit && { old_sub_service_slug: slug as string }),
                service_id: formData.service_id,
                title: formData.title.trim(),
                position: formData.position ? Number(formData.position) : null,
                description: formData.description.trim() || null,
                image_url: finalImageUrl || null,
                image_alt: formData.image_alt.trim() || null,
                status: formData.status,
                external_link: formData.external_link.trim() || null,
                discount: formData.discount ? Number(formData.discount) : null,
                price: formData.price ? Number(formData.price) : null,
                hero_banner: finalHeroBannerUrl || null,
            };

            await apiClient.post('/sub-service/V1/upsert-sub-service', payload);
            router.push('/subservices');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get current image URL
    const getImageUrl = (files: any[], existing: string | null) =>
        files[0]?.uploadedUrl || files[0]?.preview || existing;

    return (
        <ContentLayout title={isEdit ? 'Edit Sub-Service' : 'Add Sub-Service'}>
            {isLoading && <Loader />}

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><Link href="/subservices">Sub Services</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{isEdit ? 'Edit' : 'Add'}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-8 max-w-7xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Form Fields */}
                    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        {/* Title */}
                        <div>
                            <Label className="flex items-center gap-2"><Tag className="w-5 h-5" /> Title <span className="text-red-500">*</span></Label>
                            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter title" />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Slug */}
                        <div>
                            <Label>Slug</Label>
                            <Input value={formData.sub_service_slug} readOnly className="bg-gray-100 font-mono" />
                        </div>

                        {/* Parent Service */}
                        <div>
                            <Label className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Parent Service <span className="text-red-500">*</span></Label>
                            <Select value={formData.service_id} onValueChange={(v) => setFormData(prev => ({ ...prev, service_id: v }))}>
                                <SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger>
                                <SelectContent>
                                    {parentServices.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>}
                        </div>

                        {/* Position, Price, Discount */}
                            <div>
                                <Label><LocateIcon className="w-5 h-5 inline mr-2" /> Position</Label>
                                <Input type="number" name="position" value={formData.position} onChange={handleInputChange} placeholder="0" />
                            </div>
                            <div>
                                <Label><DollarSign className="w-5 h-5 inline mr-2" /> Price</Label>
                                <Input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" />
                            </div>
                            <div>
                                <Label><Percent className="w-5 h-5 inline mr-2" /> Discount (In Percentage)</Label>
                                <Input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" placeholder="0" />
                            </div>

                        <div>
                            <Label><Activity className="w-5 h-5 inline mr-2" /> Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as any }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label><LinkIcon className="w-5 h-5 inline mr-2" /> External Link</Label>
                            <Input name="external_link" value={formData.external_link} onChange={handleInputChange} placeholder="https://" />
                        </div>

                        <div>
                            <Label><ImagePlus className="w-5 h-5 inline mr-2" /> Image Alt Text</Label>
                            <Input name="image_alt" value={formData.image_alt} onChange={handleInputChange} placeholder="SEO alt text" />
                        </div>

                        <div>
                            <Label><FileText className="w-5 h-5 inline mr-2" /> Description</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Detailed description..." />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    {/* RIGHT: Images */}
                    <div className="space-y-8">
                        {/* Sub-Service Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <Label className="text-lg font-semibold mb-4 block">Sub-Service Image</Label>
                            <div
                                className="relative h-80 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer bg-gray-50"
                                onClick={() => setEnlargedImageUrl(getImageUrl(serviceImageFiles, formData.existing_image_url))}
                            >
                                {getImageUrl(serviceImageFiles, formData.existing_image_url) ? (
                                    <Image
                                        src={getImageUrl(serviceImageFiles, formData.existing_image_url)!}
                                        alt="Preview"
                                        fill
                                        className="object-contain hover:opacity-90 transition"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <UploadIcon className="w-16 h-16 mb-4" />
                                        <p className="font-medium">No Image Selected</p>
                                        <p className="text-sm">JPG, PNG ≤ 5MB</p>
                                    </div>
                                )}
                                {(uploadingImage) && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                                        <span className="text-white text-lg font-medium">Uploading...</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={uploadingImage}
                                    className="mt-4 block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                                />
                                {serviceImageFiles[0] && (
                                    <Button type="button" size="sm" variant="destructive" onClick={() => removeServiceImage(0)}>
                                        Remove Image
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Hero Banner */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <Label className="text-lg font-semibold mb-4 block">Hero Banner</Label>
                            <div
                                className="relative h-80 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer bg-gray-50"
                                onClick={() => setEnlargedImageUrl(getImageUrl(heroFiles, formData.existing_hero_banner))}
                            >
                                {getImageUrl(heroFiles, formData.existing_hero_banner) ? (
                                    <Image
                                        src={getImageUrl(heroFiles, formData.existing_hero_banner)!}
                                        alt="Hero preview"
                                        fill
                                        className="object-contain hover:opacity-90 transition"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <UploadIcon className="w-16 h-16 mb-4" />
                                        <p className="font-medium">No Hero Banner</p>
                                        <p className="text-sm">JPG, PNG ≤ 5MB</p>
                                    </div>
                                )}
                                {(uploadingHero) && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                                        <span className="text-white text-lg font-medium">Uploading...</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleHeroBannerChange}
                                    disabled={uploadingHero}
                                    className="mt-4 block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                                />
                                {heroFiles[0] && (
                                    <Button type="button" size="sm" variant="destructive" onClick={() => removeHeroImage(0)}>
                                        Remove Hero Banner
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Submit Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/subservices')}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading || uploadingImage || uploadingHero} className="bg-black">
                        {isLoading ? 'Saving...' : isEdit ? 'Update Sub-Service' : 'Create Sub-Service'}
                    </Button>
                </div>
            </div>

            {/* Enlarged Image Modal */}
            {enlargedImageUrl && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-8" onClick={() => setEnlargedImageUrl(null)}>
                    <div className="relative max-w-6xl w-full h-full">
                        <Image src={enlargedImageUrl} alt="Enlarged" fill className="object-contain" />
                        <button
                            className="absolute top-4 right-4 bg-white text-black rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold hover:bg-gray-200"
                            onClick={() => setEnlargedImageUrl(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </ContentLayout>
    );
};

export default SubServiceForm;