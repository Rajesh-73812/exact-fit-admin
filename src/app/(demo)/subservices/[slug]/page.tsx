'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Package, TrendingUp, DollarSign, Link, FileText, Calendar, Tag } from 'lucide-react';

import { ContentLayout } from '@/components/admin-panel/content-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/apiClient';
import Loader from '@/components/utils/Loader';

interface SubService {
  title: string;
  sub_service_slug: string;
  position: number;
  description: string;
  image_url: string | null;
  image_alt: string | null;
  status: 'active' | 'inactive';
  external_link: string | null;
  createdAt: string;
  discount: string | null;
  price: string | null;
  hero_banner: string | null;
}

/* ------------------------------------------------------------------ */
/*  StatCard – reusable small card with icon + trend                     */
/* ------------------------------------------------------------------ */
function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend: string;
}) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white rounded-full p-2">
            {icon}
          </div>
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */
export default function SubServiceDetailsPage() {
  const { slug } = useParams();               // <-- slug from URL
  const router = useRouter();

  const [subservice, setSubService] = useState<SubService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------------- */
  /*  FETCH the sub-service by slug                                 */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!slug) return;

    const fetchSubService = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(
          `/sub-service/V1/get-sub-service-by-slug/${slug}`
        );
        setSubService(res.data.data);               // <-- single object
      } catch (err: any) {
        console.error('Failed to fetch sub-service:', err);
        setError(
          err.response?.data?.message ||
          'Failed to load sub-service data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubService();
  }, [slug]);

  /* -------------------------------------------------------------- */
  /*  Loading / error states                                        */
  /* -------------------------------------------------------------- */
  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!subservice) return <p>Sub-service not found.</p>;

  /* -------------------------------------------------------------- */
  /*  Render                                                       */
  /* -------------------------------------------------------------- */
  return (
    <ContentLayout title={subservice.title}>
      {/* ------------------- Header Overview ------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Sub-Service Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            {/* Image */}
            <div className="relative h-32 w-32 rounded-xl overflow-hidden border">
              {subservice.image_url ? (
                <Image
                  src={subservice.image_url}
                  alt={subservice.image_alt || subservice.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                  <Package className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-semibold">{subservice.title}</h3>

              {subservice.description && (
                <p className="text-muted-foreground">{subservice.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`text-white ${subservice.status === 'active'
                      ? 'bg-gradient-to-b from-[#8000FF] to-[#DE00FF]'
                      : 'bg-gray-400'
                    }`}
                >
                  {subservice.status}
                </Badge>

                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(subservice.createdAt).toLocaleDateString()}
                </span>
              </div>

              {subservice.external_link && (
                <a
                  href={subservice.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Link className="h-4 w-4" />
                  External link
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Position badge */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Position</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <span className="text-4xl font-bold text-violet-600">
              #{subservice.position}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* ------------------- Stats row ------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Price"
          value={`₹${subservice.price ?? '—'}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend="+0%"
        />
        <StatCard
          title="Discount"
          value={subservice.discount ? `${subservice.discount}%` : '—'}
          icon={<Tag className="h-5 w-5" />}
          trend="+0%"
        />
        <StatCard
          title="Hero Banner"
          value={subservice.hero_banner ? 'Yes' : 'No'}
          icon={<FileText className="h-5 w-5" />}
          trend="+0%"
        />
        <StatCard
          title="Image Alt"
          value={
            <p className="text-xl font-bold line-clamp-2 break-words">
              {subservice.image_alt || '—'}
            </p>
          }
          icon={<Package className="h-5 w-5" />}
          trend="+0%"
        />
      </div>

      {/* ------------------- Action buttons ------------------- */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={() => router.push(`/subservices/edit/${subservice.sub_service_slug}`)}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
        >
          Edit Sub-Service
        </Button>
        <Button variant="outline" onClick={() => router.push('/subservices')}>
          Back to List
        </Button>
      </div>
    </ContentLayout>
  );
}