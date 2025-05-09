import { redirect } from 'next/navigation';
import { auth } from './auth';
import ClientHomeWrapper from '@/components/auth/LoginContainer.client';

// Add dynamic SSR directive so we forward cookies on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  if (session.user) {
    redirect('/guidelines/search');
  }
  return <ClientHomeWrapper />;
}