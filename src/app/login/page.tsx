import ClientHomeWrapper from '@/components/auth/LoginContainer.client';

// This page can also be dynamically rendered if needed, though for a simple login page, it might not be strictly necessary
// unless ClientHomeWrapper or its children depend on server-side dynamic aspects.
// export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <ClientHomeWrapper />;
} 