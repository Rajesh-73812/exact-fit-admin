'use client';

import { useParams } from 'next/navigation';
import PropertyForm from '../../propertyForm';

export default function EditPropertyPage() {
  const params = useParams();
  const id = params?.slug as string;

  return <PropertyForm slug={id} />;
}
