'use client';

import { ReactNode, useState } from 'react';
import ToasterProvider from '@/components/providers/ToasterProvider';
import Header from '@/components/shared/navigation/Header.client';
import Sidebar from '@/components/shared/navigation/Sidebar.client';
import { AuthProvider } from '@/components/auth/AuthProvider.client';

interface MainLayoutClientProps {
  children: ReactNode;
  user: { email: string };
}

export default function MainLayoutClient({ children, user }: MainLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToasterProvider />

      <div className="sticky top-0 z-30 bg-background border-b">
        <Header title="UHD Guidelines" email={user.email} onMenuToggle={toggleSidebar} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

        <main className="flex-1 overflow-auto max-w-7xl mx-auto p-6">
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
      </div>
    </div>
  );
} 