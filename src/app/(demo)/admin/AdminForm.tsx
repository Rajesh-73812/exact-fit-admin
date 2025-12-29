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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { Eye, EyeOff } from 'lucide-react';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';

/* ---------------- PERMISSIONS CONFIG ---------------- */

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

export default function CreateAdminPage() {
  const router = useRouter();
  const { uploadFiles } = usePresignedUpload('admin-profile', false);

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    roleName: '',
    profile_pic: '',
  });

  const [permissions, setPermissions] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    if (!form.roleName.trim()) return;
    if (form.password !== form.confirmPassword) return;

    setLoading(true);

    try {
      await apiClient.post('/auth/V1/register', {
        fullname: form.fullname,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: 'admin',               // 🔒 enum stays admin
        role_name: form.roleName,    // 👈 custom role label
        permissions,                 // 👈 actual power
        profile_pic: form.profile_pic,
      });

      router.push('/admin/list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title="Create Admin">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Admin</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <Label>Full Name</Label>
          <Input value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} />

          <Label>Email</Label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <Label>Mobile</Label>
          <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />

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

          <Label>Role Name (Custom)</Label>
          <Input
            placeholder="e.g. Manager / Support / Operator"
            value={form.roleName}
            onChange={(e) => setForm({ ...form, roleName: e.target.value })}
          />

          <Label>Profile Image</Label>
          <input type="file" onChange={handleImageChange} />
          {imagePreview && <Image src={imagePreview} alt="preview" width={120} height={120} />}
        </div>

        {/* RIGHT — PERMISSIONS */}
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
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                      />
                      {action.toUpperCase()}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2 flex justify-end gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/list')}>
            Cancel
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
}
