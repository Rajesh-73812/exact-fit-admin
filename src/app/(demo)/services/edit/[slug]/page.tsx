'use client';

import { useParams } from 'next/navigation';
import ServiceForm from '../../serviceForm';

export default function EditSubServicePage() {
  const params = useParams();
  const slug = params?.slug as string;

  return <ServiceForm slug={slug} />;
}
