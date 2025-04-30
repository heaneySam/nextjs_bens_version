import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Extract token from query
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Token missing' }, { status: 400 });
  }

  // Call backend confirm endpoint for JSON response
  const res = await fetch(`${BACKEND_URL}/api/auth/magic/confirm/?token=${token}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  const tokenData = await res.json();
  if (!res.ok) {
    return NextResponse.json(tokenData, { status: res.status });
  }

  // Set HttpOnly cookies on frontend domain
  const nextRes = NextResponse.redirect(new URL('/', request.url));
  nextRes.cookies.set('access_token', tokenData.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  nextRes.cookies.set('refresh_token', tokenData.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });

  return nextRes;
}
