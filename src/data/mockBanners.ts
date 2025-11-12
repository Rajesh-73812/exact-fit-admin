// src/data/mockBanners.ts
import { v4 as uuidv4 } from 'uuid';

export type BannerSection = 'homepage' | 'about us' | 'contact us' | 'services';

export interface Banner {
  id: string;
  name: string;
  image: string;
  is_active: boolean;
  priority: number;
  section: BannerSection;
}

export const mockBanners: Banner[] = [
  {
    id: uuidv4(),
    name: 'Summer Sale - Homepage',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
    is_active: true,
    priority: 1,
    section: 'homepage',
  },
  {
    id: uuidv4(),
    name: 'About Our Team',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
    is_active: true,
    priority: 2,
    section: 'about us',
  },
  {
    id: uuidv4(),
    name: 'Contact Us Banner',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
    is_active: false,
    priority: 3,
    section: 'contact us',
  },
  {
    id: uuidv4(),
    name: 'Emergency Services',
    image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1200&h=600&fit=crop',
    is_active: true,
    priority: 1,
    section: 'services',
  },
];