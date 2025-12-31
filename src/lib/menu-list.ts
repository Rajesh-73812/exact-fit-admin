import {
  Users,
  Settings,
  Bookmark,
  LayoutGrid,
  LucideIcon,
  BookmarkMinus,
  Image,
  UserCog,
  IndianRupee,
  House,
} from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  permission?: string;
};

type Menu = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(
  permissions: string[],
  role: string
): Group[] {
  const isSuperAdmin = role === 'superadmin';

  const has = (p?: string) =>
    isSuperAdmin || !p || permissions.includes(p);

  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutGrid,
          permission: 'dashboard:view',
        },
      ].filter(m => has(m.permission)),
    },
    {
      groupLabel: 'Catalog',
      menus: [
        { href: '/services', label: 'Services', icon: Bookmark, permission: 'services:view' },
        { href: '/subservices', label: 'Sub Services', icon: BookmarkMinus, permission: 'subservices:view' },
        { href: '/banners/list', label: 'Banners', icon: Image, permission: 'banners:view' },
        { href: '/technicians', label: 'Technicians', icon: UserCog, permission: 'technicians:view' },
        { href: '/customers', label: 'Customers', icon: Users, permission: 'customers:view' },
      ].filter(m => has(m.permission)),
    },
    {
      groupLabel: 'Business',
      menus: [
        { href: '/plans', label: 'Plans', icon: IndianRupee, permission: 'plans:view' },
        { href: '/property', label: 'Property', icon: House, permission: 'property:view' },
      ].filter(m => has(m.permission)),
    },
    {
      groupLabel: 'Bookings',
      menus: [
        { href: '/bookings/subscriptions', label: 'Subscriptions', icon: IndianRupee, permission: 'booking:view' },
        { href: '/bookings/enquiry', label: 'Enquiry', icon: House, permission: 'booking:view' },
        { href: '/bookings/emergency', label: 'Emergency', icon: House, permission: 'booking:view' },
      ].filter(m => has(m.permission)),
    },
    {
      groupLabel: 'Settings',
      menus: [
        { href: '/admin', label: 'Admin', icon: Users, permission: 'admin:view' },
        { href: '/account', label: 'Account', icon: Settings, permission: 'account:view' },
      ].filter(m => has(m.permission)),
    },
  ];
}
