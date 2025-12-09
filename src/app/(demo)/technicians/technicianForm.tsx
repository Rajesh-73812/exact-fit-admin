'use client';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { User, Mail, Phone, MapPin, FileText, Upload, Briefcase, Wrench, Trash2, IdCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { usePresignedUpload } from '@/hooks/usePresignedUpload';
import { toast } from 'sonner';

interface Service { id: string; title: string; }
interface FormData {
  id?: string;
  type: string;
  service_id: string;
  fullname: string;
  email: string;
  mobile: string;
  emirate: string;
  area: string;
  emirates_id: string;
  skills: string[];
  description: string;
  existing_profile_pic?: string | null;
  existing_id_proofs?: string | null;
  existing_certificate?: string | null;
}

const TechnicianForm = ({ readOnly = false }: { readOnly?: boolean }) => {
  const router = useRouter();
  const { id } = useParams() as { id?: string };
  const isEdit = !!id && !readOnly;
  const isView = !!id && readOnly;

  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [skillsInput, setSkillsInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    type: '', service_id: '', fullname: '', email: '', mobile: '',
    emirate: '', area: '', emirates_id: '', skills: [], description: '',
    existing_profile_pic: null, existing_id_proofs: null, existing_certificate: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Upload hooks
  const { files: profileFiles, uploading: uploadingProfile, uploadFiles: uploadProfile, removeFile: removeProfile, getUploadedUrls: getProfileUrls } = usePresignedUpload('technicians/profile');
  const { files: idProofFiles, uploading: uploadingIdProof, uploadFiles: uploadIdProof, removeFile: removeIdProof, getUploadedUrls: getIdProofUrls } = usePresignedUpload('technicians/id-proof');
  const { files: certFiles, uploading: uploadingCert, uploadFiles: uploadCert, removeFile: removeCert, getUploadedUrls: getCertUrl } = usePresignedUpload('technicians/certificate');

  // Fetch services
  useEffect(() => {
    if (!formData.type) {
      setServices([]);
      setFormData(prev => ({ ...prev, service_id: '' }));
      return;
    }
    const fetchServices = async () => {
      setFetchingServices(true);
      try {
        const res = await apiClient.get(`/service/V1/get-all-service?page=1&limit=100&type=${formData.type}`);
        setServices(res.data.data || []);
      } catch {
        toast.error('Failed to load services');
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, [formData.type]);

  // Load technician
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/technicians/V1/get-by-id/${id}`);
        const tech = data.data;
        const addr = tech.addresses?.[0] ?? {};
        setFormData({
          id: tech.id,
          type: tech.service_type || '',
          service_id: tech.service_id || '',
          fullname: tech.fullname || '',
          email: tech.email || '',
          mobile: tech.mobile || '',
          emirate: addr.emirate || '',
          area: addr.location || '',
          emirates_id: tech.emirates_id || '',
          skills: Array.isArray(tech.skill) ? tech.skill : [],
          description: tech.description || '',
          existing_profile_pic: tech.profile_pic || null,
          existing_id_proofs: tech.id_proofs || null,
          existing_certificate: tech.certificate || null,
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

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = skillsInput.trim();
      if (value && !formData.skills.includes(value)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, value] }));
        setSkillsInput('');
      }
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Max 2MB');
    uploadProfile([file]);
  };

  const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    uploadIdProof([file]);
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    uploadCert([file]);
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.type) err.type = 'Type is required';
    if (!formData.service_id) err.service_id = 'Service is required';
    if (!formData.fullname.trim()) err.fullname = 'Full name required';
    if (!formData.email.trim()) err.email = 'Email required';
    if (!formData.mobile.trim()) err.mobile = 'Mobile required';
    if (!formData.emirates_id.trim()) err.emirates_id = 'Emirates ID required';
    if (formData.skills.length === 0) err.skills = 'Add at least one skill';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !validate()) return;
    if (uploadingProfile || uploadingIdProof || uploadingCert) {
      toast.error('Please wait for uploads...');
      return;
    }

    setLoading(true);
    const payload = {
      id: formData.id,
      type: formData.type,
      service_id: formData.service_id,
      fullname: formData.fullname.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      emirate: formData.emirate || null,
      area: formData.area || null,
      emirates_id: formData.emirates_id.trim(),
      skills: formData.skills,
      description: formData.description || null,
      profile_pic: getProfileUrls()[0] || formData.existing_profile_pic || null,
      id_proofs: getIdProofUrls()[0] || formData.existing_id_proofs || null,
      certificate: getCertUrl()[0] || formData.existing_certificate || null,
    };

    try {
      await apiClient.post('/technicians/V1/upsert-technician', payload);
      toast.success(isEdit ? 'Updated successfully' : 'Created successfully');
      router.push('/technicians');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const getPreview = (files: any[], existing: string | null) =>
    files[0]?.preview || files[0]?.uploadedUrl || existing || '';

  return (
    <ContentLayout title={isView ? formData.fullname : isEdit ? 'Edit Technician' : 'Add New Technician'}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Link href="/dashboard">Dashboard</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Link href="/technicians">Technicians</Link></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{isView ? 'View' : isEdit ? 'Edit' : 'Add'}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label>Type <span className="text-red-600">*</span></Label>
                <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v, service_id: '' }))} disabled={readOnly}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
              </div>

              <div>
                <Label>Service <span className="text-red-600">*</span></Label>
                <Select value={formData.service_id} onValueChange={v => setFormData(p => ({ ...p, service_id: v }))} disabled={readOnly || !formData.type}>
                  <SelectTrigger>
                    {fetchingServices ? 'Loading...' : !formData.type ? 'Select type first' : <SelectValue placeholder="Choose service" />}
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.service_id && <p className="text-red-600 text-sm mt-1">{errors.service_id}</p>}
              </div>

              <div><Label>Full Name <span className="text-red-600">*</span></Label><Input value={formData.fullname} onChange={e => setFormData(p => ({ ...p, fullname: e.target.value }))} disabled={readOnly} placeholder="John Doe" /></div>
              <div><Label>Mobile <span className="text-red-600">*</span></Label><Input value={formData.mobile} onChange={e => setFormData(p => ({ ...p, mobile: e.target.value }))} disabled={readOnly} placeholder="+971 50 123 4567" /></div>
              <div><Label>Email <span className="text-red-600">*</span></Label><Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} disabled={readOnly} placeholder="john@example.com" /></div>
              <div><Label>Emirates ID <span className="text-red-600">*</span></Label><Input value={formData.emirates_id} onChange={e => setFormData(p => ({ ...p, emirates_id: e.target.value }))} disabled={readOnly} placeholder="784-XXXX-XXXXXXX-X" /></div>
              <div><Label>Emirate</Label><Input value={formData.emirate} onChange={e => setFormData(p => ({ ...p, emirate: e.target.value }))} disabled={readOnly} placeholder="Dubai" /></div>
              <div><Label>Address</Label><Input value={formData.area} onChange={e => setFormData(p => ({ ...p, area: e.target.value }))} disabled={readOnly} placeholder="Jumeirah" /></div>

              <div>
                <Label>Skills <span className="text-red-600">*</span></Label>
                <Input value={skillsInput} onChange={e => setSkillsInput(e.target.value)} onKeyDown={addSkill} disabled={readOnly} placeholder="Type skill + Enter" />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {skill}
                      {!readOnly && <button type="button" onClick={() => removeSkill(skill)} className="text-gray-600 hover:text-red-600">×</button>}
                    </span>
                  ))}
                </div>
                {errors.skills && <p className="text-red-600 text-sm mt-1">{errors.skills}</p>}
              </div>

              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} disabled={readOnly} rows={4} placeholder="Experience, availability..." />
              </div>
            </div>

            {/* Right Column - Uploads */}
            <div className="space-y-8">
              {/* Profile Picture */}
              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2 border-2 border-dashed rounded-xl h-48 relative bg-gray-50 overflow-hidden">
                  {getPreview(profileFiles, formData.existing_profile_pic) ? (
                    <Image src={getPreview(profileFiles, formData.existing_profile_pic)} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload className="w-12 h-12" />
                      <p>No image</p>
                    </div>
                  )}
                  {!readOnly && getPreview(profileFiles, formData.existing_profile_pic) && (
                    <button type="button" onClick={() => removeProfile(0)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!readOnly && (
                  <input type="file" accept="image/*" onChange={handleProfileChange} className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-black file:text-white" />
                )}
              </div>

              {/* ID Proof */}
              <div>
                <Label>ID Proof (Image/PDF)</Label>
                <div className="mt-2 border-2 border-dashed rounded-xl h-48 relative bg-gray-50 flex items-center justify-center">
                  {getPreview(idProofFiles, formData.existing_id_proofs) ? (
                    getPreview(idProofFiles, formData.existing_id_proofs).endsWith('.pdf') ? (
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto text-red-600" />
                        <p className="mt-2">PDF Uploaded</p>
                      </div>
                    ) : (
                      <Image src={getPreview(idProofFiles, formData.existing_id_proofs)} alt="ID" fill className="object-contain p-4" />
                    )
                  ) : (
                    <div className="text-gray-400 text-center">
                      <FileText className="w-12 h-12 mx-auto" />
                      <p>No file</p>
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <input type="file" accept="image/*,.pdf" onChange={handleIdProofChange} className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-black file:text-white" />
                )}
              </div>

              {/* Certificate */}
              <div>
                <Label>Certificate</Label>
                <div className="mt-2 border-2 border-dashed rounded-xl h-48 relative bg-gray-50">
                  {getPreview(certFiles, formData.existing_certificate) ? (
                    <Image src={getPreview(certFiles, formData.existing_certificate)} alt="Cert" fill className="object-contain p-4" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Upload className="w-12 h-12" />
                      <p>No certificate</p>
                    </div>
                  )}
                  {!readOnly && getPreview(certFiles, formData.existing_certificate) && (
                    <button type="button" onClick={() => removeCert(0)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {!readOnly && (
                  <input type="file" accept="image/*" onChange={handleCertificateChange} className="mt-3 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-black file:text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {!readOnly && (
            <div className="flex justify-end pt-6 border-t">
              <Button
                type="submit"
                size="lg"
                disabled={loading || uploadingProfile || uploadingIdProof || uploadingCert}
                className="bg-black hover:bg-gray-800 text-white px-8"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Technician' : 'Create Technician'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </ContentLayout>
  );
};

export default TechnicianForm;