'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm.client';
import ToasterProvider from '@/components/providers/ToasterProvider';
// import Image from 'next/image'; // Removed unused import
import { type AuthResponse } from '@/app/auth'; // Assuming you export this type

export default function ClientHomeWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true); // Optional: prevent flash of login form

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
          // CRITICAL: Include credentials for cross-origin cookie sending
          { cache: 'no-store', credentials: 'include' }
        );

        if (res.ok) {
          const data = (await res.json()) as AuthResponse;
          if (data.user) {
            const redirectPath = searchParams.get('redirectPath');
            router.replace(redirectPath || '/dashboard');
            return; // Stop further processing
          }
        }
      } catch (error) {
        console.error('Client-side session check failed:', error);
      } finally {
          setIsLoading(false); // Finished loading check
      }
    }

    checkSession();
  }, [router, searchParams]);

  // Optional: Show loading state or null while checking
  if (isLoading) {
      return <p className="p-8 text-center">Loading...</p>; // Or some skeleton UI
  }

  // If check finished and user wasn't redirected, show login page content
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ToasterProvider />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        {/* ... rest of your original page content (headings, LoginForm, Image etc) ... */}
        <div className="w-full max-w-7xl mx-auto py-12 sm:py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row lg:items-center lg:gap-x-10">
          {/* Content column */}
          <div className="w-full lg:w-1/2 flex-shrink-0 mb-12 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              UHD Guidelines. Solved.
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
              Comprehensive management of clinical guidelines.
            </p>
            <div className="mt-8 sm:mt-10">
              <LoginForm />
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex-shrink-0 hidden sm:block">
             {/* ... Image component ... */}
             <div className="rounded-md bg-background/5 shadow-2xl ring-1 ring-foreground/10 overflow-hidden">
              {/* <Image
                src="/images/dashboard-preview.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-full h-auto"
                priority
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
