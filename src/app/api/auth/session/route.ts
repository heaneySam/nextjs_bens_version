// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const sessionEndpoint = `${apiUrl}/api/auth/session/`;
  
  const cookieHeader = request.headers.get('cookie') || '';
  const res = await fetch(sessionEndpoint, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}