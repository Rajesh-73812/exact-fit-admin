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
import { Tag, FileText, LocateIcon, ImagePlus, Activity, UploadIcon, Link as LinkIcon, DollarSign, Percent } from 'lucide-react';
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
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const uploadImageToS3 = async (file: File): Promise<string> => {
    const BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET!;
    const REGION = process.env.NEXT_PUBLIC_S3_REGION!;
    const ACCESS_KEY = process.env.NEXT_PUBLIC_S3_ACCESS_KEY!;
    const SECRET_KEY = process.env.NEXT_PUBLIC_S3_SECRET_KEY!;

    const s3 = new S3Client({
        region: REGION,
        credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    });

    const fileName = `services/${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read',
    });

    await s3.send(command);
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`;
};

interface ParentService {
    id: string;
    title: string;
}

interface FormData {
    title: string;
    sub_service_slug: string;
    service_id: string;
    position: string;
    image_alt: string;
    status: 'active' | 'inactive';
    description: string;
    external_link: string;
    discount: string;
    price: string;
    image_url: File | null;
    existing_image_url: string | null;
    hero_banner_file: File | null;
    existing_hero_banner: string | null;
}

interface Errors {
    title?: string;
    service_id?: string;
    position?: string;
    description?: string;
    image_url?: string;
    hero_banner_file?: string;
    discount?: string;
    price?: string;
}

const SubServiceForm: React.FC = () => {
    const router = useRouter();
    const { slug } = useParams();
    const isEdit = !!slug && slug !== 'add';

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [heroBannerPreview, setHeroBannerPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImageEnlarged, setIsImageEnlarged] = useState(false);
    const [parentServices, setParentServices] = useState<ParentService[]>([]);
    const [errors, setErrors] = useState<Errors>({});

    const [formData, setFormData] = useState<FormData>({
        title: '',
        sub_service_slug: '',
        service_id: '',
        position: '',
        image_alt: '',
        status: 'active',
        description: '',
        external_link: '',
        discount: '',
        price: '',
        image_url: null,
        existing_image_url: null,
        hero_banner_file: null,
        existing_hero_banner: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { data: serviceRes } = await apiClient.get('/service/V1/get-all-service');
                const loadedParents = serviceRes.data.map((s: any) => ({
                    id: s.id,
                    title: s.title,
                }));
                setParentServices(loadedParents);

                if (isEdit && slug) {
                    const { data } = await apiClient.get(`/sub-service/V1/get-sub-service-by-slug/${slug}`);
                    const svc = data.data;

                    setFormData({
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
                        image_url: null,
                        existing_image_url: svc.image_url || null,
                        hero_banner_file: null,
                        existing_hero_banner: svc.hero_banner || null,
                    });

                    setImagePreview(svc.image_url || null);
                    setHeroBannerPreview(svc.hero_banner || null);
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
        title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    // SLUG UPDATES ON BOTH CREATE AND EDIT
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'title' && { sub_service_slug: generateSlug(value) }),
        }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image_url: 'Image must be ≤ 1 MB' }));
            return;
        }
        setErrors((prev) => ({ ...prev, image_url: undefined }));
        setFormData((prev) => ({ ...prev, image_url: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleHeroBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            setErrors((prev) => ({ ...prev, hero_banner_file: 'Hero banner must be ≤ 1 MB' }));
            return;
        }
        setErrors((prev) => ({ ...prev, hero_banner_file: undefined }));
        setFormData((prev) => ({ ...prev, hero_banner_file: file }));
        const reader = new FileReader();
        reader.onloadend = () => setHeroBannerPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        else if (formData.title.length < 2) newErrors.title = 'Title too short';
        if (!formData.service_id) newErrors.service_id = 'Parent service is required';
        if (formData.position && isNaN(Number(formData.position))) newErrors.position = 'Position must be a number';
        if (formData.discount && isNaN(Number(formData.discount))) newErrors.discount = 'Discount must be a number';
        if (formData.price && isNaN(Number(formData.price))) newErrors.price = 'Price must be a number';
        if (formData.description && formData.description.length < 10) newErrors.description = 'Description too short';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let finalImageUrl: string | null = formData.existing_image_url;
            if (formData.image_url) {
                finalImageUrl = await uploadImageToS3(formData.image_url);
            }

            let finalHeroBannerUrl: string | null = formData.existing_hero_banner;
            if (formData.hero_banner_file) {
                finalHeroBannerUrl = await uploadImageToS3(formData.hero_banner_file);
            }

            const payload = {
                sub_service_slug: generateSlug(formData.title),
                ...(isEdit && { old_sub_service_slug: slug as string }), // SEND OLD SLUG ON EDIT

                service_id: formData.service_id,
                title: formData.title.trim(),
                position: formData.position ? Number(formData.position) : null,
                description: formData.description || null,
                image_url: finalImageUrl,
                image_alt: formData.image_alt || null,
                status: formData.status,
                external_link: formData.external_link || null,
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

    // ──────────────────────── RENDER ────────────────────────
    return (
        <ContentLayout title={isEdit ? 'Edit Sub-Service' : 'Add Sub-Service'}>
            {isLoading && <Loader />}

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/subservices">Sub Services</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{isEdit ? 'Edit' : 'Add'}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row">
                        {/* LEFT: FORM */}
                        <div className="w-full lg:w-1/2 p-8 space-y-6">
                            {/* Title */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <Tag className="w-5 h-5 mr-2" />
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter title"
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            {/* Slug */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <Tag className="w-5 h-5 mr-2" />
                                    Slug {isEdit && '(auto-generated on create)'}
                                </Label>
                                <Input
                                    name="sub_service_slug"
                                    value={formData.sub_service_slug}
                                    readOnly
                                    className="bg-gray-100"
                                />
                            </div>

                            {/* Parent Service */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <LinkIcon className="w-5 h-5 mr-2" />
                                    Parent Service <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.service_id} onValueChange={(v) => setFormData(prev => ({ ...prev, service_id: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parentServices.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.service_id && <p className="text-red-500 text-sm mt-1">{errors.service_id}</p>}
                            </div>

                            {/* Position */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <LocateIcon className="w-5 h-5 mr-2" />
                                    Position
                                </Label>
                                <Input
                                    type="number"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="0"
                                />
                                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                            </div>

                            {/* Price & Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="flex items-center mb-2">
                                        <DollarSign className="w-5 h-5 mr-2" />
                                        Price
                                    </Label>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label className="flex items-center mb-2">
                                        <Percent className="w-5 h-5 mr-2" />
                                        Discount (%)
                                    </Label>
                                    <Input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Status
                                </Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as 'active' | 'inactive' }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* External Link */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <LinkIcon className="w-5 h-5 mr-2" />
                                    External Link
                                </Label>
                                <Input
                                    name="external_link"
                                    value={formData.external_link}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Image Alt */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <ImagePlus className="w-5 h-5 mr-2" />
                                    Image Alt Text
                                </Label>
                                <Input
                                    name="image_alt"
                                    value={formData.image_alt}
                                    onChange={handleInputChange}
                                    placeholder="Descriptive alt text"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <Label className="flex items-center mb-2">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Description
                                </Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Detailed description..."
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                        </div>

                        {/* RIGHT: IMAGE */}
                        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center space-y-8">

                            {/* SUB-SERVICE IMAGE */}
                            <div>
                                <Label className="flex items-center mb-3 text-base font-medium">
                                    <ImagePlus className="w-5 h-5 mr-2" />
                                    Sub-Service Image
                                </Label>
                                <div className="relative h-80 border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Sub-service preview"
                                            fill
                                            className="object-contain cursor-pointer"
                                            onClick={() => setIsImageEnlarged(true)}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <UploadIcon className="w-12 h-12 mb-3" />
                                            <p className="font-medium">No Image</p>
                                            <p className="text-sm">JPG, PNG ≤ 1MB</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>
                                {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
                            </div>

                            {/* HERO BANNER */}
                            <div>
                                <Label className="flex items-center mb-3 text-base font-medium">
                                    <ImagePlus className="w-5 h-5 mr-2" />
                                    Hero Banner
                                </Label>
                                <div className="relative h-80 border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden">
                                    {heroBannerPreview ? (
                                        <Image
                                            src={heroBannerPreview}
                                            alt="Hero banner preview"
                                            fill
                                            className="object-contain cursor-pointer"
                                            onClick={() => setIsImageEnlarged(true)}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <UploadIcon className="w-12 h-12 mb-3" />
                                            <p className="font-medium">No Hero Banner</p>
                                            <p className="text-sm">JPG, PNG ≤ 1MB</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleHeroBannerChange}
                                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>
                                {errors.hero_banner_file && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hero_banner_file}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Button type="submit" disabled={isLoading} className="px-8">
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push('/subservices')} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>

            {/* Enlarged Image Modal */}
            {isImageEnlarged && imagePreview && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4" onClick={() => setIsImageEnlarged(false)}>
                    <div className="relative max-w-4xl w-full h-full">
                        <Image src={imagePreview} alt="Enlarged" fill className="object-contain" />
                        <button
                            className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
                            onClick={() => setIsImageEnlarged(false)}
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