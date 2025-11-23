// src/app/(demo)/technicians/edit/technicianForm.tsx
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
  Tag, Mail, Phone, MapPin, Home, FileText, Upload,
  Briefcase, Activity, Building2, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from "@/hooks/usePresignedUpload";
import { toast } from 'sonner';
import router from 'next/router';
import { add } from 'lodash';

interface FormData {
  id?: string;
  service_category: string;
  fullname: string;
  email: string;
  mobile: string;
  emirate: string;
  area: string;
  appartment: string;
  addtional_address: string;
  location: string;
  latitude?: string;
  longitude?: string;
  id_proof_type: string;
  services_known: string;
  service_type: 'general' | 'emergency';
  description: string;
  // Now storing URLs instead of File objects
  profile_pic?: string;
  id_proofs?: string;
  // Keep existing URLs for edit mode
  existing_profile_pic?: string;
  existing_id_proofs?: string;
}

interface Errors {
  [key: string]: string | undefined;
}

const TechnicianForm = ({ readOnly = false }: { readOnly?: boolean }) => {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id && !readOnly;
  const isView = !!id && readOnly;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    service_category: '',
    fullname: '',
    email: '',
    mobile: '',
    emirate: '',
    area: '',
    appartment: '',
    addtional_address: '',
    location: '',
    id_proof_type: '',
    services_known: '',
    service_type: 'general',
    description: '',
    profile_pic: '',
    id_proofs: '',
    existing_profile_pic: '',
    existing_id_proofs: '',
  });

  const [errors, setErrors] = useState<Errors>({});

  // Two separate uploaders
  const profileUpload = usePresignedUpload("technicians/profile", false);
  const idProofUpload = usePresignedUpload("technicians/id-proof", false);

  /* -------------------------------------------------
   *  Load technician on edit/view
   * ------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/technicians/${id}`);
        const tech = res.data.data;
        const addr = tech.addresses?.[0] ?? {};

        setFormData({
          id: tech.id,
          fullname: tech.fullname || '',
          email: tech.email || '',
          mobile: tech.mobile || '',
          service_category: tech.service_category || '',
          services_known: tech.services_known || '',
          service_type: tech.service_type || 'general',
          description: tech.description || '',
          id_proof_type: tech.id_proof_type || '',
          emirate: addr.emirate || '',
          area: addr.area || '',
          appartment: addr.appartment || '',
          addtional_address: addr.addtional_address || '',
          location: addr.location || '',
          latitude: addr.latitude || '',
          longitude: addr.longitude || '',
          existing_profile_pic: tech.profile_pic || '',
          existing_id_proofs: tech.id_proofs || '',
          profile_pic: tech.profile_pic || '',
          id_proofs: tech.id_proofs || '',
        });
      } catch {
        toast.error('Failed to load technician');
        router.replace('/technicians');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile picture must be ≤ 2MB');
      return;
    }
    profileUpload.uploadFiles([file]);
  };

  const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ID proof must be ≤ 5MB');
      return;
    }
    idProofUpload.uploadFiles([file]);
  };

  /* -------------------------------------------------
   *  Validation
   * ------------------------------------------------- */
  const validate = () => {
    const err: Errors = {};
    if (!formData.fullname.trim()) err.fullname = 'Full name is required';
    if (!formData.email.trim()) err.email = 'Email is required';
    if (!formData.mobile.trim()) err.mobile = 'Mobile is required';
    if (!formData.service_category.trim()) err.service_category = 'Service category is required';
    if (!formData.emirate.trim()) err.emirate = 'Emirate is required';
    if (!formData.area.trim()) err.area = 'Area is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* -------------------------------------------------
   *  Submit – Now sends only URLs
   * ------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    if (profileUpload.uploading || idProofUpload.uploading) {
      toast.error('Please wait for uploads to complete');
      return;
    }

    setLoading(true);

    const finalProfilePic = profileUpload.getUploadedUrls()[0] || formData.existing_profile_pic;
    const finalIdProof = idProofUpload.getUploadedUrls()[0] || formData.existing_id_proofs;

    const payload = {
      ...formData,
      profile_pic: finalProfilePic || null,
      id_proofs: finalIdProof || null,
      // Remove file objects and existing_* fields
    };

    // Remove temporary fields
    delete (payload as any).existing_profile_pic;
    delete (payload as any).existing_id_proofs;

    try {
      await apiClient.post('/technicians/upsert-technician', payload);
      toast.success(isEdit ? 'Technician updated successfully' : 'Technician created successfully');
      router.push('/technicians');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save technician');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get current display URL
  const currentProfileUrl = profileUpload.files[0]?.uploadedUrl ||
    (profileUpload.files[0]?.uploading ? profileUpload.files[0]?.preview : null) ||
    formData.existing_profile_pic;

  const currentIdProofUrl = idProofUpload.files[0]?.uploadedUrl ||
    (idProofUpload.files[0]?.uploading ? idProofUpload.files[0]?.preview : null) ||
    formData.existing_id_proofs;

  return (
    <ContentLayout title={
      isView ? `View Technician: ${formData.fullname}` :
      isEdit ? 'Edit Technician' : 'Add Technician'
    }>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/technicians">Technicians</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isView ? 'View' : isEdit ? 'Edit' : 'Add'}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row">
          {/* LEFT – FORM FIELDS */}
          <div className="w-full lg:w-1/2 p-8 space-y-6">
            {/* All your existing input fields... (same as before) */}
            <div><Label><Briefcase className="w-5 h-5 mr-2" />Service Category *</Label><Input name="service_category" value={formData.service_category} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label><Tag className="w-5 h-5 mr-2" />Full Name *</Label><Input name="fullname" value={formData.fullname} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label><Mail className="w-5 h-5 mr-2" />Email *</Label><Input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label><Phone className="w-5 h-5 mr-2" />Mobile *</Label><Input name="mobile" value={formData.mobile} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label><MapPin className="w-5 h-5 mr-2" />Emirate *</Label><Input name="emirate" value={formData.emirate} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label>Area *</Label><Input name="area" value={formData.area} onChange={handleInputChange} disabled={readOnly} required /></div>
            <div><Label><Building2 className="w-5 h-5 mr-2" />Building / Apartment</Label><Input name="appartment" value={formData.appartment} onChange={handleInputChange} disabled={readOnly} /></div>
            <div><Label><Home className="w-5 h-5 mr-2" />Additional Address</Label><Textarea name="addtional_address" value={formData.addtional_address} onChange={handleInputChange} disabled={readOnly} /></div>
            <div><Label>Location</Label><Input name="location" value={formData.location} onChange={handleInputChange} disabled={readOnly} /></div>
            <div><Label>ID Proof Type</Label><Input name="id_proof_type" value={formData.id_proof_type} onChange={handleInputChange} disabled={readOnly} /></div>
            <div><Label><Activity className="w-5 h-5 mr-2" />Service Type</Label>
              <Select value={formData.service_type} onValueChange={v => setFormData(p => ({ ...p, service_type: v as any }))} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Services Known</Label><Textarea name="services_known" value={formData.services_known} onChange={handleInputChange} disabled={readOnly} rows={3} /></div>
            <div><Label>Description</Label><Textarea name="description" value={formData.description} onChange={handleInputChange} disabled={readOnly} rows={4} /></div>
          </div>

          {/* RIGHT – UPLOADS */}
          <div className="w-full lg:w-1/2 p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
            {/* Profile Picture */}
            <div>
              <Label><Upload className="w-5 h-5 mr-2" />Profile Picture</Label>
              <div className="border-2 border-dashed rounded-xl p-6 min-h-80 flex flex-col items-center justify-center relative bg-white">
                {currentProfileUrl ? (
                  <>
                    <Image src={currentProfileUrl} alt="Profile" fill className="object-contain rounded-lg" />
                    {profileUpload.uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">Uploading...</div>}
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <Upload className="w-16 h-16 mx-auto mb-4" />
                    <p>No profile picture</p>
                  </div>
                )}
                {currentProfileUrl && !readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-4 right-4 z-10"
                    onClick={() => profileUpload.removeFile(0)}
                    disabled={profileUpload.uploading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {!readOnly && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileChange}
                  disabled={profileUpload.uploading}
                  className="mt-4 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                />
              )}
            </div>

            {/* ID Proof */}
            <div>
              <Label><FileText className="w-5 h-5 mr-2" />ID Proof (Image/PDF)</Label>
              <div className="border-2 border-dashed rounded-xl p-6 min-h-80 flex flex-col items-center justify-center relative bg-white">
                {currentIdProofUrl ? (
                  currentIdProofUrl.endsWith('.pdf') ? (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-red-600 mb-4" />
                      <p className="text-sm">PDF Uploaded</p>
                    </div>
                  ) : (
                    <Image src={currentIdProofUrl} alt="ID Proof" fill className="object-contain rounded-lg" />
                  )
                ) : (
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>No ID proof uploaded</p>
                  </div>
                )}
                {idProofUpload.uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">Uploading...</div>}
                {currentIdProofUrl && !readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-4 right-4 z-10"
                    onClick={() => idProofUpload.removeFile(0)}
                    disabled={idProofUpload.uploading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {!readOnly && (
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleIdProofChange}
                  disabled={idProofUpload.uploading}
                  className="mt-4 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-8 gap-4">
          {!readOnly && (
            <Button type="submit" disabled={loading || profileUpload.uploading || idProofUpload.uploading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Saving...' : isEdit ? 'Update Technician' : 'Create Technician'}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.push('/technicians')}>
            {readOnly ? 'Back' : 'Cancel'}
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
};

export default TechnicianForm;