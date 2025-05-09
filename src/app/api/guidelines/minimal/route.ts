import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Disable caching for this proxy
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Forward cookies and query params to the backend
  const incoming = await headers();
  const cookie = incoming.get('cookie') || '';
  const url = new URL(request.url);
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/guidelines/minimal${url.search}`;
  const backendRes = await fetch(backendUrl, {
    headers: { cookie },
    cache: 'no-store',
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}