'use client';

import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed top-16 bottom-0 left-0 bg-background border-r transform transition-transform duration-200 ease-in-out z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-full md:w-64 md:translate-x-0 md:static`}
      >
        <nav className="p-6 space-y-4">
          {/* Navigation links */}
          <Link href="/" className="block text-foreground hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="block text-foreground hover:underline">
            Dashboard
          </Link>
          {/* Add more links here */}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && onClose && (
        <div
          className="fixed inset-x-0 top-16 bottom-0 bg-black bg-opacity-50 md:hidden z-10"
          onClick={onClose}
        />
      )}
    </>
  );
} 