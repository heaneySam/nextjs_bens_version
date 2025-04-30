import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const nextPath = url.searchParams.get('next') || '/';
  if (!token) {
    console.warn('[magic confirm proxy] missing token');
    return NextResponse.redirect(new URL('/', request.url));
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const confirmEndpoint = `${apiUrl}/api/auth/magic/confirm/?token=${encodeURIComponent(token)}`;
  console.log('[magic confirm proxy] forwarding token to:', confirmEndpoint);

  const res = await fetch(confirmEndpoint, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    console.warn('[magic confirm proxy] backend confirm failed with status', res.status);
    return NextResponse.redirect(new URL('/', request.url));
  }

  const { access_token, refresh_token } = await res.json();

  // Set cookies and redirect
  const response = NextResponse.redirect(new URL(nextPath, request.url));
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

  response.cookies.set('access_token', access_token, cookieOptions);
  response.cookies.set('refresh_token', refresh_token, cookieOptions);

  return response;
}
