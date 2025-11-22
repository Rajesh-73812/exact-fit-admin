'use client';

import { useEffect, useState } from 'react';
import ListComponent from '@/components/ListComponent';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import apiClient from '@/lib/apiClient';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { toast } from 'sonner';

interface Banner {
  id: string;
  name: string;
  image_url: string;
  priority: number;
  is_active: boolean;
  section: string;
  slug: string;
}

export default function BannersListPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/V1/get-all-banners');
      setBanners(res.data.data);
      setTotal(res.data.data.length);
    } catch (err) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (b: Banner) => (
        <div className="relative h-16 w-32 rounded overflow-hidden bg-gray-100">
          <Image src={b.image_url} alt={b.name} fill className="object-cover" unoptimized />
        </div>
      ),
    },
    { key: 'name', header: 'Name', render: (b: Banner) => <p className="font-medium">{b.name}</p> },
    { key: 'section', header: 'Section', render: (b: Banner) => <Badge variant="outline">{b.section}</Badge> },
    { key: 'priority', header: 'Priority', render: (b: Banner) => <Badge>{b.priority}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (b: Banner) => (
        <Badge variant={b.is_active ? 'default' : 'secondary'}>
          {b.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Banners">
      <ListComponent
        title="Banner"
        data={banners}
        columns={columns}
        isLoading={loading}
        addRoute="/banners/add"
        editRoute={(id) => `/banners/edit/${id}`}
        totalItems={total}
        showStatusToggle={false}
        onDelete={async (id) => {
          if (confirm("Delete this banner?")) {
            await apiClient.delete(`/admin/V1/delete-banner/${id}`);
            toast.success("Deleted");
            fetchBanners();
          }
        }}
      />
    </ContentLayout>
  );
}