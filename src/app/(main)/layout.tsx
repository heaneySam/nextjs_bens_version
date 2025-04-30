// Force dynamic rendering so cookies() API is allowed
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
// Remove redirect import, no longer needed here
// import { redirect } from 'next/navigation';
import { auth } from '../auth';
import ToasterProvider from '@/components/providers/ToasterProvider';
import Header from '@/components/shared/navigation/header';
import { AuthProvider } from '@/components/providers/AuthProvider';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  // Still fetch user info if possible for initial header render, but don't block/redirect
  const { user } = await auth(); 
  
  // Remove the blocking redirect
  // if (!user) {
  //   redirect('/');
  // }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToasterProvider />
      {/* Header might initially render without user, AuthProvider updates trigger re-render */}
      <Header title="Dashboard" email={user?.email ?? ''} />
      <main className="flex-1 max-w-7xl mx-auto p-6">
        {/* Wrap children with the client-side AuthProvider */}
        {/* AuthProvider will handle client-side verification and redirects */}
        <AuthProvider>
          {/* The page content (including DashboardClientWrapper) will render here */} 
          {/* DashboardClientWrapper will handle the client-side redirect if needed */}
          {children}
        </AuthProvider>
      </main>
    </div>
  );
}
