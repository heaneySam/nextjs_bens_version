'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, LogIn } from 'lucide-react'; // Added LogIn icon
import SidebarBase from '@/components/ui/SidebarBase';
import { cn } from '@/lib/utils';

interface PublicSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/clinical_guidelines', label: 'Search Guidelines', icon: Search },
  { href: '/login', label: 'Admin Login', icon: LogIn }, // Added Admin Login link
  // Add more public links here if needed
];

export default function PublicSidebar({ isOpen, onClose }: PublicSidebarProps) {
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