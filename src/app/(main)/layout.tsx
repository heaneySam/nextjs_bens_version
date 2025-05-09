// Force dynamic rendering so cookies() API is allowed
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
// import { cookies } from 'next/headers'; // No longer needed here
// Remove redirect import, no longer needed here
// import { redirect } from 'next/navigation';
import { auth } from '../auth';
import MainLayoutClient from './MainLayoutClient.client';
// import { RiskClass } from '@/types/risk'; // No longer needed here

interface MainLayoutProps {
  children: ReactNode;
}


export default async function MainLayout({ children }: MainLayoutProps) {
  // Fetch only user
  const { user } = await auth();

  return (
    // Pass user object, converting null to undefined
    <MainLayoutClient user={user || undefined}> 
      {children}
    </MainLayoutClient>
  );
}
