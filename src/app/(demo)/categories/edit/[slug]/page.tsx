'use client';

import { useParams } from 'next/navigation';
import CategoryForm from '../../categoryForm';

export default function EditSubCategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return <CategoryForm slug={slug} />;
}
