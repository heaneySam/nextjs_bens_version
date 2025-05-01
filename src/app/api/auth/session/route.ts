// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Forward incoming browser cookies to the Django session endpoint
  const cookieHeader = request.headers.get('cookie') || '';
  const res = await fetch(`${BACKEND_URL}/api/auth/session/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Cookie': cookieHeader,
    },
    cache: 'no-store',
  });

  // Mirror the JSON response
  const data = await res.json();
  const nextRes = NextResponse.json(data, { status: res.status });

  // Forward any Set-Cookie headers from the backend
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    // Split multiple cookies if needed and append each
    setCookieHeader.split(/,(?=[^;]+=[^;]+)/).forEach(cookieStr => {
      nextRes.headers.append('Set-Cookie', cookieStr);
    });
  }
  return nextRes;
}