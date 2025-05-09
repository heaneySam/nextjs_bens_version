'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText } from 'lucide-react'; // Using lucide-react icons
import SidebarBase from '@/components/ui/SidebarBase';
import { cn } from '@/lib/utils';

interface MainAppSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manage-content', label: 'Manage Content', icon: FileText },
  // Add more authenticated app links here if needed
];

export default function MainAppSidebar({ isOpen, onClose }: MainAppSidebarProps) {
  const pathname = usePathname();

  return (
    <SidebarBase isOpen={isOpen} onClose={onClose}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose} // Close sidebar on link click for mobile
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50',
              isActive &&
                'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50 font-medium'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </SidebarBase>
  );
} 