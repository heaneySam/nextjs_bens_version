'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface LoggedInBannerProps {
  email: string;
}

export default function LoggedInBanner({ email }: LoggedInBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('logged_in') === '1') {
      // Clean up URL without reloading
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 w-full text-center">
      You are signed in as <strong>{email}</strong>
    </div>
  );
} 