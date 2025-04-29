export type AuthResponse = { user: { id: string; email: string } | null };

// Server-side: forward incoming cookie header for SSR
import { cookies } from 'next/headers';

export async function auth(): Promise<AuthResponse> {
  // Forward 'cookie' header from incoming request
  const cookieStore = await cookies();
  // Build Cookie header manually to avoid dynamic toString()
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
  // Debug: log the cookie header being forwarded for authentication
  console.debug('auth() - forwarded cookie header:', cookieHeader);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session/`,
    { cache: 'no-store', headers: { cookie: cookieHeader } }
  );
  if (!res.ok) {
    return { user: null };
  }
  const data = (await res.json()) as AuthResponse;
  return data;
}

/**
 * Request a magic link for login. Triggers the backend to send a magic link to the user's email.
 * @param email The user's email address
 * @returns The backend response (usually a detail message)
 */
export async function login(email: string): Promise<{ detail: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/code/request/`, {
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
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Silently refresh the access token using the refresh token in the cookie.
 * @returns void
 */
export async function refreshToken(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    credentials: 'include',
  });
} 