'use client';

import { useParams } from 'next/navigation';
import AdminForm from '../../AdminForm';

export default function EditSubCategoryPage() {
  const params = useParams();
  const id = params?.id as string;

  return <AdminForm id={id} />;
}
