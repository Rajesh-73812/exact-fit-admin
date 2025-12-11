'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Key, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
// import { useNotification } from '@/components/ui/NotificationContext';
// import Loader from '@/components/demo/utils/Loader';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';

interface AccountFormData {
  id?: string;
  fullname: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  profile_pic?: string | null; // S3 URL or null
}

const AdminAccountPage: React.FC = () => {
  const router = useRouter();
  // const { addNotification } = useNotification();

  const [formData, setFormData] = useState<AccountFormData>({
    fullname: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    profile_pic: null,
  });

  const [errors, setErrors] = useState<Partial<AccountFormData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // profile image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // presigned upload hook
  const { uploading: imageUploading, uploadFiles } = usePresignedUpload(
    'admin-profile',
    false
  );

  // Fetch admin details from token (id from req.user)
  const fetchAccount = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/auth/V1/get-admin', {
        withCredentials: true,
      });

      const admin = res?.data?.data;
      if (!admin || !admin.id) {
        throw new Error('Invalid admin data received');
      }

      setFormData({
        id: String(admin.id),
        fullname: admin.fullname || '',
        email: admin.email || '',
        mobile: admin.mobile || '',
        password: '',
        confirmPassword: '',
        profile_pic: admin.profile_pic || null,
      });

      setImagePreview(admin.profile_pic || null);
    } catch (error: any) {
      console.error('Error fetching account:', error);
      // addNotification({ ... });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<AccountFormData> = {};

    if (!formData.fullname) newErrors.fullname = 'Name is required';
    else if (formData.fullname.length < 2)
      newErrors.fullname = 'Name must be at least 2 characters';
    else if (formData.fullname.length > 255)
      newErrors.fullname = 'Name cannot exceed 255 characters';

    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    else if (!/^\+?[0-9]+$/.test(formData.mobile))
      newErrors.mobile =
        'Mobile number must contain only digits and optionally start with +';
    else if (formData.mobile.length < 10 || formData.mobile.length > 13)
      newErrors.mobile = 'Mobile number must be between 10 and 13 digits';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email must be a valid email address';
    else if (formData.email.length > 255)
      newErrors.email = 'Email cannot exceed 255 characters';

    // Password is optional on account update – validate only if provided
    if (formData.password) {
      if (formData.password.length < 6 || formData.password.length > 255) {
        newErrors.password = 'Password must be between 6 and 255 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      console.error('Image size must not exceed 1MB.');
      // addNotification({ ... });
      return;
    }

    // Show local preview immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);

    try {
      const uploadedUrl = (await uploadFiles([file])) as string | undefined;

      if (!uploadedUrl) {
        console.error('Upload failed: no URL returned');
        return;
      }

      // Update formData with final S3 URL
      setFormData((prev) => ({
        ...prev,
        profile_pic: uploadedUrl,
      }));

      // Optionally switch preview to final URL (if different)
      setImagePreview(uploadedUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      // reset file input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_pic: null,
    }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // addNotification({ ... });
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        id: formData.id, // triggers UPDATE flow in register controller
        fullname: formData.fullname,
        email: formData.email,
        mobile: formData.mobile,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (typeof formData.profile_pic === 'string') {
        payload.profile_pic = formData.profile_pic;
      } else if (formData.profile_pic === null) {
        payload.profile_pic = null;
      }

      await apiClient.post('/auth/V1/register', payload, {
        withCredentials: true,
      });

      // addNotification({ title: 'Success', ... });
    } catch (error: any) {
      console.error('Error updating account:', error);
      // addNotification({ title: 'Error', ... });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentLayout title="Account">
      {/* {isLoading && <Loader />} */}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false}>
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile picture card at the top */}
      <div className="mt-6">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={formData.fullname || 'Profile'}
                fill
                className="object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Profile</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.fullname || 'Guest User'}
              </p>
              <p className="text-sm text-gray-500">
                {formData.email || 'No email set'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || imageUploading}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isLoading || imageUploading}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form below */}
      <div className="mt-6">
        <div className="min-h-screen bg-gradient-to-br to-gray-200">
          <div className="w-full ml-0">
            <form onSubmit={handleSubmit}>
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                {/* Left Column: Basic Details */}
                <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-gray-50 to-white border-b md:border-b-0 md:border-r border-gray-100">
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-5 h-5 mr-2" />
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        disabled={isLoading}
                      />
                      {errors.fullname && (
                        <div className="text-red-500 text-sm">
                          {errors.fullname}
                        </div>
                      )}
                    </div>

                    {/* Mobile */}
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
                        disabled={isLoading}
                        type="tel"
                        maxLength={13}
                      />
                      {errors.mobile && (
                        <div className="text-red-500 text-sm">
                          {errors.mobile}
                        </div>
                      )}
                    </div>

                    {/* Email */}
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
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <div className="text-red-500 text-sm">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Password Section */}
                <div className="w-full md:w-1/2 p-8 bg-white">
                  <div className="space-y-6">
                    {/* Password */}
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Key className="w-5 h-5 mr-2" />
                        Password
                        <span className="text-xs text-gray-500 ml-2">
                          (leave blank to keep current)
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="text-red-500 text-sm">
                          {errors.password}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Key className="w-5 h-5 mr-2" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="text-red-500 text-sm">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end mt-6 space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-3 rounded-lg shadow-md transition transform hover:scale-105"
                  disabled={isLoading || imageUploading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default AdminAccountPage;
