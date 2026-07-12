import { Home, ShoppingBag, BookOpen, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Shop',
    href: '/shop',
    icon: ShoppingBag,
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: BookOpen,
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: Mail,
  },
];

export const footerLinks = {
  company: [
    { label: 'About Us', href: '/#story' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  shop: [
    { label: 'All Products', href: '/shop' },
  ],
};
