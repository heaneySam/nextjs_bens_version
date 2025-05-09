'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarBaseProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export default function SidebarBase({
  isOpen,
  onClose,
  children,
  className,
}: SidebarBaseProps) {
  return (
    <>
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white text-gray-800 transition-transform duration-300 ease-in-out md:sticky md:top-16',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200', // Basic dark mode styling
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0', // Ensure it's visible on medium screens and up by default
          className
        )}
      >
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {children}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden dark:bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
} 