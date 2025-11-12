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
  Briefcase, Activity, Building2
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
import apiClient from '@/lib/apiClient';   // <-- direct import
import { toast } from 'sonner';

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
  profile_pic: File | null;
  id_proof: File | null;
}

interface Errors {
  [key: string]: string | undefined;
}

interface TechnicianFormProps {
  readOnly?: boolean;
}

const TechnicianForm: React.FC<TechnicianFormProps> = ({ readOnly = false }) => {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id && !readOnly;
  const isView = !!id && readOnly;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
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
    profile_pic: null,
    id_proof: null,
  });
  const [errors, setErrors] = useState<Errors>({});

  /* -------------------------------------------------
   *  Load technician (Edit / View)
   * ------------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/technicians/${id}`);   // <-- direct
        const tech = res.data.data;
        const addr = tech.addresses?.[0] ?? {};

        setFormData({
          id: tech.id,
          fullname: tech.fullname,
          email: tech.email,
          mobile: tech.mobile,
          service_category: tech.service_category ?? '',
          services_known: tech.services_known ?? '',
          service_type: tech.service_type ?? 'general',
          description: tech.description ?? '',
          id_proof_type: tech.id_proof_type ?? '',
          emirate: addr.emirate ?? '',
          area: addr.area ?? '',
          appartment: addr.appartment ?? '',
          addtional_address: addr.addtional_address ?? '',
          location: addr.location ?? '',
          latitude: addr.latitude ?? '',
          longitude: addr.longitude ?? '',
          profile_pic: null,
          id_proof: null,
        });

        if (tech.profile_pic) setImagePreview(tech.profile_pic);
        if (tech.id_proofs) setIdProofPreview(tech.id_proofs);
      } catch {
        toast.error('Failed to load technician');
        router.replace('/technicians');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  /* -------------------------------------------------
   *  Input / File handlers
   * ------------------------------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile_pic' | 'id_proof') => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(`${type === 'profile_pic' ? 'Profile' : 'ID proof'} must be ≤ 2MB`);
      return;
    }
    setFormData(p => ({ ...p, [type]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      type === 'profile_pic' ? setImagePreview(reader.result as string) : setIdProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* -------------------------------------------------
   *  Validation
   * ------------------------------------------------- */
  const validate = () => {
    const err: Errors = {};
    if (!formData.fullname) err.fullname = 'Full name is required';
    if (!formData.email) err.email = 'Email is required';
    if (!formData.mobile) err.mobile = 'Mobile is required';
    if (!formData.service_category) err.service_category = 'Service category is required';
    if (!formData.emirate) err.emirate = 'Emirate is required';
    if (!formData.area) err.area = 'Area is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* -------------------------------------------------
   *  Submit (Create / Update)
   * ------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validate()) return;

    setLoading(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) payload.append(k, v as any);
    });

    try {
      await apiClient.post('/technicians/upsert-technician', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });   // <-- direct
      toast.success(isEdit ? 'Technician updated' : 'Technician created');
      router.push('/technicians');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------
   *  Render
   * ------------------------------------------------- */
  return (
    <ContentLayout title={
      isView ? `View Technician: ${formData.fullname}` :
      isEdit ? 'Edit Technician' : 'Add Technician'
    }>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/dashboard">Dashboard</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/technicians">Technicians</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>
            {isView ? 'View' : isEdit ? 'Edit' : 'Add'}
          </BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row">
          {/* ---------- LEFT – INPUTS ---------- */}
          <div className="w-full lg:w-1/2 p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
            {/* Service Category */}
            <div>
              <Label><Briefcase className="w-5 h-5 mr-2 text-indigo-600" />Service Category *</Label>
              <Input
                name="service_category"
                value={formData.service_category}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
                placeholder={readOnly ? '-' : 'e.g. Plumbing'}
              />
              {errors.service_category && <p className="text-red-500 text-sm">{errors.service_category}</p>}
            </div>

            {/* Full Name */}
            <div>
              <Label><Tag className="w-5 h-5 mr-2 text-indigo-600" />Full Name *</Label>
              <Input
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
              />
              {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
            </div>

            {/* Email */}
            <div>
              <Label><Mail className="w-5 h-5 mr-2 text-indigo-600" />Email *</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <Label><Phone className="w-5 h-5 mr-2 text-indigo-600" />Mobile *</Label>
              <Input
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
              />
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
            </div>

            {/* Emirate */}
            <div>
              <Label><MapPin className="w-5 h-5 mr-2 text-indigo-600" />Emirate *</Label>
              <Input
                name="emirate"
                value={formData.emirate}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
              />
              {errors.emirate && <p className="text-red-500 text-sm">{errors.emirate}</p>}
            </div>

            {/* Area */}
            <div>
              <Label>Area *</Label>
              <Input
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                disabled={readOnly}
                required={!readOnly}
              />
              {errors.area && <p className="text-red-500 text-sm">{errors.area}</p>}
            </div>

            {/* Building / Apartment */}
            <div>
              <Label><Building2 className="w-5 h-5 mr-2 text-indigo-600" />Building / Apartment</Label>
              <Input
                name="appartment"
                value={formData.appartment}
                onChange={handleInputChange}
                disabled={readOnly}
              />
            </div>

            {/* Additional Address */}
            <div>
              <Label><Home className="w-5 h-5 mr-2 text-indigo-600" />Additional Address</Label>
              <Textarea
                name="addtional_address"
                value={formData.addtional_address}
                onChange={handleInputChange}
                disabled={readOnly}
                rows={2}
              />
            </div>

            {/* Location (Google Maps) */}
            <div>
              <Label>Location (Google Maps)</Label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={readOnly}
              />
            </div>

            {/* ID Proof Type */}
            <div>
              <Label>ID Proof Type</Label>
              <Input
                name="id_proof_type"
                value={formData.id_proof_type}
                onChange={handleInputChange}
                disabled={readOnly}
              />
            </div>

            {/* Service Type */}
            <div>
              <Label><Activity className="w-5 h-5 mr-2 text-indigo-600" />Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={v => !readOnly && setFormData(p => ({ ...p, service_type: v as any }))}
                disabled={readOnly}
              >
                <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Services Known */}
            <div>
              <Label>Services Known</Label>
              <Textarea
                name="services_known"
                value={formData.services_known}
                onChange={handleInputChange}
                disabled={readOnly}
                rows={2}
                placeholder={readOnly ? '-' : 'Pipe fixing, Tap installation...'}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={readOnly}
                rows={3}
                placeholder={readOnly ? '-' : '5+ years experience...'}
              />
            </div>
          </div>

          {/* ---------- RIGHT – UPLOADS ---------- */}
          <div className="w-full lg:w-1/2 p-8 bg-white dark:bg-gray-800 space-y-8">
            {/* Profile Picture */}
            <div>
              <Label><Upload className="w-5 h-5 mr-2 text-indigo-600" />Profile Picture</Label>
              <div className="border-2 border-dashed rounded-xl p-4">
                {imagePreview ? (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <Image src={imagePreview} alt="Profile" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">{readOnly ? 'No image' : 'JPG, PNG ≤ 2MB'}</p>
                  </div>
                )}
                {!readOnly && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(e, 'profile_pic')}
                    className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-indigo-50 file:text-indigo-700"
                  />
                )}
              </div>
            </div>

            {/* ID Proof */}
            <div>
              <Label><FileText className="w-5 h-5 mr-2 text-indigo-600" />ID Proof</Label>
              <div className="border-2 border-dashed rounded-xl p-4">
                {idProofPreview ? (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
                    {idProofPreview.endsWith('.pdf') ? (
                      <a href={idProofPreview} target="_blank" className="flex h-full items-center justify-center text-blue-600">
                        <FileText className="w-12 h-12" /> View PDF
                      </a>
                    ) : (
                      <Image src={idProofPreview} alt="ID" fill className="object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">{readOnly ? 'No document' : 'PDF, JPG, PNG ≤ 2MB'}</p>
                  </div>
                )}
                {!readOnly && (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => handleFileChange(e, 'id_proof')}
                    className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-indigo-50 file:text-indigo-700"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- BUTTONS ---------- */}
        <div className="flex justify-end mt-6 space-x-4">
          {!readOnly && (
            <Button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'} Technician
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/technicians')}
            className="px-6 py-3"
          >
            {readOnly ? 'Back to List' : 'Cancel'}
          </Button>
        </div>
      </form>
    </ContentLayout>
  );
};

export default TechnicianForm;