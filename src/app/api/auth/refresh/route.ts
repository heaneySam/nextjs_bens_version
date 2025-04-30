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

  // Set the renewed access token as HttpOnly cookie on the front-end domain
  const secureCookie = process.env.NODE_ENV === 'production';
  // Strongly typed cookie options
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'none';
    path: string;
    domain?: string;
  } = {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'none',
    path: '/',
  };
  const cookieDomain = process.env.FRONTEND_COOKIE_DOMAIN;
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }
  response.cookies.set('access_token', newAccessToken, cookieOptions);

  return response;
} 