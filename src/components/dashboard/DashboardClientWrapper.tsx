'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type AuthResponse } from '@/app/auth'; // Import the type

export default function DashboardClientWrapper({ 
  children 
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
          {
            cache: 'no-store',
            credentials: 'include', // Essential for sending cookies cross-origin
          }
        );

        if (res.ok) {
          const data = await res.json() as AuthResponse;
          if (data.user) {
            setIsVerified(true); // User confirmed client-side
          } else {
            // Session not valid according to backend
            router.replace('/'); // Redirect to login
            return;
          }
        } else {
          // Request failed (network error, backend error)
          router.replace('/'); // Redirect to login
          return;
        }
      } catch (error) {
        console.error('Client-side dashboard session check failed:', error);
        router.replace('/'); // Redirect to login on error
        return;
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [router]);

  if (isLoading) {
    // Optional: Render a loading skeleton or spinner
    return <p className="p-8 text-center">Verifying session...</p>;
  }

  if (!isVerified) {
    // Should have been redirected, but as a fallback, render nothing or an error
    return null; 
  }

  // If verified, render the actual dashboard content passed as children
  return <>{children}</>;
} 