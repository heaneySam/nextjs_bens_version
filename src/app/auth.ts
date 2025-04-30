export type AuthResponse = { user: { id: string; email: string } | null };

// Server-side authentication function
import { cookies } from 'next/headers';
// Backend base URL (configure via env var)
const BACKEND_URL = process.env.BACKEND_URL!;

export async function auth(): Promise<AuthResponse> {
  try {
    // Use the correct async pattern for cookies as per Next.js 15
    const cookieStore = await cookies();
    
    // Get all cookies and convert to cookie header string
    // Note: No need for typecasting as we're using the correct API
    const cookieHeader = cookieStore.getAll()
      .map((cookie: { name: string; value: string })   => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // Call your API route on the Django backend
    const sessionUrl = `${BACKEND_URL}/api/auth/session/`;
    const response = await fetch(sessionUrl, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store', // Important: Disable caching
    });
    
    if (!response.ok) {
      return { user: null };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null };
  }
}



/**
 * Request a magic link for login. Triggers the backend to send a magic link to the user's email.
 * @param email The user's email address
 * @returns The backend response (usually a detail message)
 */
export async function login(email: string): Promise<{ detail: string }> {
  const res = await fetch(`${BACKEND_URL}/api/auth/code/request/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

/**
 * Log out the current user by clearing authentication cookies on the backend.
 * @returns void
 */
export async function logout(): Promise<void> {
  await fetch(`${BACKEND_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Silently refresh the access token using the refresh token in the cookie.
 * @returns void
 */
export async function refreshToken(): Promise<void> {
  // Trigger silent refresh on the Django backend (GET)
  await fetch(`${BACKEND_URL}/api/auth/token/refresh/`, {
    credentials: 'include',
  });
} 