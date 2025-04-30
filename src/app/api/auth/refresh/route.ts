import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  // Backend endpoint for token refresh
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const refreshEndpoint = `${apiUrl}/api/auth/token/refresh/`;

  // Forward the incoming cookies (including refresh_token) to the backend
  const cookieHeader = request.headers.get('cookie') || '';
  console.log('Refresh API route invoked. Forwarding cookies:', cookieHeader);

  const res = await fetch(refreshEndpoint, {
    method: 'POST',
    headers: { cookie: cookieHeader },
  });

  if (!res.ok) {
    // If refresh fails, redirect to login page
    console.warn('Backend token refresh failed with status', res.status);
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Parse the new access token from backend response
  const { access_token: newAccessToken } = await res.json();

  // Determine the post-refresh redirect destination
  const url = new URL(request.url);
  const nextPath = url.searchParams.get('next') || '/';

  // Prepare a redirect response
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  // Set the renewed access token as HttpOnly cookie
  response.cookies.set('access_token', newAccessToken, {
    httpOnly: true,
    // In production, use secure cookies with SameSite=None; in development, use lax, non-secure cookies
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  return response;
} 