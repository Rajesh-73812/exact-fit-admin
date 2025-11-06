'use client';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from '@/components/ui/breadcrumb';
import { Tag, FileText, LocateIcon, ImagePlus, Activity, UploadIcon, } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import Loader from '@/components/utils/Loader';
// import { useNotification } from '@/components/ui/NotificationContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';

interface FormData {
  id?: string;
  name: string;
  position: string;
  image_alt: string;
  is_active: string;
  description: string;
  image: File | null;
}

interface Errors {
  name?: string;
  position?: string;
  image_alt?: string;
  description?: string;
  image?: string;
}

interface CategoryFormProps {
  id?: string; // ID prop for edit/view mode
  readOnly?: boolean; // Flag for view mode
}

const CategoryForm: React.FC<CategoryFormProps> = ({ id, readOnly = false }) => {
  const router = useRouter();
//   const { addNotification } = useNotification();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    position: '',
    image_alt: '',
    is_active: '1',
    description: '',
    image: null,
  });
  const [errors, setErrors] = useState<Errors>({});

  // Fetch category data for edit/view mode
  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          setIsLoading(true);
          const response = await apiClient.get(`/v1/category/getbyid/${id}`, { withCredentials: true });
          const category = response.data.category;
          setFormData({
            id: category.id,
            name: category.title || '',
            position: category.position?.toString() || '',
            image_alt: category.image_alt || '',
            is_active: category.is_active ? '1' : '0',
            description: category.description || '',
            image: null,
          });
          setImagePreview(category.image || null);
        } catch (error: any) {
          console.error('Error fetching category:', error);
        //   addNotification({
        //     title: 'Error',
        //     description: 'Failed to fetch category data.',
        //     variant: 'destructive',
        //   });
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id]);
//   }, [id, addNotification]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation for image size (1MB limit)
      if (file.size > 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must not exceed 1MB' }));
        return;
      }
      setErrors((prev) => ({ ...prev, image: undefined }));
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for the field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (value: string) => {
    if (readOnly) return;
    setFormData({ ...formData, is_active: value });
    setErrors((prev) => ({ ...prev, is_active: undefined }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.name) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2 || formData.name.length > 255) {
      newErrors.name = 'Name must be between 2 and 255 characters';
    }

    if (formData.position && isNaN(parseInt(formData.position))) {
      newErrors.position = 'Position must be a valid integer';
    }

    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters if provided';
    }

    if (formData.image_alt && (formData.image_alt.length < 2 || formData.image_alt.length > 255)) {
      newErrors.image_alt = 'Image alt text must be between 2 and 255 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    setIsLoading(true);

    // Perform client-side validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    if (formData.id) {
      form.append('id', formData.id);
    }
    form.append('name', formData.name);
    form.append('position', formData.position);
    form.append('image_alt', formData.image_alt);
    form.append('status', formData.is_active);
    form.append('description', formData.description);
    if (formData.image) {
      form.append('img', formData.image);
    }

    try {
      const response = await apiClient.post('/v1/category/upsert', form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    //   addNotification({
    //     title: 'Success',
    //     description: formData.id ? 'Category updated successfully!' : 'Category created successfully!',
    //     variant: 'default',
    //   });
      setFormData({
        name: '',
        position: '',
        image_alt: '',
        is_active: '1',
        description: '',
        image: null,
      });
      setImagePreview(null);
      setErrors({});
      router.push('/categories/list');
    } catch (error: any) {
      console.error('Error saving category:', error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const newErrors: Errors = {};
        validationErrors.forEach((err: { field: string; message: string }) => {
          // Map backend field names to frontend form field names
          const fieldMap: { [key: string]: keyof Errors } = {
            title: 'name',
            position: 'position',
            image_alt: 'image_alt',
            description: 'description',
            image: 'image',
          };
          const field = fieldMap[err.field] || err.field;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      } else {
        // addNotification({
        //   title: 'Error',
        //   description: error.response?.data?.message || 'Failed to save category.',
        //   variant: 'destructive',
        // });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentLayout title={id ? (readOnly ? 'View Category' : 'Edit Category') : 'Add Category'}>
      {isLoading && <Loader />}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {/* <Link href="/" prefetch={false}>
                Home
              </Link> */}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* <BreadcrumbSeparator /> */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false}>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/categories/list" prefetch={false}>
                Categories
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {id ? (readOnly ? 'View Category' : 'Edit Category') : 'Add Category'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <div className="min-h-screen bg-gradient-to-br">
          <div className="w-full ml-0">
            <form onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-600">
                  <div className="space-y-6">
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <Tag className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                        Category Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="name"
                        placeholder="Enter Category name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required={!readOnly}
                        disabled={readOnly}
                        className={errors.name ? 'border-red-500' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <LocateIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                        Position <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        name="position"
                        min={0}
                        placeholder="Enter Position"
                        value={formData.position}
                        onChange={handleInputChange}
                        required={!readOnly}
                        disabled={readOnly}
                        className={errors.position ? 'border-red-500' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'}
                      />

                      {errors.position && (
                        <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                      )}
                    </div>

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
                        disabled={readOnly}
                        className={errors.image_alt ? 'border-red-500' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'}
                      />
                      {errors.image_alt && (
                        <p className="text-red-500 text-sm mt-1">{errors.image_alt}</p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        <Activity className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                        Is Active <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        name="is_active"
                        value={formData.is_active}
                        onValueChange={handleSelectChange}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                        disabled={readOnly}
                        className={errors.description ? 'border-red-500' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* drop zone */}
                {/* <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white dark:bg-gray-800">
                  <div className="w-full h-72 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl flex items-center justify-center relative cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col justify-center items-center">
                        <UploadIcon className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500 text-center" />
                        <span className="text-gray-900 dark:text-gray-100 text-[18px] font-semibold">
                          {readOnly ? 'No Image' : 'Choose a file or drop it here'}
                        </span>
                        {!readOnly && (
                          <span className="text-gray-500 dark:text-gray-400 text-[13px]">
                            JPEG, PNG formats, up to 1MB
                          </span>
                        )}
                      </div>
                    )}
                    {!readOnly && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    )}
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-1 absolute bottom-2">{errors.image}</p>
                    )}
                  </div>
                </div> */}
                <div className="w-full md:w-1/2 p-8 flex flex-col  justify-center bg-white dark:bg-gray-800">
                  <div className="w-full h-72 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl flex items-center justify-center relative">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="max-h-full max-w-full object-contain rounded-lg cursor-pointer"
                        onClick={() => setIsImageEnlarged(true)}
                      />
                    ) : (
                      <div className="flex flex-col justify-center items-center text-center">
                        <UploadIcon className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-900 dark:text-gray-100 text-[18px] font-semibold">
                          No Image Selected
                        </span>
                        {!readOnly && (
                          <span className="text-gray-500 dark:text-gray-400 text-[13px]">
                            JPEG, PNG formats, up to 1MB
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-white dark:bg-gray-700 px-0 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 max-w-xs"
                      />
                    </div>
                  )}
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                  )}
                  {isImageEnlarged && imagePreview && (
                    <div
                      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
                      onClick={() => setIsImageEnlarged(false)}
                    >
                      <div className="relative w-[80vw] h-[90vh] p-4">
                        <Image
                          src={imagePreview}
                          alt="Enlarged Image Preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                          onClick={() => setIsImageEnlarged(false)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end mt-6 space-x-4">
                {!readOnly && (
                  <Button
                    type="submit"
                    className="px-6 py-3 rounded-lg shadow-md  text-white dark:white dark:text-black  dark:hover:bg-white transition transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {id ? 'Update' : 'Submit'}
                  </Button>
                )}
                <Button
                  type='button'
                  variant="outline"
                  onClick={() => router.push('/categories/list')}
                  disabled={isLoading}
                  className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {readOnly ? 'Back to List' : 'Cancel'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default CategoryForm;