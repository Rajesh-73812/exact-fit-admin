'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Image as ImageIcon, Eye, Edit, Plus } from 'lucide-react';
import ListComponent from '@/components/ListComponent';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import { mockBanners, BannerSection } from '@/data/mockBanners';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const sectionLabels: Record<BannerSection, string> = {
  'homepage': 'Homepage',
  'about us': 'About Us',
  'contact us': 'Contact Us',
  'services': 'Services',
};

export default function BannersListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = mockBanners.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.section.includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const total = filtered.length;

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (item: typeof mockBanners[0]) => (
        <div className="relative h-16 w-32 rounded overflow-hidden bg-gray-100">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (item: typeof mockBanners[0]) => (
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{sectionLabels[item.section]}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item: typeof mockBanners[0]) => (
        <Badge variant="outline">{item.priority}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: typeof mockBanners[0]) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Banners">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded">
              <ImageIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600">Total Banners</p>
              <p className="text-xl font-bold">{mockBanners.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-600">Active</p>
              <p className="text-xl font-bold">
                {mockBanners.filter(b => b.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600">Homepage</p>
              <p className="text-xl font-bold">
                {mockBanners.filter(b => b.section === 'homepage').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded">
              <Plus className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600">Add New</p>
              <Button
                size="sm"
                onClick={() => router.push('/banners/add')}
                className="mt-1"
              >
                Create Banner
              </Button>
            </div>
          </div>
        </div>
      Mad</div>

      <ListComponent
        title="Banner"
        data={paginated}
        columns={columns}
        isLoading={false}
        addRoute="/banners/add"
        editRoute={(id) => `/banners/edit/${id}`}
        viewRoute={(id) => `/banners/${id}`}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={total}
        searchQuery={search}
        setSearchQuery={setSearch}
        showStatusToggle={false}
      />
    </ContentLayout>
  );
}