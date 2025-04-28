'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ConfirmClient() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No token provided');
      setStatus('error');
      toast.error('Invalid magic link');
      return;
    }

    async function confirmLogin() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/magic/confirm/?format=json`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token }),
          }
        );
        console.log('Response headers:', Array.from(res.headers.entries()));
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Failed to confirm login');
        }
        // Login successful: fetch current user session
        await res.json();
        const sessionRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
          { credentials: 'include' }
        );
        if (!sessionRes.ok) {
          throw new Error('Failed to retrieve user session');
        }
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
        setStatus('success');
        toast.success('Signed in successfully!');
      } catch (err: unknown) {
        console.error('Magic link confirmation error:', err);
        let message = 'Error during sign-in';
        if (err instanceof Error) {
          message = err.message;
        } else if (typeof err === 'string') {
          message = err;
        }
        setError(message);
        setStatus('error');
        toast.error(message);
      }
    }

    confirmLogin();
  }, [token, router]);

  if (status === 'loading') {
    return <p className="p-8 text-center">Confirming your login...</p>;
  }

  if (status === 'error') {
    return <p className="p-8 text-center text-red-600">{error}</p>;
  }

  if (status === 'success' && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold">Welcome, {user.email}!</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your user ID is <strong>{user.id}</strong>
        </p>
        <button
          className="mt-6 rounded bg-primary px-6 py-3 text-white"
          onClick={() => router.replace('/')}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return null;
}
