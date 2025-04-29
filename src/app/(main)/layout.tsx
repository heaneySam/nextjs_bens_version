// Force dynamic rendering so cookies() API is allowed
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '../auth';
import ToasterProvider from '@/components/providers/ToasterProvider';
import Header from '@/components/shared/navigation/header';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const { user } = await auth();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToasterProvider />
      <Header title="Dashboard" email={user.email} />
      <main className="flex-1 max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
