'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type AuthResponse } from '@/app/auth';

type AuthContextType = {
  user: AuthResponse['user'];
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function verifySession() {
      try {
        const sessionUrl = '/api/auth/session';
        const refreshUrl = '/api/auth/token/refresh';
        // Initial session check
        let res = await fetch(sessionUrl, { cache: 'no-store', credentials: 'include' });
        let data: AuthResponse | null = null;
        if (res.ok) {
          data = (await res.json()) as AuthResponse;
          // If no user, attempt refresh and re-fetch
          if (!data.user) {
            const refreshRes = await fetch(refreshUrl, { method: 'POST', cache: 'no-store', credentials: 'include' });
            if (refreshRes.ok) {
              res = await fetch(sessionUrl, { cache: 'no-store', credentials: 'include' });
              if (res.ok) {
                data = (await res.json()) as AuthResponse;
              }
            }
          }
        }
        // Final evaluation
        if (res.ok && data) {
          setUser(data.user);
          if (!data.user) {
            router.replace('/');
            return;
          }
        } else {
          setUser(null);
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('AuthProvider session check failed:', error);
        setUser(null);
        router.replace('/');
        return;
      } finally {
        setIsLoading(false);
      }
    }
    verifySession();
  }, [router]);

  const isAuthenticated = !!user;

  // Render loading state while checking, prevent rendering children until verified or redirected
  if (isLoading) {
     return <p className="p-8 text-center">Verifying session...</p>;
  }

  // Don't render children if not authenticated (should have redirected)
  if (!isAuthenticated && !isLoading){
      return null; // Or fallback UI if redirect fails? Usually null is fine.
  }


  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
