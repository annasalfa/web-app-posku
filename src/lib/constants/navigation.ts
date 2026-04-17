import type {LucideIcon} from 'lucide-react';
import {
  ClipboardList,
  LayoutDashboard,
  Package2,
  Receipt,
  Settings2,
  ShoppingBag,
} from 'lucide-react';

export type NavItem = {
  href: '/' | '/cashier' | '/history' | '/reports' | '/products' | '/settings';
  icon: LucideIcon;
  labelKey: string;
};

export const NAV_ITEMS: NavItem[] = [
  {href: '/', icon: LayoutDashboard, labelKey: 'dashboard'},
  {href: '/cashier', icon: ShoppingBag, labelKey: 'cashier'},
  {href: '/history', icon: Receipt, labelKey: 'history'},
  {href: '/reports', icon: ClipboardList, labelKey: 'reports'},
  {href: '/products', icon: Package2, labelKey: 'products'},
  {href: '/settings', icon: Settings2, labelKey: 'settings'},
];
