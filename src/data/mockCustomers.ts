// src/data/mockCustomers.ts
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
  profile_pic?: string;
  fullname: string;
  email: string;
  mobile: string;
  role: 'customer';
  subscription_plan_id?: string;
  plan_start_date?: string;
  plan_end_date?: string;
  last_login?: string;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected';
  addresses: Array<{
    emirate: string;
    area: string;
    appartment: string;
    addtional_address: string;
    location: string;
  }>;
}

export const mockCustomers: Customer[] = [
  {
    id: uuidv4(),
    profile_pic: 'https://randomuser.me/api/portraits/men/32.jpg',
    fullname: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    mobile: '+971501234567',
    role: 'customer',
    subscription_plan_id: 'plan_premium_001',
    plan_start_date: '2025-01-01',
    plan_end_date: '2025-12-31',
    last_login: '2025-11-11T10:30:00Z',
    is_active: true,
    status: 'approved',
    addresses: [
      {
        emirate: 'Dubai',
        area: 'Downtown',
        appartment: 'Apt 1201, Burj Vista',
        addtional_address: 'Near Dubai Mall',
        location: 'https://maps.google.com/?q=25.1972,55.2744',
      },
    ],
  },
  {
    id: uuidv4(),
    fullname: 'Priya Patel',
    email: 'priya.patel@example.com',
    mobile: '+971507654321',
    role: 'customer',
    plan_start_date: '2025-03-15',
    plan_end_date: '2026-03-14',
    last_login: '2025-11-10T08:15:00Z',
    is_active: true,
    status: 'approved',
    addresses: [
      {
        emirate: 'Abu Dhabi',
        area: 'Al Reem Island',
        appartment: 'Tower 5, Apt 803',
        addtional_address: '',
        location: 'https://maps.google.com/?q=24.4936,54.4062',
      },
    ],
  },
  {
    id: uuidv4(),
    profile_pic: 'https://randomuser.me/api/portraits/women/44.jpg',
    fullname: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    mobile: '+971509876543',
    role: 'customer',
    is_active: false,
    status: 'pending',
    addresses: [
      {
        emirate: 'Sharjah',
        area: 'Al Majaz',
        appartment: 'Villa 12',
        addtional_address: 'Near Lagoon',
        location: 'https://maps.google.com/?q=25.3337,55.3922',
      },
    ],
  },
];