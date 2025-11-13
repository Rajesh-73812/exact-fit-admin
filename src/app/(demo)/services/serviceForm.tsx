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
import { Tag, FileText, LocateIcon, ImagePlus, Activity, UploadIcon } from 'lucide-react';
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

// ────────────────────────────────────────────────────────────────
// AWS S3 Upload Helper (replace with your env vars)
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
// ────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  service_slug?: string;
  position: string;
  image_alt: string;
  is_active: string;
  description: string;
  image_url: File | null;
  existing_image_url?: string; // keep old URL when no new file
}

interface Errors {
  title?: string;
  position?: string;
  image_alt?: string;
  description?: string;
  image_url?: string;
}

interface ServiceFormProps {
  slug?: string; // Make it optional because it will only be available in edit mode
}
const ServiceForm: React.FC<ServiceFormProps> = ({ slug }) => { 
   const router = useRouter();
  // const { slug } = useParams();               // <-- slug from URL
  const isEdit = !!slug;                      // true → edit, false → create

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    service_slug: '',
    position: '',
    image_alt: '',
    is_active: '1',
    description: '',
    image_url: null,
    existing_image_url: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  // ──────────────────────── FETCH (EDIT MODE) ────────────────────────
  useEffect(() => {
    if (!isEdit) return;

    const fetchService = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get(`/service/V1/get-service-by-slug/${slug}`);
        const cat = data.data;

        setFormData({
          title: cat.title || '',
          service_slug: cat.service_slug || '',
          position: cat.position?.toString() || '',
          image_alt: cat.image_alt || '',
          is_active: cat.status === 'active' ? '1' : '0',
          description: cat.description || '',
          image_url: null,
          existing_image_url: cat.image_url || '',
        });
        setImagePreview(cat.image_url || null);
      } catch (err: any) {
        console.error('Failed to load service:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [slug, isEdit]);

  // ──────────────────────── SLUG GENERATOR ────────────────────────
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // ──────────────────────── INPUT HANDLERS ────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !isEdit && { service_slug: generateSlug(value) }), // only auto-fill on create
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, is_active: value }));
  };

  // ──────────────────────── VALIDATION ────────────────────────
  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.title) newErrors.title = 'Title is required';
    else if (formData.title.length < 2 || formData.title.length > 255)
      newErrors.title = 'Title: 2–255 characters';

    if (formData.position && isNaN(Number(formData.position)))
      newErrors.position = 'Position must be a number';

    if (formData.description && formData.description.length < 10)
      newErrors.description = 'Description ≥ 10 chars';

    if (formData.image_alt && (formData.image_alt.length < 2 || formData.image_alt.length > 255))
      newErrors.image_alt = 'Alt text: 2–255 chars';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ──────────────────────── SUBMIT ────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let finalImageUrl: string | null = formData.existing_image_url || null;

      // Upload new image if selected
      if (formData.image_url) {
        finalImageUrl = await uploadImageToS3(formData.image_url);
      }

      const payload = {
        ...(isEdit && { service_slug: formData.service_slug }), // send slug on edit
        title: formData.title,
        ...(isEdit ? {} : { service_slug: generateSlug(formData.title) }), // auto on create
        position: formData.position ? Number(formData.position) : null,
        description: formData.description,
        image_url: finalImageUrl,
        image_alt: formData.image_alt,
        status: formData.is_active === '1' ? 'active' : 'inactive',
        external_link: '',
      };

      await apiClient.post('/service/V1/upsert-service', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      router.push('/services');
    } catch (err: any) {
      console.error('Save error:', err);
      if (err.response?.data?.errors) {
        const newErrors: Errors = {};
        err.response.data.errors.forEach((e: { field: string; message: string }) => {
          const map: Record<string, keyof Errors> = {
            title: 'title',
            position: 'position',
            image_alt: 'image_alt',
            description: 'description',
            image_url: 'image_url',
          };
          const key = map[e.field] || (e.field as keyof Errors);
          newErrors[key] = e.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <ContentLayout title={isEdit ? 'Edit Service' : 'Add Service'}>
      {isLoading && <Loader />}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/service" prefetch={false}>Services</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEdit ? 'Edit Service' : 'Add Service'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row">
            {/* ─────── LEFT: FORM FIELDS ─────── */}
            <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-600">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <Tag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Service Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="title"
                    placeholder="Enter Service name"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Slug (read-only in edit) */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <Tag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Slug {isEdit && '(auto-generated)'}
                  </Label>
                  <Input
                    name="service_slug"
                    placeholder="auto-generated"
                    value={formData.service_slug}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                {/* Position */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <LocateIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Position
                  </Label>
                  <Input
                    type="number"
                    name="position"
                    min={0}
                    placeholder="Enter Position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={errors.position ? 'border-red-500' : ''}
                  />
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>

                {/* Image ALT */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <ImagePlus className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Image ALT
                  </Label>
                  <Input
                    name="image_alt"
                    placeholder="Enter Image Alternative"
                    value={formData.image_alt}
                    onChange={handleInputChange}
                    className={errors.image_alt ? 'border-red-500' : ''}
                  />
                  {errors.image_alt && <p className="text-red-500 text-sm mt-1">{errors.image_alt}</p>}
                </div>

                {/* Status */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <Activity className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.is_active} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    <FileText className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                    Description
                  </Label>
                  <Textarea
                    name="description"
                    placeholder="Enter Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* ─────── RIGHT: IMAGE PREVIEW ─────── */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white dark:bg-gray-800">
              <div className="w-full h-72 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl flex items-center justify-center relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg cursor-pointer"
                    onClick={() => setIsImageEnlarged(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <UploadIcon className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                    <span className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
                      No Image Selected
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      JPEG, PNG, up to 1MB
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {errors.image_url && <p className="text-red-500 text-sm mt-2">{errors.image_url}</p>}

              {/* Enlarged Image Modal */}
              {isImageEnlarged && imagePreview && (
                <div
                  className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
                  onClick={() => setIsImageEnlarged(false)}
                >
                  <div className="relative w-full h-full max-w-4xl max-h-4xl">
                    <Image src={imagePreview} alt="Enlarged" fill className="object-contain rounded-lg" />
                    <button
                      className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
                      onClick={() => setIsImageEnlarged(false)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────── BUTTONS ─────── */}
          <div className="flex justify-end mt-6 space-x-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/services')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </ContentLayout>
  );
};

export default ServiceForm;