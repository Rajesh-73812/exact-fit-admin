'use client';

import { useParams } from 'next/navigation';
import SubServiceForm from '../../subServiceForm';

export default function EditSubServicePage() {
  const params = useParams();
  const slug = params?.slug as string;

  return <SubServiceForm slug={slug} />;
}
