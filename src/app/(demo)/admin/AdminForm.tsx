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
import { User, Phone, Mail, Key, UploadIcon, User2Icon, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
// import Loader from '@/components/demo/utils/Loader';
// import { useNotification } from '@/components/ui/NotificationContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from '@/hooks/usePresignedUpload'; // <-- use your actual path

interface FormData {
  id?: string;
  fullname: string;
  mobile: string;
  email: string;
  role: string;
  password: string;
  confirmPassword?: string;
  profile_pic: File | string | null; // will store URL string after upload
}

const AdminForm: React.FC<{ id?: string; readOnly?: boolean }> = ({ id, readOnly = false }) => {
  const router = useRouter();
  // const { addNotification } = useNotification();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    mobile: '',
    email: '',
    role: 'admin',
    password: '',
    confirmPassword: '',
    profile_pic: null,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // presigned upload hook
  const { uploading: imageUploading, uploadFiles } = usePresignedUpload('admin-profile', false);

  // Fetch admin by ID for edit/view (backend uses req.user, so no id in URL)
  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    apiClient
      .get(`auth/V1/get-admin`, { withCredentials: true })
      .then((response) => {
        // backend: { success, message, data: admin }
        const user = response?.data?.data;

        if (!user || !user.id) {
          throw new Error('Invalid user data received.');
        }

        const updatedForm: FormData = {
          id: String(user.id),
          fullname: user.fullname || '',
          mobile: user.mobile || '',
          email: user.email || '',
          role: user.role || 'admin',
          password: '',
          confirmPassword: '',
          profile_pic: user.profile_pic || null,
        };

        setFormData(updatedForm);
        setImagePreview(user.profile_pic || null);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        // addNotification({
        //   title: 'Error',
        //   description: error.message || 'Failed to fetch user data.',
        //   variant: 'destructive',
        // });
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = () => {
    router.push('/admin');
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullname) newErrors.fullname = 'Name is required';
    else if (formData.fullname.length < 2) newErrors.fullname = 'Name must be at least 2 characters';
    else if (formData.fullname.length > 255) newErrors.fullname = 'Name cannot exceed 255 characters';

    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^\+?[0-9]+$/.test(formData.mobile))
      newErrors.mobile = 'Mobile number must contain only digits and optionally start with +';
    else if (formData.mobile.length < 10 || formData.mobile.length > 13)
      newErrors.mobile = 'Mobile number must be 10 digits';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email must be a valid email address';
    else if (formData.email.length > 255) newErrors.email = 'Email cannot exceed 255 characters';

    if (!formData.role) newErrors.role = 'Role is required';
    else if (!['vendor', 'admin', 'customer'].includes(formData.role))
      newErrors.role = 'Role must be one of: vendor, admin, customer';

    // Password validation
    if (!id && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && (formData.password.length < 6 || formData.password.length > 255)) {
      newErrors.password = 'Password must be between 6 and 255 characters';
    }

    // Confirm password validation: only if password is present
    if (formData.password) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // use presigned upload hook for image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      console.error('Image size must not exceed 1MB.');
      // addNotification({ ... });
      return;
    }

    try {
      // upload to S3 via presigned URL
      const uploadedUrl = (await uploadFiles([file])) as string | undefined;

      if (!uploadedUrl) {
        console.error('Upload failed, no URL returned');
        return;
      }

      // store URL in formData, and use it as preview
      setFormData((prev) => ({
        ...prev,
        profile_pic: uploadedUrl,
      }));
      setImagePreview(uploadedUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    if (!validateForm()) {
      // addNotification({
      //   title: 'Error',
      //   description: 'Please fix the form errors before submitting.',
      //   variant: 'destructive',
      // });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        fullname: formData.fullname,
        mobile: formData.mobile,
        email: formData.email,
        role: formData.role,
      };

      if (formData.id) payload.id = formData.id;
      if (formData.password) payload.password = formData.password;
      if (typeof formData.profile_pic === 'string') {
        payload.profile_pic = formData.profile_pic; // S3 public URL
      }

      // send JSON, NOT multipart
      const response = await apiClient.post('/auth/V1/register', payload, {
        withCredentials: true,
      });

      // addNotification({
      //   title: 'Success',
      //   description: formData.id ? 'Admin updated successfully!' : 'Admin created successfully!',
      //   variant: 'default',
      // });

      setFormData({
        fullname: '',
        mobile: '',
        email: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
        profile_pic: null,
      });
      setImagePreview(null);
      router.push('/admin/list');
    } catch (error: any) {
      console.error('Submission error:', error?.response?.data || error?.message);
      // addNotification({
      //   title: 'Error',
      //   description: error?.response?.data?.message || error?.message || 'Failed to save user.',
      //   variant: 'destructive',
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  return (
    <ContentLayout title={id ? (readOnly ? 'View Admin' : 'Edit Admin') : 'Add Admin'}>
      {/* {isLoading && <Loader />} */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>{/* <Link href="/" prefetch={false}>Home</Link> */}</BreadcrumbLink>
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
              <Link href="/admin/list" prefetch={false}>
                Admin
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{id ? (readOnly ? 'View Admin' : 'Edit Admin') : 'Add Admin'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <div className="min-h-screen bg-gradient-to-br to-gray-200 ">
          <div className="w-full ml-0">
            <form onSubmit={handleSubmit}>
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-gray-50 to-white border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="space-y-6">
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-5 h-5 mr-2" />
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Enter name"
                        disabled={readOnly}
                      />
                      {errors.fullname && <div className="text-red-500 text-sm">{errors.fullname}</div>}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-5 h-5 mr-2" />
                        Mobile Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        disabled={readOnly}
                        type="tel"
                        pattern="^[6-9][0-9]{9}$"
                        title="Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
                        maxLength={10}
                      />
                      {errors.mobile && <div className="text-red-500 text-sm">{errors.mobile}</div>}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-5 h-5 mr-2" />
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        disabled={readOnly}
                      />
                      {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <User2Icon className="w-5 h-5 mr-2" />
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.role} onValueChange={handleRoleChange} disabled={readOnly}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Key className="w-5 h-5 mr-2" />
                        Password {id ? '' : <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                          disabled={readOnly}
                          className="pr-10"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                      </div>
                      {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                    </div>

                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Key className="w-5 h-5 mr-2" />
                        Confirm Password {id ? '' : <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          disabled={readOnly}
                          className="pr-10"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                      </div>
                      {errors.confirmPassword && (
                        <div className="text-red-500 text-sm">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 p-8 bg-white">
                  <div className="space-y-6">
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Profile Picture
                      </Label>
                      <div className="w-full h-72 border-2 border-dashed border-indigo-300 rounded-xl flex items-center justify-center relative transition hover:border-indigo-400">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile Picture Preview"
                            fill
                            className="max-h-full max-w-full object-contain rounded-lg cursor-pointer"
                            onClick={() => {
                              setEnlargedImage(imagePreview);
                              setIsImageEnlarged(true);
                            }}
                          />
                        ) : (
                          <div className="flex flex-col justify-center items-center">
                            <UploadIcon className="w-8 h-8 mb-2 text-gray-400 text-center" />
                            {!readOnly && (
                              <span className="text-gray-400 text-[13px]">
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
                            className="bg-white text-gray-900 border-gray-300 max-w-xs"
                          />
                        </div>
                      )}
                      {imageUploading && (
                        <div className="text-xs text-gray-500 mt-1">Uploading image...</div>
                      )}
                    </div>
                  </div>

                  {isImageEnlarged && enlargedImage && (
                    <div
                      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
                      onClick={() => setIsImageEnlarged(false)}
                    >
                      <div className="relative w-[90vw] h-[90vh] p-4">
                        <Image
                          src={enlargedImage}
                          alt="Enlarged Profile Picture Preview"
                          fill
                          className="max-w-full max-h-full object-contain rounded-lg"
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
                    className="px-6 py-3 rounded-lg shadow-md transition transform hover:scale-105"
                    disabled={isLoading || imageUploading}
                  >
                    {id ? 'Update' : 'Submit'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
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

export default AdminForm;
