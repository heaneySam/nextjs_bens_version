// Force dynamic rendering so cookies() API is allowed
export const dynamic = 'force-dynamic';

import { ReactNode } from 'react';
// Remove redirect import, no longer needed here
// import { redirect } from 'next/navigation';
import { auth } from '../auth';
import MainLayoutClient from './MainLayoutClient.client';

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
    <MainLayoutClient user={{ email: user?.email ?? '' }}>
      {children}
    </MainLayoutClient>
  );
}
