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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { Eye, EyeOff } from 'lucide-react';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';

interface AdminFormProps {
  id?: string; // For edit/view; omit for create
  readOnly?: boolean; // For view mode
}

const PERMISSION_GROUPS = [
  { label: 'Dashboard', key: 'dashboard', actions: ['view'] },
  { label: 'Services', key: 'services', actions: ['view', 'create', 'edit', 'delete'] },
  { label: 'Sub Services', key: 'subservices', actions: ['view', 'create', 'edit', 'delete'] },
  { label: 'Customers', key: 'customers', actions: ['view'] },
  { label: 'Plans', key: 'plans', actions: ['view', 'create', 'edit', 'delete'] },
  { label: 'Bookings', key: 'bookings', actions: ['view'] },
  { label: 'Reports', key: 'reports', actions: ['view'] },
  { label: 'Admins', key: 'admin', actions: ['view', 'create', 'edit', 'delete'] },
];

export default function AdminForm({ id, readOnly = false }: AdminFormProps) {
  const router = useRouter();
  const { uploadFiles } = usePresignedUpload('admin-profile', false);

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role_name: '',
    profile_pic: '',
  });
  const [permissions, setPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Fetch existing data for edit/view
  useEffect(() => {
    if (id) { // Fetch for both edit and view
      const fetchAdmin = async () => {
        try {
          const res = await apiClient.get(`/auth/V1/get-admin/${id}`);
          const data = res.data.data;
          setForm({
            fullname: data.fullname || '',
            email: data.email || '',
            mobile: data.mobile || '',
            password: '', // Don't prefill
            confirmPassword: '',
            role_name: data.role_name || '',
            profile_pic: data.profile_pic || '',
          });
          setImagePreview(data.profile_pic || null);
          // Extract permissions from main response (no separate API)
          setPermissions(data.permissions || []);
          setInitialData(data);
        } catch (err) {
          console.error('Fetch error:', err);
        }
      };
      fetchAdmin();
    }
  }, [id, readOnly]);

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm)
        ? prev.filter((p) => p !== perm)
        : [...prev, perm]
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = (await uploadFiles([file])) as string;
    setForm((p) => ({ ...p, profile_pic: url }));
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.role_name.trim()) return;
    if (form.password !== form.confirmPassword && form.password) return;

    setLoading(true);

    try {
      const payload = {
        fullname: form.fullname,
        email: form.email,
        mobile: form.mobile,
        ...(form.password && { password: form.password }), // Only send if editing/changing
        role: 'staff',
        role_name: form.role_name,
        permissions,
        profile_pic: form.profile_pic,
      };

      if (id) {
        await apiClient.put(`/auth/V1/update-admin/${id}`, payload);
      } else {
        await apiClient.post('/auth/V1/register', payload);
      }

      router.push('/admin/list');
    } finally {
      setLoading(false);
    }
  };

  const title = id ? (readOnly ? 'View Admin' : 'Edit Admin') : 'Create Admin';

  return (
    <ContentLayout title={title}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Label>Full Name</Label>
          <Input 
            value={form.fullname} 
            onChange={(e) => setForm({ ...form, fullname: e.target.value })} 
            disabled={readOnly}
          />

          <Label>Email</Label>
          <Input 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            disabled={readOnly}
          />

          <Label>Mobile</Label>
          <Input 
            value={form.mobile} 
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} 
            disabled={readOnly}
          />

          {!readOnly && (
            <>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <button type="button" className="absolute right-2 top-2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </>
          )}

          <Label>Role Name</Label>
          <Input
            placeholder="Manager / Support / Operator"
            value={form.role_name}
            onChange={(e) => setForm({ ...form, role_name: e.target.value })}
            disabled={readOnly}
          />

          <Label>Profile Image</Label>
          {!readOnly && <input type="file" onChange={handleImageChange} />}
          {imagePreview && <Image src={imagePreview} alt="preview" width={120} height={120} />}
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <h3 className="font-semibold">Permissions</h3>

          {PERMISSION_GROUPS.map((group) => (
            <div key={group.key} className="border rounded p-3">
              <p className="font-medium">{group.label}</p>
              <div className="flex flex-wrap gap-4 mt-2">
                {group.actions.map((action) => {
                  const perm = `${group.key}:${action}`;
                  return (
                    <label key={perm} className="flex items-center gap-2">
                      {!readOnly && (
                        <input
                          type="checkbox"
                          checked={permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                        />
                      )}
                      {action.toUpperCase()}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2 flex justify-end gap-4">
          {!readOnly && (
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (id ? 'Update Admin' : 'Create Admin')}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/admin/list')}>
            Cancel
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
}