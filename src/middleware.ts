import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('access_token')?.value;
  if (tokenCookie) {
    try {
      // Decode JWT payload
      const [, payloadBase64] = tokenCookie.split('.');
      const payloadJson = typeof atob === 'function'
        ? atob(payloadBase64)
        : Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      const now = Math.floor(Date.now() / 1000);
      // If token still valid, allow request
      if (payload.exp > now) {
        return NextResponse.next();
      }
    } catch (e) {
      // If decode fails, treat as expired
    }
  }
  // Missing or expired token: redirect to refresh endpoint
  const refreshUrl = request.nextUrl.clone();
  refreshUrl.pathname = '/api/auth/refresh';
  refreshUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(refreshUrl);
}
