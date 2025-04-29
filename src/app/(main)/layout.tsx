// Force dynamic rendering so cookies() API is allowed
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
// Remove redirect import, no longer needed here
// import { redirect } from 'next/navigation';
import { auth } from '../auth';
import ToasterProvider from '@/components/providers/ToasterProvider';
import Header from '@/components/shared/navigation/header';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  // Still fetch user info if possible, but don't redirect here
  const { user } = await auth(); 
  
  // Remove the blocking redirect
  // if (!user) {
  //   redirect('/');
  // }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToasterProvider />
      {/* Pass user email conditionally or handle null in Header */}
      <Header title="Dashboard" email={user?.email ?? ''} />
      <main className="flex-1 max-w-7xl mx-auto p-6">
        {/* The page content (including DashboardClientWrapper) will render here */} 
        {/* DashboardClientWrapper will handle the client-side redirect if needed */}
        {children}
      </main>
    </div>
  );
}
