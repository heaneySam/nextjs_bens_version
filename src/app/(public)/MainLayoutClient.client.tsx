'use client';

import { ReactNode, useState } from 'react';
import ToasterProvider from '@/components/providers/ToasterProvider';
import PublicHeader from '@/components/shared/navigation/PublicHeader.client';
// import Sidebar from '@/components/shared/navigation/Sidebar.client'; // Old sidebar
import PublicSidebar from '@/components/shared/navigation/PublicSidebar.client'; // New public sidebar
// import { AuthProvider } from '@/components/auth/AuthProvider.client';

interface MainLayoutClientProps {
  children: ReactNode;
}

export default function MainLayoutClient({ children }: MainLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToasterProvider />

      <div className="sticky top-0 z-30 bg-background border-b">
        <PublicHeader title="UHD Guidelines" onMenuToggle={toggleSidebar} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} /> */}
        <PublicSidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

        <main className="flex-1 overflow-auto max-w-7xl mx-auto p-6">
            {children}
        </main>
      </div>
    </div>
  );
} 