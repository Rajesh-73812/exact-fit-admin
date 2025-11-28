'use client';

import { useParams } from 'next/navigation';
import SubscriptionPlanForm from '../../planForm';

export default function EditPlanPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return <SubscriptionPlanForm slug={slug} />;
}
